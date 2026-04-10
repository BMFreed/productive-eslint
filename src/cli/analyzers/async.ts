import type { ESLint, Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import pluginTs from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

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

const ASYNC_RULES = {
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/return-await': [
    'error',
    'error-handling-correctness-only',
  ],
  'no-async-promise-executor': 'error',
  'promise/always-return': 'error',
  'promise/catch-or-return': 'error',
  'promise/no-multiple-resolved': 'error',
  'promise/no-return-in-finally': 'error',
  'promise/valid-params': 'error',
} as const satisfies Linter.RulesRecord

const TYPESCRIPT_ESLINT_PLUGIN = pluginTs as unknown as ESLint.Plugin

const ASYNC_RULE_IDS = Object.keys(ASYNC_RULES)

interface IAsyncRuleProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const ASYNC_RULE_PROFILES: Record<string, IAsyncRuleProfile> = {
  '@typescript-eslint/await-thenable': {
    category: 'likely-bug',
    labels: ['likely-bug', 'await-non-thenable'],
    reason: 'Awaiting a non-thenable value usually means async intent drifted.',
    score: 5,
    severity: 'high',
  },
  '@typescript-eslint/no-floating-promises': {
    category: 'likely-bug',
    labels: ['likely-bug', 'floating-promise'],
    reason: 'A promise can reject without any handling path.',
    score: 6,
    severity: 'high',
  },
  '@typescript-eslint/no-misused-promises': {
    category: 'likely-bug',
    labels: ['likely-bug', 'misused-promise'],
    reason:
      'Async behavior is flowing through an API shape that is usually not promise-safe.',
    score: 6,
    severity: 'high',
  },
  '@typescript-eslint/require-await': {
    category: 'suspicious-flow',
    labels: ['suspicious-flow', 'unneeded-async'],
    reason:
      'An async function without await can make callers assume async work or error boundaries that are not present.',
    score: 3,
    severity: 'medium',
  },
  '@typescript-eslint/return-await': {
    category: 'suspicious-flow',
    labels: ['suspicious-flow', 'return-await-error-boundary'],
    reason:
      'Returning a promise without await can bypass the local async error boundary.',
    score: 4,
    severity: 'medium',
  },
  'no-async-promise-executor': {
    category: 'likely-bug',
    labels: ['likely-bug', 'async-executor'],
    reason:
      'Async promise executors often hide rejected work and double-resolution hazards.',
    score: 5,
    severity: 'high',
  },
  'promise/always-return': {
    category: 'suspicious-flow',
    labels: ['suspicious-flow', 'incomplete-chain'],
    reason: 'A promise callback does not consistently return its async result.',
    score: 3,
    severity: 'medium',
  },
  'promise/catch-or-return': {
    category: 'suspicious-flow',
    labels: ['suspicious-flow', 'missing-catch'],
    reason: 'The promise chain does not make error handling explicit.',
    score: 4,
    severity: 'medium',
  },
  'promise/no-multiple-resolved': {
    category: 'lifecycle-hazard',
    labels: ['lifecycle-hazard', 'multiple-resolve'],
    reason: 'The same promise can resolve or reject more than once.',
    score: 5,
    severity: 'high',
  },
  'promise/no-return-in-finally': {
    category: 'lifecycle-hazard',
    labels: ['lifecycle-hazard', 'finally-control-flow'],
    reason:
      'Returning from finally can suppress or replace earlier async outcomes.',
    score: 4,
    severity: 'high',
  },
  'promise/valid-params': {
    category: 'likely-bug',
    labels: ['likely-bug', 'invalid-promise-api'],
    reason: 'Promise APIs are being called with invalid argument shapes.',
    score: 4,
    severity: 'medium',
  },
}

const TEST_FILE_PATTERN = /(^|\/)(test|tests|__tests__|__mocks__)\//u

const TEST_FILE_SUFFIX_PATTERN = /\.(spec|test)\.(c|m)?[jt]sx?$/u

const SHARED_FILE_PATTERN = /(^|\/)(shared|lib|libs|utils|helpers|api)\//u

const isTestFile = (file: string): boolean =>
  TEST_FILE_PATTERN.test(file) || TEST_FILE_SUFFIX_PATTERN.test(file)

const isSharedAsyncSurface = (file: string): boolean =>
  SHARED_FILE_PATTERN.test(file)

const applyAsyncOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer
    .clone()
    .append({
      files: [GLOB_VUE],
      languageOptions: {
        parserOptions: {
          extraFileExtensions: ['.vue'],
          parser: tsParser,
          projectService: true,
          sourceType: 'module',
        },
      },
      name: 'productive-eslint/analyze-async-vue-parser',
    })
    .append({
      files: [GLOB_SRC, GLOB_VUE],
      name: 'productive-eslint/analyze-async',
      plugins: {
        '@typescript-eslint': TYPESCRIPT_ESLINT_PLUGIN,
      },
      rules: ASYNC_RULES,
    })

const toAsyncFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !ASYNC_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const profile = ASYNC_RULE_PROFILES[message.ruleId]

  if (!profile) {
    return null
  }

  const testFile = isTestFile(file)
  const sharedSurface = !testFile && isSharedAsyncSurface(file)
  const adjustedScore = Math.max(
    1,
    profile.score + (sharedSurface ? 2 : 0) - (testFile ? 2 : 0),
  )
  const labels = [
    ...profile.labels,
    ...(sharedSurface ? ['shared-surface'] : []),
    ...(testFile ? ['test-only'] : []),
  ]
  const reasons = [
    profile.reason,
    message.message,
    ...(sharedSurface
      ? [
          'The finding sits in a shared async surface that can affect multiple callers.',
        ]
      : []),
    ...(testFile
      ? [
          'The finding is test-only, so urgency is usually lower than production code.',
        ]
      : []),
  ]

  return {
    category: profile.category,
    column: message.column,
    confidence: 'high',
    file,
    labels,
    line: message.line,
    reasons,
    ruleId: message.ruleId,
    score: adjustedScore,
    severity: profile.severity,
  }
}

export const analyzeAsync = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyAsyncOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: ASYNC_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toAsyncFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const likelyBugCount = findings.filter(
    (finding) => finding.category === 'likely-bug',
  ).length
  const suspiciousFlowCount = findings.filter(
    (finding) => finding.category === 'suspicious-flow',
  ).length
  const lifecycleHazardCount = findings.filter(
    (finding) => finding.category === 'lifecycle-hazard',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and make the async control flow explicit there first.`
      : 'No async reliability findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Likely bug findings: \`${likelyBugCount}\``,
      `Suspicious flow findings: \`${suspiciousFlowCount}\``,
      `Lifecycle hazard findings: \`${lifecycleHazardCount}\``,
    ],
    title: 'Async Analysis',
  }
}
