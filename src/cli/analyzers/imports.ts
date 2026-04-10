import type { ESLint, Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import pluginTs from '@typescript-eslint/eslint-plugin'
import pluginImport from 'eslint-plugin-import'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerGroup,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import { GLOB_SRC, GLOB_VUE } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

const IMPORT_RULES = {
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      disallowTypeAnnotations: false,
      fixStyle: 'separate-type-imports',
      prefer: 'type-imports',
    },
  ],
  'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  'import/no-cycle': ['error', { ignoreExternal: true, maxDepth: 10 }],
  'import/no-duplicates': 'error',
  'import/no-mutable-exports': 'error',
  'import/no-namespace': 'error',
  'import/no-relative-packages': 'error',
  'import/no-self-import': 'error',
  'import/no-useless-path-segments': 'error',
} as const satisfies Linter.RulesRecord

const IMPORT_PLUGIN = pluginImport as unknown as ESLint.Plugin
const TYPESCRIPT_ESLINT_PLUGIN = pluginTs as unknown as ESLint.Plugin

const IMPORT_RULE_IDS = Object.keys(IMPORT_RULES)

interface IImportProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const IMPORT_PROFILES: Record<string, IImportProfile> = {
  '@typescript-eslint/consistent-type-imports': {
    category: 'type-value-boundary',
    labels: ['type-value-boundary', 'mechanical-fix'],
    reason:
      'Mixed type and value imports make dependency intent harder to scan.',
    score: 2,
    severity: 'low',
  },
  'import/consistent-type-specifier-style': {
    category: 'type-value-boundary',
    labels: ['type-value-boundary', 'mechanical-fix'],
    reason: 'Inline type specifiers make import shape less consistent.',
    score: 1,
    severity: 'low',
  },
  'import/no-cycle': {
    category: 'dependency-graph',
    labels: ['dependency-graph', 'cycle'],
    reason:
      'Import cycles increase coupling and can create initialization hazards.',
    score: 7,
    severity: 'high',
  },
  'import/no-duplicates': {
    category: 'local-import-hygiene',
    labels: ['local-import-hygiene', 'mechanical-fix'],
    reason:
      'Duplicate imports are local dependency noise and are usually mechanical to merge.',
    score: 2,
    severity: 'low',
  },
  'import/no-mutable-exports': {
    category: 'public-contract-risk',
    labels: ['public-contract-risk', 'mutable-export'],
    reason: 'Mutable exports make module contracts harder to reason about.',
    score: 5,
    severity: 'medium',
  },
  'import/no-namespace': {
    category: 'dependency-shape',
    labels: ['dependency-shape', 'namespace-import'],
    reason:
      'Namespace imports can hide which dependency surface is actually used.',
    score: 2,
    severity: 'low',
  },
  'import/no-relative-packages': {
    category: 'package-boundary',
    labels: ['package-boundary', 'relative-package-import'],
    reason:
      'Relative package imports bypass package boundaries and published entrypoints.',
    score: 6,
    severity: 'high',
  },
  'import/no-self-import': {
    category: 'dependency-graph',
    labels: ['dependency-graph', 'self-import'],
    reason: 'A module importing itself indicates broken dependency shape.',
    score: 6,
    severity: 'high',
  },
  'import/no-useless-path-segments': {
    category: 'local-import-hygiene',
    labels: ['local-import-hygiene', 'mechanical-fix'],
    reason:
      'Useless path segments make imports harder to compare and maintain.',
    score: 1,
    severity: 'low',
  },
}

const applyImportsOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer.clone().append({
    files: [GLOB_SRC, GLOB_VUE],
    name: 'productive-eslint/analyze-imports',
    plugins: {
      '@typescript-eslint': TYPESCRIPT_ESLINT_PLUGIN,
      import: IMPORT_PLUGIN,
    },
    rules: IMPORT_RULES,
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
  })

const toImportsFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !IMPORT_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const profile = IMPORT_PROFILES[message.ruleId]

  if (!profile) {
    return null
  }

  return {
    category: profile.category,
    column: message.column,
    confidence: 'high',
    file,
    labels: profile.labels,
    line: message.line,
    reasons: [profile.reason, message.message],
    ruleId: message.ruleId,
    score: profile.score,
    severity: profile.severity,
  }
}

const summarizeImportGroups = (
  findings: IAnalyzerFinding[],
): IAnalyzerGroup[] =>
  [
    ...findings.reduce((groups, finding) => {
      const label = finding.category ?? 'uncategorized'
      groups.set(label, (groups.get(label) ?? 0) + 1)
      return groups
    }, new Map<string, number>()),
  ]
    .map(([label, count]) => ({ count, label }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label),
    )

export const analyzeImports = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyImportsOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: IMPORT_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toImportsFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const cycleCount = findings.filter((finding) =>
    finding.labels?.includes('cycle'),
  ).length
  const packageBoundaryCount = findings.filter(
    (finding) => finding.category === 'package-boundary',
  ).length
  const mechanicalFixCount = findings.filter((finding) =>
    finding.labels?.includes('mechanical-fix'),
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\`; fix cycles and package-boundary findings before mechanical import cleanup.`
      : 'No import-shape findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Import cycle findings: \`${cycleCount}\``,
      `Package-boundary findings: \`${packageBoundaryCount}\``,
      `Mechanical import fixes: \`${mechanicalFixCount}\``,
    ],
    title: 'Imports Analysis',
    topGroups: summarizeImportGroups(findings),
  }
}
