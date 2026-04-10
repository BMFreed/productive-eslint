import type { ESLint, Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import pluginTs from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import pluginImport from 'eslint-plugin-import'

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

const API_RULES = {
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  'import/no-mutable-exports': 'error',
  'no-restricted-syntax': [
    'error',
    {
      message:
        'Default exports make public API naming less explicit and harder to refactor.',
      selector: 'ExportDefaultDeclaration',
    },
  ],
} as const satisfies Linter.RulesRecord

const IMPORT_PLUGIN = pluginImport as unknown as ESLint.Plugin
const TYPESCRIPT_ESLINT_PLUGIN = pluginTs as unknown as ESLint.Plugin

const API_RULE_IDS = Object.keys(API_RULES)

interface IApiProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const API_PROFILES: Record<string, IApiProfile> = {
  '@typescript-eslint/explicit-module-boundary-types': {
    category: 'public-signature',
    labels: ['public-signature', 'missing-return-type'],
    reason: 'An exported boundary should make its return contract explicit.',
    score: 5,
    severity: 'medium',
  },
  '@typescript-eslint/no-explicit-any': {
    category: 'public-type-safety',
    labels: ['public-type-safety', 'explicit-any'],
    reason: 'Explicit any in public-facing code weakens downstream contracts.',
    score: 6,
    severity: 'high',
  },
  '@typescript-eslint/no-unsafe-return': {
    category: 'public-type-safety',
    labels: ['public-type-safety', 'unsafe-return'],
    reason:
      'Unsafe returns can leak unknown runtime shape through an API boundary.',
    score: 6,
    severity: 'high',
  },
  'import/no-mutable-exports': {
    category: 'public-mutability',
    labels: ['public-mutability', 'mutable-export'],
    reason:
      'Mutable exports make public module state difficult to reason about.',
    score: 5,
    severity: 'medium',
  },
  'no-restricted-syntax': {
    category: 'export-policy',
    labels: ['export-policy', 'default-export'],
    reason:
      'Default exports make public API naming less explicit and harder to refactor.',
    score: 2,
    severity: 'low',
  },
}

const PUBLIC_ENTRY_PATTERN = /(^|\/)(index|public-api)\.(c|m)?[jt]sx?$/u
const SHARED_SURFACE_PATTERN = /(^|\/)(api|public|shared|lib|components)\//u
const VUE_COMPONENT_PATTERN = /\.vue$/u

const classifyApiSurface = (
  file: string,
  baseScore: number,
): { labels: string[]; reasons: string[]; score: number } => {
  const labels: string[] = []
  const reasons: string[] = []
  let score = baseScore

  if (PUBLIC_ENTRY_PATTERN.test(file)) {
    labels.push('public-entry')
    reasons.push('This file looks like a public entrypoint.')
    score += 3
  }

  if (SHARED_SURFACE_PATTERN.test(file)) {
    labels.push('shared-surface')
    reasons.push('The file sits in a shared or API-facing surface.')
    score += 2
  }

  if (VUE_COMPONENT_PATTERN.test(file)) {
    labels.push('vue-component-contract')
    reasons.push(
      'A Vue component file can expose props, emits, slots, or bindings.',
    )
    score += 2
  }

  return { labels, reasons, score }
}

const applyApiOverlay = (
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
      name: 'productive-eslint/analyze-api-vue-parser',
    })
    .append({
      files: [GLOB_SRC, GLOB_VUE],
      name: 'productive-eslint/analyze-api',
      plugins: {
        '@typescript-eslint': TYPESCRIPT_ESLINT_PLUGIN,
        import: IMPORT_PLUGIN,
      },
      rules: API_RULES,
      settings: {
        'import/resolver': {
          typescript: true,
        },
      },
    })

const toApiFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !API_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const profile = API_PROFILES[message.ruleId]

  if (!profile) {
    return null
  }

  const surface = classifyApiSurface(file, profile.score)

  return {
    category: profile.category,
    column: message.column,
    confidence: 'high',
    file,
    labels: [...profile.labels, ...surface.labels],
    line: message.line,
    reasons: [profile.reason, message.message, ...surface.reasons],
    ruleId: message.ruleId,
    score: surface.score,
    severity: profile.severity,
  }
}

export const analyzeApi = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyApiOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: API_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toApiFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const publicTypeSafetyCount = findings.filter(
    (finding) => finding.category === 'public-type-safety',
  ).length
  const signatureCount = findings.filter(
    (finding) => finding.category === 'public-signature',
  ).length
  const exportPolicyCount = findings.filter(
    (finding) => finding.category === 'export-policy',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and make exported contracts explicit before changing internal implementation details.`
      : 'No public API contract findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Public type-safety findings: \`${publicTypeSafetyCount}\``,
      `Public signature findings: \`${signatureCount}\``,
      `Export policy findings: \`${exportPolicyCount}\``,
    ],
    title: 'API Analysis',
  }
}
