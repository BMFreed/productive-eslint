import type { ESLint, Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import tailwindcssPlugin from 'eslint-plugin-tailwindcss'
import path from 'node:path'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import {
  createTailwindSettings,
  tailwindCliRules,
} from '../../config/tailwind.feature'
import { GLOB_TSX, GLOB_VUE } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

interface ITailwindProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const TAILWIND_RULES = {
  ...tailwindCliRules,
} as const satisfies Linter.RulesRecord

const TAILWIND_PLUGIN = tailwindcssPlugin as unknown as ESLint.Plugin
const TAILWIND_RULE_IDS = Object.keys(TAILWIND_RULES)

const TAILWIND_PROFILES = {
  'tailwindcss/no-contradicting-classname': {
    category: 'contradicting-utility',
    labels: ['contradicting-utility', 'conflicting-classes'],
    reason:
      'Contradicting utilities make the final visual outcome harder to predict and review.',
    score: 4,
    severity: 'medium',
  },
  'tailwindcss/no-custom-classname': {
    category: 'unknown-utility',
    labels: ['unknown-utility', 'non-tailwind-class'],
    reason:
      'Unknown utility names often indicate typos, missing design tokens, or drift from the intended Tailwind surface.',
    score: 4,
    severity: 'medium',
  },
  'tailwindcss/no-unnecessary-arbitrary-value': {
    category: 'unnecessary-arbitrary-value',
    labels: ['unnecessary-arbitrary-value', 'prefer-scale-token'],
    reason:
      'Arbitrary values that already exist in the design scale make the utility surface harder to standardize.',
    score: 3,
    severity: 'low',
  },
} satisfies Record<string, ITailwindProfile>

type TTailwindRuleId = keyof typeof TAILWIND_PROFILES

const applyTailwindOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): FlatConfigComposer<Linter.Config> => {
  if (!context.capabilities?.tailwind.enabled) {
    throw new CliError(
      'Tailwind analysis requires `createConfig({ tailwind: { cssConfigPath } })` in the target project.',
    )
  }

  return composer.clone().append({
    files: context.capabilities.tailwind.vueTemplates
      ? [GLOB_TSX, GLOB_VUE]
      : [GLOB_TSX],
    name: 'productive-eslint/analyze-tailwind',
    plugins: {
      tailwindcss: TAILWIND_PLUGIN,
    },
    rules: TAILWIND_RULES,
    settings: createTailwindSettings({
      cssConfigPath: path.resolve(
        context.cwd,
        context.capabilities.tailwind.cssConfigPath,
      ),
    }),
  })
}

const toTailwindFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !TAILWIND_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const ruleId = message.ruleId as TTailwindRuleId
  const profile = TAILWIND_PROFILES[ruleId]

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
    ruleId,
    score: profile.score,
    severity: profile.severity,
  }
}

export const analyzeTailwind = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  if (!context.capabilities) {
    throw new CliError(
      'Tailwind analysis requires productive-eslint runtime capabilities.',
    )
  }

  const config = await applyTailwindOverlay(composer, context).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: TAILWIND_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toTailwindFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const contradictingCount = findings.filter(
    (finding) => finding.category === 'contradicting-utility',
  ).length
  const arbitraryValueCount = findings.filter(
    (finding) => finding.category === 'unnecessary-arbitrary-value',
  ).length
  const unknownUtilityCount = findings.filter(
    (finding) => finding.category === 'unknown-utility',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and remove contradictory or off-scale utility usage there first.`
      : 'No Tailwind utility findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Contradicting utility findings: \`${contradictingCount}\``,
      `Unnecessary arbitrary value findings: \`${arbitraryValueCount}\``,
      `Unknown utility findings: \`${unknownUtilityCount}\``,
    ],
    title: 'Tailwind Analysis',
  }
}
