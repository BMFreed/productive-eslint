import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import { GLOB_SRC, GLOB_VUE } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

const SUPPRESSION_RULES = {
  '@typescript-eslint/ban-ts-comment': [
    'error',
    {
      minimumDescriptionLength: 10,
      'ts-check': false,
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
      'ts-nocheck': true,
    },
  ],
  'eslint-comments/no-aggregating-enable': 'error',
  'eslint-comments/no-duplicate-disable': 'error',
  'eslint-comments/no-unlimited-disable': 'error',
  'eslint-comments/no-unused-enable': 'error',
} as const satisfies Linter.RulesRecord

const SUPPRESSION_RULE_IDS = Object.keys(SUPPRESSION_RULES)

interface ISuppressionProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

interface IFileSuppressionContext {
  isSharedSurface: boolean
  isTest: boolean
  suppressionCount: number
}

const TEST_FILE_PATTERN = /(^|\/)(test|tests|__tests__|__mocks__)\//u

const TEST_FILE_SUFFIX_PATTERN = /\.(spec|test)\.(c|m)?[jt]sx?$/u

const SHARED_FILE_PATTERN = /(^|\/)(shared|lib|libs|utils|helpers|api)\//u

const SUPPRESSION_TOKEN_PATTERN =
  /eslint-disable|eslint-enable|@ts-(?:ignore|expect-error|nocheck|check)/gu

const UNUSED_DISABLE_PATTERN = /^Unused eslint-disable directive/u

const UNUSED_DISABLE_PROFILE: ISuppressionProfile = {
  category: 'unused-disable',
  labels: ['unused-disable', 'stale-suppression'],
  reason:
    'The disable directive no longer suppresses anything and should be removed.',
  score: 4,
  severity: 'medium',
}

const RULE_PROFILES: Record<string, ISuppressionProfile> = {
  '@typescript-eslint/ban-ts-comment': {
    category: 'ts-directive',
    labels: ['ts-directive', 'compiler-suppression'],
    reason:
      'A TypeScript compiler directive is muting or weakening type feedback.',
    score: 4,
    severity: 'medium',
  },
  'eslint-comments/no-aggregating-enable': {
    category: 'aggregated-enable',
    labels: ['aggregated-enable', 'scope-confusion'],
    reason:
      'One eslint-enable is reopening multiple disables, which makes suppression scope harder to reason about.',
    score: 3,
    severity: 'medium',
  },
  'eslint-comments/no-duplicate-disable': {
    category: 'duplicate-disable',
    labels: ['duplicate-disable', 'redundant-suppression'],
    reason: 'The same rule is being disabled more than once in the same area.',
    score: 3,
    severity: 'medium',
  },
  'eslint-comments/no-unlimited-disable': {
    category: 'broad-disable',
    labels: ['broad-disable', 'wide-suppression'],
    reason:
      'An eslint-disable comment is muting every rule instead of naming the specific exception.',
    score: 6,
    severity: 'high',
  },
  'eslint-comments/no-unused-enable': {
    category: 'unused-enable',
    labels: ['unused-enable', 'stale-suppression'],
    reason:
      'The eslint-enable directive is not paired with an active disable and should be cleaned up.',
    score: 2,
    severity: 'low',
  },
}

const isTestFile = (file: string): boolean =>
  TEST_FILE_PATTERN.test(file) || TEST_FILE_SUFFIX_PATTERN.test(file)

const isSharedSurfaceFile = (file: string): boolean =>
  SHARED_FILE_PATTERN.test(file)

const loadFileSuppressionContext = async (
  cwd: string,
  file: string,
): Promise<IFileSuppressionContext> => {
  const sourceText = await readFile(path.join(cwd, file), 'utf8')
  const suppressionCount =
    sourceText.match(SUPPRESSION_TOKEN_PATTERN)?.length ?? 0

  return {
    isSharedSurface: isSharedSurfaceFile(file),
    isTest: isTestFile(file),
    suppressionCount,
  }
}

const applySuppressionsOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer
    .clone()
    .append({
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      name: 'productive-eslint/analyze-suppressions-options',
    })
    .append({
      files: [GLOB_SRC, GLOB_VUE],
      name: 'productive-eslint/analyze-suppressions',
      rules: SUPPRESSION_RULES,
    })

const getTsDirectiveProfile = (
  message: Linter.LintMessage,
): ISuppressionProfile => {
  if (message.message.includes('@ts-ignore')) {
    return {
      category: 'ts-ignore',
      labels: ['ts-ignore', 'compiler-suppression'],
      reason:
        'ts-ignore suppresses the next compiler error even when the code stops failing later.',
      score: 6,
      severity: 'high',
    }
  }

  if (message.message.includes('@ts-nocheck')) {
    return {
      category: 'ts-nocheck',
      labels: ['ts-nocheck', 'file-wide-suppression'],
      reason:
        'ts-nocheck suppresses type checking for the whole file and tends to hide deeper debt.',
      score: 7,
      severity: 'high',
    }
  }

  if (message.message.includes('@ts-expect-error')) {
    return {
      category: 'weak-ts-expect-error',
      labels: ['ts-expect-error', 'weak-description'],
      reason:
        'ts-expect-error without a useful explanation makes the suppressed type debt harder to revisit safely.',
      score: 4,
      severity: 'medium',
    }
  }

  return (
    RULE_PROFILES['@typescript-eslint/ban-ts-comment'] ?? {
      category: 'ts-directive',
      labels: ['ts-directive', 'compiler-suppression'],
      reason:
        'A TypeScript compiler directive is muting or weakening type feedback.',
      score: 4,
      severity: 'medium',
    }
  )
}

const toSuppressionFinding = (
  file: string,
  message: Linter.LintMessage,
  context: IFileSuppressionContext,
): IAnalyzerFinding | null => {
  const profile =
    !message.ruleId && UNUSED_DISABLE_PATTERN.test(message.message)
      ? UNUSED_DISABLE_PROFILE
      : message.ruleId === '@typescript-eslint/ban-ts-comment'
        ? getTsDirectiveProfile(message)
        : message.ruleId
          ? RULE_PROFILES[message.ruleId]
          : null

  if (!profile) {
    return null
  }

  const labels = [
    ...profile.labels,
    ...(context.isSharedSurface ? ['shared-surface'] : []),
    ...(context.isTest ? ['test-only'] : []),
    ...(context.suppressionCount >= 3 ? ['dense-suppressions'] : []),
  ]
  const reasons = [
    profile.reason,
    message.message,
    ...(context.isSharedSurface
      ? [
          'The suppression sits in a shared surface, so it can hide issues for multiple callers.',
        ]
      : []),
    ...(context.isTest
      ? [
          'The suppression is test-only, so cleanup urgency is usually lower than production code.',
        ]
      : []),
    ...(context.suppressionCount >= 3
      ? [
          `This file already contains ${context.suppressionCount} suppression directives, which usually points to accumulated local debt.`,
        ]
      : []),
  ]
  const score = Math.max(
    1,
    profile.score +
      (context.isSharedSurface ? 2 : 0) +
      (context.isTest ? -2 : 0) +
      (context.suppressionCount >= 3 ? 1 : 0),
  )

  return {
    category: profile.category,
    column: message.column,
    confidence: message.ruleId ? 'high' : 'medium',
    file,
    labels,
    line: message.line,
    reasons,
    ruleId: message.ruleId ?? 'eslint/unused-disable-directive',
    score,
    severity: profile.severity,
  }
}

export const analyzeSuppressions = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applySuppressionsOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: SUPPRESSION_RULE_IDS,
  })
  const relevantResults = results.filter((result) =>
    result.messages.some(
      (message) =>
        (!message.ruleId && UNUSED_DISABLE_PATTERN.test(message.message)) ||
        (message.ruleId
          ? SUPPRESSION_RULE_IDS.includes(message.ruleId)
          : false),
    ),
  )
  const fileContexts = new Map<string, IFileSuppressionContext>()

  await Promise.all(
    relevantResults.map(async (result) => {
      fileContexts.set(
        result.filePath,
        await loadFileSuppressionContext(context.cwd, result.filePath),
      )
    }),
  )

  const findings = relevantResults.flatMap((result) =>
    result.messages.flatMap((message) => {
      const fileContext = fileContexts.get(result.filePath)

      if (!fileContext) {
        return []
      }

      const finding = toSuppressionFinding(
        result.filePath,
        message,
        fileContext,
      )
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const unusedDirectiveCount = findings.filter(
    (finding) =>
      finding.category === 'unused-disable' ||
      finding.category === 'unused-enable',
  ).length
  const broadDisableCount = findings.filter(
    (finding) => finding.category === 'broad-disable',
  ).length
  const tsDirectiveCount = findings.filter((finding) =>
    finding.labels?.includes('compiler-suppression'),
  ).length
  const denseFileCount = summaries.filter((summary) =>
    summary.labels?.includes('dense-suppressions'),
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and remove stale or broad suppressions there before touching lower-risk files.`
      : 'No suppression findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Unused directive findings: \`${unusedDirectiveCount}\``,
      `Broad disable findings: \`${broadDisableCount}\``,
      `TypeScript directive findings: \`${tsDirectiveCount}\``,
      `Dense suppression files: \`${denseFileCount}\``,
    ],
    title: 'Suppressions Analysis',
  }
}
