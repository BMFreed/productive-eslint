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

const DEAD_CODE_RULES = {
  '@typescript-eslint/no-unused-private-class-members': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'after-used',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      ignoreRestSiblings: true,
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-useless-constructor': 'error',
  'no-unreachable': 'error',
  'no-useless-catch': 'error',
  'unicorn/no-empty-file': 'error',
  'unicorn/no-static-only-class': 'error',
  'unicorn/no-useless-undefined': 'error',
  'unused-imports/no-unused-imports': 'error',
} as const satisfies Linter.RulesRecord

const TYPESCRIPT_ESLINT_PLUGIN = pluginTs as unknown as ESLint.Plugin

const DEAD_CODE_RULE_IDS = Object.keys(DEAD_CODE_RULES)

interface IDeadCodeProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const DEAD_CODE_PROFILES: Record<string, IDeadCodeProfile> = {
  '@typescript-eslint/no-unused-private-class-members': {
    category: 'safe-delete-candidate',
    labels: ['safe-delete-candidate', 'private-member'],
    reason:
      'A private class member appears unused and is usually safe to delete.',
    score: 4,
    severity: 'medium',
  },
  '@typescript-eslint/no-unused-vars': {
    category: 'safe-delete-candidate',
    labels: ['safe-delete-candidate', 'unused-symbol'],
    reason: 'An unused local symbol adds maintenance noise.',
    score: 3,
    severity: 'medium',
  },
  '@typescript-eslint/no-useless-constructor': {
    category: 'safe-delete-candidate',
    labels: ['safe-delete-candidate', 'useless-constructor'],
    reason: 'A constructor does not add behavior beyond the inherited default.',
    score: 3,
    severity: 'low',
  },
  'no-unreachable': {
    category: 'likely-bug-or-delete',
    labels: ['likely-bug-or-delete', 'unreachable'],
    reason: 'Unreachable code is either dead or hides a control-flow mistake.',
    score: 6,
    severity: 'high',
  },
  'no-useless-catch': {
    category: 'safe-delete-candidate',
    labels: ['safe-delete-candidate', 'useless-catch'],
    reason: 'A catch block only rethrows and can usually be removed.',
    score: 3,
    severity: 'low',
  },
  'unicorn/no-empty-file': {
    category: 'safe-delete-candidate',
    labels: ['safe-delete-candidate', 'empty-file'],
    reason:
      'An empty source file is usually leftover migration or scaffolding debt.',
    score: 4,
    severity: 'medium',
  },
  'unicorn/no-static-only-class': {
    category: 'requires-judgment',
    labels: ['requires-judgment', 'static-only-class'],
    reason:
      'A static-only class may be a namespace-shaped leftover rather than useful API.',
    score: 2,
    severity: 'low',
  },
  'unicorn/no-useless-undefined': {
    category: 'safe-delete-candidate',
    labels: ['safe-delete-candidate', 'redundant-undefined'],
    reason: 'A redundant undefined usually has no semantic value.',
    score: 1,
    severity: 'low',
  },
  'unused-imports/no-unused-imports': {
    category: 'mechanical-delete',
    labels: ['mechanical-delete', 'unused-import'],
    reason: 'An unused import can be removed mechanically.',
    score: 2,
    severity: 'low',
  },
}

const TEST_FILE_PATTERN = /(^|\/)(test|tests|__tests__|__mocks__)\//u
const TEST_FILE_SUFFIX_PATTERN = /\.(spec|test)\.(c|m)?[jt]sx?$/u

const isTestFile = (file: string): boolean =>
  TEST_FILE_PATTERN.test(file) || TEST_FILE_SUFFIX_PATTERN.test(file)

const applyDeadCodeOverlay = (
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
      name: 'productive-eslint/analyze-dead-code-vue-parser',
    })
    .append({
      files: [GLOB_SRC, GLOB_VUE],
      name: 'productive-eslint/analyze-dead-code',
      plugins: {
        '@typescript-eslint': TYPESCRIPT_ESLINT_PLUGIN,
      },
      rules: DEAD_CODE_RULES,
    })

const toDeadCodeFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !DEAD_CODE_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const profile = DEAD_CODE_PROFILES[message.ruleId]

  if (!profile) {
    return null
  }

  const testFile = isTestFile(file)

  return {
    category: testFile ? 'test-only' : profile.category,
    column: message.column,
    confidence: profile.category === 'requires-judgment' ? 'medium' : 'high',
    file,
    labels: [...profile.labels, ...(testFile ? ['test-only'] : [])],
    line: message.line,
    reasons: [
      profile.reason,
      message.message,
      ...(testFile
        ? ['The finding is test-only, so deletion priority is usually lower.']
        : []),
    ],
    ruleId: message.ruleId,
    score: Math.max(1, profile.score - (testFile ? 2 : 0)),
    severity: testFile ? 'low' : profile.severity,
  }
}

export const analyzeDeadCode = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyDeadCodeOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: DEAD_CODE_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toDeadCodeFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const mechanicalDeleteCount = findings.filter((finding) =>
    finding.labels?.includes('mechanical-delete'),
  ).length
  const safeDeleteCount = findings.filter((finding) =>
    finding.labels?.includes('safe-delete-candidate'),
  ).length
  const judgmentCount = findings.filter(
    (finding) => finding.category === 'requires-judgment',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and remove the mechanical dead-code findings before touching judgment-heavy cleanup.`
      : 'No dead-code findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Mechanical deletion findings: \`${mechanicalDeleteCount}\``,
      `Safe-delete candidates: \`${safeDeleteCount}\``,
      `Requires judgment findings: \`${judgmentCount}\``,
    ],
    title: 'Dead Code Analysis',
  }
}
