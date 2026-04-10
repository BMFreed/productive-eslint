import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerReport,
} from '../runtime/report-types'

import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

const TYPE_ANALYZER_RULES = {
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
} as const satisfies Linter.RulesRecord

const TYPE_ANALYZER_RULE_IDS = Object.keys(TYPE_ANALYZER_RULES)

const RULE_REASON_MAP: Record<string, string> = {
  '@typescript-eslint/ban-ts-comment':
    'Type suppression hides an actual type-system signal.',
  '@typescript-eslint/no-explicit-any':
    'Explicit any weakens the local type boundary.',
  '@typescript-eslint/no-unsafe-assignment':
    'Unsafe assignment can spread an untyped value further.',
  '@typescript-eslint/no-unsafe-call':
    'Unsafe call means runtime behavior depends on an untyped value.',
  '@typescript-eslint/no-unsafe-member-access':
    'Unsafe member access depends on unchecked runtime shape.',
  '@typescript-eslint/no-unsafe-return':
    'Unsafe return leaks a weakly typed value through an API boundary.',
}

const RULE_SCORE_MAP: Record<string, number> = {
  '@typescript-eslint/ban-ts-comment': 5,
  '@typescript-eslint/no-explicit-any': 4,
  '@typescript-eslint/no-unsafe-assignment': 3,
  '@typescript-eslint/no-unsafe-call': 3,
  '@typescript-eslint/no-unsafe-member-access': 3,
  '@typescript-eslint/no-unsafe-return': 4,
}

const RULE_SEVERITY_MAP: Record<string, IAnalyzerFinding['severity']> = {
  '@typescript-eslint/ban-ts-comment': 'high',
  '@typescript-eslint/no-explicit-any': 'high',
  '@typescript-eslint/no-unsafe-assignment': 'medium',
  '@typescript-eslint/no-unsafe-call': 'medium',
  '@typescript-eslint/no-unsafe-member-access': 'medium',
  '@typescript-eslint/no-unsafe-return': 'high',
}

interface IExportedRange {
  endLine: number
  startLine: number
}

interface IFileRiskContext {
  exportedRanges: IExportedRange[]
  hasExports: boolean
  isSharedUtility: boolean
  isTest: boolean
  isVueComponent: boolean
  vueContractLines: number[]
}

interface ITypeClassification {
  category: string
  labels: string[]
  reason: string
  scoreDelta: number
}

const TEST_FILE_PATTERN = /(^|\/)(test|tests|__tests__|__mocks__)\//u

const TEST_FILE_SUFFIX_PATTERN = /\.(spec|test)\.(mts|ts|tsx)$/u

const SHARED_UTILITY_PATTERN = /(^|\/)(shared|lib|libs|utils|helpers)\//u
const VUE_COMPONENT_PATTERN = /\.vue$/u
const VUE_COMPONENT_DIR_PATTERN = /(^|\/)(components|ui)\//u

const VUE_CONTRACT_PATTERNS = [
  /\bdefineProps\s*</u,
  /\bdefineProps\s*\(/u,
  /\bdefineEmits\s*</u,
  /\bdefineEmits\s*\(/u,
  /\bdefineSlots\s*</u,
  /\bdefineSlots\s*\(/u,
  /\bdefineExpose\s*\(/u,
  /\bdefineModel\s*</u,
  /\bdefineModel\s*\(/u,
  /\bdefineComponent\s*\(/u,
]

const EXPORT_RELEVANT_RULE_IDS = new Set([
  '@typescript-eslint/no-explicit-any',
  '@typescript-eslint/no-unsafe-return',
])

const getScriptKind = (filePath: string): ts.ScriptKind => {
  if (filePath.endsWith('.tsx')) {
    return ts.ScriptKind.TSX
  }

  return ts.ScriptKind.TS
}

const hasExportModifier = (node: ts.Node): boolean =>
  (ts.getCombinedModifierFlags(node as ts.Declaration) &
    ts.ModifierFlags.Export) !==
  0

const collectExportedRanges = (sourceFile: ts.SourceFile): IExportedRange[] =>
  sourceFile.statements.flatMap((statement) => {
    if (
      ts.isExportAssignment(statement) ||
      ts.isExportDeclaration(statement) ||
      hasExportModifier(statement)
    ) {
      const start =
        sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile))
          .line + 1
      const end =
        sourceFile.getLineAndCharacterOfPosition(statement.getEnd()).line + 1

      return [{ endLine: end, startLine: start }]
    }

    return []
  })

const collectVueContractLines = (sourceText: string): number[] =>
  sourceText
    .split('\n')
    .flatMap((line, index) =>
      VUE_CONTRACT_PATTERNS.some((pattern) => pattern.test(line))
        ? [index + 1]
        : [],
    )

const loadFileRiskContext = async (
  cwd: string,
  file: string,
): Promise<IFileRiskContext> => {
  const absolutePath = path.join(cwd, file)
  const sourceText = await readFile(absolutePath, 'utf8')
  const isVueComponent = VUE_COMPONENT_PATTERN.test(file)

  if (isVueComponent) {
    const vueContractLines = collectVueContractLines(sourceText)

    return {
      exportedRanges: [],
      hasExports: vueContractLines.length > 0,
      isSharedUtility:
        SHARED_UTILITY_PATTERN.test(file) ||
        VUE_COMPONENT_DIR_PATTERN.test(file),
      isTest:
        TEST_FILE_PATTERN.test(file) || TEST_FILE_SUFFIX_PATTERN.test(file),
      isVueComponent: true,
      vueContractLines,
    }
  }

  const sourceFile = ts.createSourceFile(
    absolutePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(absolutePath),
  )
  const exportedRanges = collectExportedRanges(sourceFile)

  return {
    exportedRanges,
    hasExports: exportedRanges.length > 0,
    isSharedUtility: SHARED_UTILITY_PATTERN.test(file),
    isTest: TEST_FILE_PATTERN.test(file) || TEST_FILE_SUFFIX_PATTERN.test(file),
    isVueComponent: false,
    vueContractLines: [],
  }
}

const isLineInsideExportedRange = (
  line: number | undefined,
  exportedRanges: IExportedRange[],
): boolean =>
  line !== undefined &&
  exportedRanges.some(
    (range) => line >= range.startLine && line <= range.endLine,
  )

const isNearVueContractLine = (
  line: number | undefined,
  contractLines: number[],
): boolean =>
  line !== undefined &&
  contractLines.some((contractLine) => Math.abs(contractLine - line) <= 2)

const classifyFinding = (
  context: IFileRiskContext,
  finding: IAnalyzerFinding,
): ITypeClassification => {
  if (context.isTest) {
    return {
      category: 'test-only',
      labels: ['test-only'],
      reason: 'Test-only type holes usually have lower migration urgency.',
      scoreDelta: -2,
    }
  }

  if (
    EXPORT_RELEVANT_RULE_IDS.has(finding.ruleId ?? '') &&
    isLineInsideExportedRange(finding.line, context.exportedRanges)
  ) {
    return {
      category: 'exported-api',
      labels: ['exported-api'],
      reason:
        'The finding sits inside an exported declaration and can leak outward.',
      scoreDelta: 4,
    }
  }

  if (
    context.isVueComponent &&
    EXPORT_RELEVANT_RULE_IDS.has(finding.ruleId ?? '') &&
    isNearVueContractLine(finding.line, context.vueContractLines)
  ) {
    return {
      category: 'vue-component-contract',
      labels: ['vue-component-contract'],
      reason:
        'The finding appears near a Vue component contract and can leak through props, emits, or exposed bindings.',
      scoreDelta: 4,
    }
  }

  if (context.isVueComponent && context.isSharedUtility) {
    return {
      category: 'shared-vue-component',
      labels: ['shared-vue-component'],
      reason:
        'Shared Vue components can spread weak typing through reusable props and emits contracts.',
      scoreDelta: 2,
    }
  }

  if (context.hasExports && path.basename(finding.file) === 'index.ts') {
    return {
      category: 'public-entry',
      labels: ['public-entry'],
      reason:
        'The file looks like a public entrypoint, so weak typing spreads quickly.',
      scoreDelta: 3,
    }
  }

  if (context.isSharedUtility) {
    return {
      category: 'shared-utility',
      labels: ['shared-utility'],
      reason:
        'Shared utilities tend to amplify weak typing across multiple callers.',
      scoreDelta: 2,
    }
  }

  return {
    category: 'internal',
    labels: ['internal'],
    reason: 'The finding appears to be internal implementation detail.',
    scoreDelta: 0,
  }
}

const applyTypesOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer.clone().append({
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    name: 'productive-eslint/analyze-types',
    rules: TYPE_ANALYZER_RULES,
  })

const messageToFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !TYPE_ANALYZER_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  return {
    category: 'internal',
    column: message.column,
    confidence: 'high',
    file,
    labels: [],
    line: message.line,
    reasons: [
      RULE_REASON_MAP[message.ruleId] ?? message.message,
      message.message,
    ],
    ruleId: message.ruleId,
    score: RULE_SCORE_MAP[message.ruleId] ?? 1,
    severity: RULE_SEVERITY_MAP[message.ruleId] ?? 'low',
  }
}

export const analyzeTypes = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  const config = await applyTypesOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: TYPE_ANALYZER_RULE_IDS,
  })
  const fileRiskContexts = new Map<string, IFileRiskContext>()

  await Promise.all(
    results.map(async (result) => {
      fileRiskContexts.set(
        result.filePath,
        await loadFileRiskContext(context.cwd, result.filePath),
      )
    }),
  )

  const findings = results.flatMap((result) => {
    const fileRiskContext = fileRiskContexts.get(result.filePath)

    return result.messages.flatMap((message) => {
      const finding = messageToFinding(result.filePath, message)

      if (!finding || !fileRiskContext) {
        return finding ? [finding] : []
      }

      const classification = classifyFinding(fileRiskContext, finding)
      const enrichedFinding: IAnalyzerFinding = {
        ...finding,
        category: classification.category,
        labels: [
          ...new Set([...(finding.labels ?? []), ...classification.labels]),
        ],
        reasons: [...finding.reasons, classification.reason],
        score: Math.max(1, finding.score + classification.scoreDelta),
      }

      return [enrichedFinding]
    })
  })

  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const exportedFindings = findings.filter(
    (finding) =>
      finding.category === 'exported-api' ||
      finding.category === 'public-entry',
  ).length
  const vueContractFindings = findings.filter(
    (finding) =>
      finding.category === 'vue-component-contract' ||
      finding.category === 'shared-vue-component',
  ).length
  const sharedUtilityFindings = findings.filter(
    (finding) => finding.category === 'shared-utility',
  ).length
  const testFindings = findings.filter(
    (finding) => finding.category === 'test-only',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and remove the highest-scoring type holes first.`
      : 'No type-vulnerability findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Exported or public-surface findings: \`${exportedFindings}\``,
      `Vue component contract findings: \`${vueContractFindings}\``,
      `Shared-utility findings: \`${sharedUtilityFindings}\``,
      `Test-only findings: \`${testFindings}\``,
    ],
    title: 'Types Analysis',
  }
}
