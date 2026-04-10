import type { ESLint, Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import pluginRxjs from '@smarttools/eslint-plugin-rxjs'

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

const SOURCE_MIGRATION_RULES = {
  '@typescript-eslint/no-deprecated': 'error',
  'import/no-deprecated': 'error',
  'n/no-deprecated-api': 'error',
} as const satisfies Linter.RulesRecord

const RXJS_MIGRATION_RULES = {
  'productive-rxjs/no-compat': 'error',
  'productive-rxjs/no-create': 'error',
  'productive-rxjs/no-topromise': 'error',
} as const satisfies Linter.RulesRecord

const VUE_MIGRATION_RULES = {
  'vue/no-deprecated-data-object-declaration': 'error',
  'vue/no-deprecated-delete-set': 'error',
  'vue/no-deprecated-destroyed-lifecycle': 'error',
  'vue/no-deprecated-dollar-listeners-api': 'error',
  'vue/no-deprecated-dollar-scopedslots-api': 'error',
  'vue/no-deprecated-events-api': 'error',
  'vue/no-deprecated-filter': 'error',
  'vue/no-deprecated-functional-template': 'error',
  'vue/no-deprecated-html-element-is': 'error',
  'vue/no-deprecated-inline-template': 'error',
  'vue/no-deprecated-model-definition': 'error',
  'vue/no-deprecated-props-default-this': 'error',
  'vue/no-deprecated-router-link-tag-prop': 'error',
  'vue/no-deprecated-scope-attribute': 'error',
  'vue/no-deprecated-slot-attribute': 'error',
  'vue/no-deprecated-slot-scope-attribute': 'error',
  'vue/no-deprecated-v-bind-sync': 'error',
  'vue/no-deprecated-v-is': 'error',
  'vue/no-deprecated-v-on-native-modifier': 'error',
  'vue/no-deprecated-v-on-number-modifiers': 'error',
  'vue/no-deprecated-vue-config-keycodes': 'error',
} as const satisfies Linter.RulesRecord

const MIGRATION_RULE_IDS = [
  ...Object.keys(SOURCE_MIGRATION_RULES),
  ...Object.keys(RXJS_MIGRATION_RULES),
  ...Object.keys(VUE_MIGRATION_RULES),
]

const RXJS_PLUGIN = pluginRxjs as unknown as ESLint.Plugin

const RULE_ID_ALIAS_MAP: Record<string, string> = {
  'productive-rxjs/no-compat': 'rxjs/no-compat',
  'productive-rxjs/no-create': 'rxjs/no-create',
  'productive-rxjs/no-topromise': 'rxjs/no-topromise',
}

interface IMigrationProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const getMigrationProfile = (ruleId: string): IMigrationProfile => {
  if (ruleId.startsWith('vue/no-deprecated-')) {
    return {
      category: 'vue-migration',
      labels: ['vue-migration', 'deprecated-api'],
      reason:
        'Deprecated Vue API usage should be removed before framework upgrades.',
      score: 4,
      severity: 'medium',
    }
  }

  if (ruleId.startsWith('@typescript-eslint/')) {
    return {
      category: 'typescript-migration',
      labels: ['typescript-migration', 'deprecated-api'],
      reason:
        'Deprecated TypeScript symbols should be migrated before they become harder to trace.',
      score: 4,
      severity: 'medium',
    }
  }

  if (ruleId.startsWith('import/')) {
    return {
      category: 'dependency-migration',
      labels: ['dependency-migration', 'deprecated-api'],
      reason:
        'Deprecated imported APIs should be removed before dependency upgrades.',
      score: 4,
      severity: 'medium',
    }
  }

  if (ruleId.startsWith('rxjs/')) {
    return {
      category: 'rxjs-migration',
      labels: ['rxjs-migration', 'deprecated-api'],
      reason:
        'RxJS toPromise is deprecated and blocks clean reactive upgrades.',
      score: 4,
      severity: 'medium',
    }
  }

  return {
    category: 'node-migration',
    labels: ['node-migration', 'deprecated-api'],
    reason: 'Deprecated Node APIs should be removed before runtime upgrades.',
    score: 4,
    severity: 'medium',
  }
}

const applyMigrationsOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer
    .clone()
    .append({
      files: [GLOB_SRC],
      name: 'productive-eslint/analyze-migrations-source',
      rules: SOURCE_MIGRATION_RULES,
    })
    .append({
      files: [GLOB_SRC],
      name: 'productive-eslint/analyze-migrations-rxjs',
      plugins: {
        'productive-rxjs': RXJS_PLUGIN,
      },
      rules: RXJS_MIGRATION_RULES,
    })
    .append({
      files: [GLOB_VUE],
      name: 'productive-eslint/analyze-migrations-vue',
      rules: VUE_MIGRATION_RULES,
    })

const toMigrationFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !MIGRATION_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const ruleId = RULE_ID_ALIAS_MAP[message.ruleId] ?? message.ruleId
  const profile = getMigrationProfile(ruleId)

  return {
    category: profile.category,
    column: message.column,
    confidence: 'high',
    file,
    labels: profile.labels,
    line: message.line,
    reasons: [profile.reason, message.message],
    ruleId,
    score: profile.score,
    severity: profile.severity,
  }
}

export const analyzeMigrations = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyMigrationsOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: MIGRATION_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toMigrationFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const vueCount = findings.filter(
    (finding) => finding.category === 'vue-migration',
  ).length
  const rxjsCount = findings.filter(
    (finding) => finding.category === 'rxjs-migration',
  ).length
  const nodeCount = findings.filter(
    (finding) => finding.category === 'node-migration',
  ).length
  const typescriptCount = findings.filter(
    (finding) => finding.category === 'typescript-migration',
  ).length
  const dependencyCount = findings.filter(
    (finding) => finding.category === 'dependency-migration',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and remove deprecated APIs before planning larger framework upgrades.`
      : 'No migration-tail findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Vue migration findings: \`${vueCount}\``,
      `RxJS migration findings: \`${rxjsCount}\``,
      `Node migration findings: \`${nodeCount}\``,
      `TypeScript migration findings: \`${typescriptCount}\``,
      `Dependency migration findings: \`${dependencyCount}\``,
    ],
    title: 'Migrations Analysis',
  }
}
