import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import { GLOB_VUE } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

const VUE_RULES = {
  'vue/no-arrow-functions-in-watch': 'error',
  'vue/no-async-in-computed-properties': 'error',
  'vue/no-expose-after-await': 'error',
  'vue/no-lifecycle-after-await': 'error',
  'vue/no-mutating-props': 'error',
  'vue/no-ref-object-reactivity-loss': 'error',
  'vue/no-required-prop-with-default': 'error',
  'vue/no-side-effects-in-computed-properties': 'error',
  'vue/no-use-v-if-with-v-for': 'error',
  'vue/no-v-html': 'error',
  'vue/no-watch-after-await': 'error',
  'vue/require-explicit-emits': 'error',
  'vue/require-typed-object-prop': 'error',
  'vue/require-typed-ref': 'error',
  'vue/require-v-for-key': 'error',
  'vue/valid-v-html': 'error',
} as const satisfies Linter.RulesRecord

const VUE_RULE_IDS = Object.keys(VUE_RULES)

interface IVueProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const VUE_PROFILES: Record<string, IVueProfile> = {
  'vue/no-arrow-functions-in-watch': {
    category: 'reactivity-hazard',
    labels: ['reactivity-hazard', 'watch-this-binding'],
    reason:
      'Arrow functions in watchers can lose the component instance binding expected by Options API code.',
    score: 4,
    severity: 'medium',
  },
  'vue/no-async-in-computed-properties': {
    category: 'reactivity-hazard',
    labels: ['reactivity-hazard', 'async-computed'],
    reason:
      'Async work inside computed properties makes reactivity timing unreliable.',
    score: 6,
    severity: 'high',
  },
  'vue/no-expose-after-await': {
    category: 'lifecycle-hazard',
    labels: ['lifecycle-hazard', 'expose-after-await'],
    reason:
      'Bindings exposed after await can miss the synchronous setup contract.',
    score: 5,
    severity: 'medium',
  },
  'vue/no-lifecycle-after-await': {
    category: 'lifecycle-hazard',
    labels: ['lifecycle-hazard', 'lifecycle-after-await'],
    reason:
      'Lifecycle hooks registered after await can miss component setup timing.',
    score: 5,
    severity: 'medium',
  },
  'vue/no-mutating-props': {
    category: 'component-contract',
    labels: ['component-contract', 'prop-mutation'],
    reason: 'Prop mutation breaks parent-owned component contracts.',
    score: 6,
    severity: 'high',
  },
  'vue/no-ref-object-reactivity-loss': {
    category: 'reactivity-hazard',
    labels: ['reactivity-hazard', 'ref-reactivity-loss'],
    reason:
      'Destructuring or extracting ref object values can disconnect code from reactivity updates.',
    score: 5,
    severity: 'medium',
  },
  'vue/no-required-prop-with-default': {
    category: 'component-contract',
    labels: ['component-contract', 'required-prop-default'],
    reason:
      'A prop cannot be both required from the parent and owned by a local default contract.',
    score: 4,
    severity: 'medium',
  },
  'vue/no-side-effects-in-computed-properties': {
    category: 'reactivity-hazard',
    labels: ['reactivity-hazard', 'computed-side-effect'],
    reason:
      'Computed properties should stay pure so dependency tracking remains predictable.',
    score: 6,
    severity: 'high',
  },
  'vue/no-use-v-if-with-v-for': {
    category: 'template-correctness',
    labels: ['template-correctness', 'v-if-with-v-for'],
    reason:
      'Combining v-if and v-for on one element can produce surprising render behavior.',
    score: 4,
    severity: 'medium',
  },
  'vue/no-v-html': {
    category: 'security',
    labels: ['security', 'unsafe-html'],
    reason:
      'Raw HTML rendering can expose XSS risk when input is not fully trusted.',
    score: 7,
    severity: 'high',
  },
  'vue/no-watch-after-await': {
    category: 'lifecycle-hazard',
    labels: ['lifecycle-hazard', 'watch-after-await'],
    reason:
      'Watchers registered after await can miss component lifecycle cleanup expectations.',
    score: 5,
    severity: 'medium',
  },
  'vue/require-explicit-emits': {
    category: 'component-contract',
    labels: ['component-contract', 'emits-contract'],
    reason:
      'Component events should be declared as part of the public contract.',
    score: 4,
    severity: 'medium',
  },
  'vue/require-typed-object-prop': {
    category: 'component-contract',
    labels: ['component-contract', 'object-prop-type'],
    reason:
      'Object props should declare their runtime shape precisely enough for safe component use.',
    score: 4,
    severity: 'medium',
  },
  'vue/require-typed-ref': {
    category: 'component-contract',
    labels: ['component-contract', 'ref-type'],
    reason:
      'Untyped refs weaken component state contracts and make later reactive reads ambiguous.',
    score: 3,
    severity: 'medium',
  },
  'vue/require-v-for-key': {
    category: 'template-correctness',
    labels: ['template-correctness', 'missing-key'],
    reason:
      'Missing keys make list updates harder for Vue to reconcile safely.',
    score: 4,
    severity: 'medium',
  },
  'vue/valid-v-html': {
    category: 'template-correctness',
    labels: ['template-correctness', 'invalid-v-html'],
    reason: 'Invalid v-html usage points to a broken template contract.',
    score: 4,
    severity: 'medium',
  },
}

const applyVueOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer.clone().append({
    files: [GLOB_VUE],
    name: 'productive-eslint/analyze-vue',
    rules: VUE_RULES,
  })

const toVueFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !VUE_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const profile = VUE_PROFILES[message.ruleId]

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

export const analyzeVue = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyVueOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: VUE_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toVueFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const contractCount = findings.filter(
    (finding) => finding.category === 'component-contract',
  ).length
  const reactivityCount = findings.filter(
    (finding) => finding.category === 'reactivity-hazard',
  ).length
  const securityCount = findings.filter(
    (finding) => finding.category === 'security',
  ).length
  const lifecycleCount = findings.filter(
    (finding) => finding.category === 'lifecycle-hazard',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and fix component contract or reactivity hazards before template style cleanup.`
      : 'No Vue semantic findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Component contract findings: \`${contractCount}\``,
      `Reactivity hazard findings: \`${reactivityCount}\``,
      `Lifecycle hazard findings: \`${lifecycleCount}\``,
      `Security findings: \`${securityCount}\``,
    ],
    title: 'Vue Analysis',
  }
}
