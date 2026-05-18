import type { ESLint, Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import pluginRxjs from '@smarttools/eslint-plugin-rxjs'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import { GLOB_SRC } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

const RXJS_RULES = {
  'rxjs/no-async-subscribe': 'error',
  'rxjs/no-exposed-subjects': 'error',
  'rxjs/no-ignored-error': 'error',
  'rxjs/no-ignored-notifier': 'error',
  'rxjs/no-ignored-observable': 'error',
  'rxjs/no-ignored-replay-buffer': 'error',
  'rxjs/no-ignored-subscribe': 'error',
  'rxjs/no-ignored-subscription': 'error',
  'rxjs/no-nested-subscribe': 'error',
  'rxjs/no-sharereplay': 'error',
  'rxjs/no-subject-unsubscribe': 'error',
  'rxjs/no-subject-value': 'error',
  'rxjs/no-topromise': 'error',
  'rxjs/no-unbound-methods': 'error',
  'rxjs/no-unsafe-catch': 'error',
  'rxjs/no-unsafe-first': 'error',
  'rxjs/no-unsafe-subject-next': 'error',
  'rxjs/no-unsafe-switchmap': 'error',
  'rxjs/no-unsafe-takeuntil': 'error',
  'rxjs/throw-error': 'error',
} as const satisfies Linter.RulesRecord

const RXJS_PLUGIN = pluginRxjs as unknown as ESLint.Plugin
const RXJS_RULE_IDS = Object.keys(RXJS_RULES)

interface IRxjsProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const RXJS_PROFILES: Record<string, IRxjsProfile> = {
  'rxjs/no-async-subscribe': {
    category: 'subscription-lifecycle',
    labels: ['subscription-lifecycle', 'async-subscribe'],
    reason:
      'Async subscribe callbacks hide promise handling inside subscription lifecycle code.',
    score: 5,
    severity: 'high',
  },
  'rxjs/no-exposed-subjects': {
    category: 'state-exposure',
    labels: ['state-exposure', 'subject-exposure'],
    reason: 'Exposed subjects let callers push into internal reactive state.',
    score: 6,
    severity: 'high',
  },
  'rxjs/no-ignored-error': {
    category: 'error-handling',
    labels: ['error-handling', 'missing-error-handler'],
    reason:
      'The subscription does not make the observable error path explicit.',
    score: 5,
    severity: 'high',
  },
  'rxjs/no-ignored-notifier': {
    category: 'subscription-lifecycle',
    labels: ['subscription-lifecycle', 'ignored-notifier'],
    reason:
      'Notifier observables should be wired into teardown or cancellation flow explicitly.',
    score: 5,
    severity: 'medium',
  },
  'rxjs/no-ignored-observable': {
    category: 'ignored-flow',
    labels: ['ignored-flow', 'ignored-observable'],
    reason:
      'An observable is created but not returned, subscribed, or otherwise used.',
    score: 5,
    severity: 'medium',
  },
  'rxjs/no-ignored-replay-buffer': {
    category: 'state-exposure',
    labels: ['state-exposure', 'unbounded-replay-buffer'],
    reason:
      'ReplaySubject without an explicit buffer size can retain more state than intended.',
    score: 4,
    severity: 'medium',
  },
  'rxjs/no-ignored-subscribe': {
    category: 'subscription-lifecycle',
    labels: ['subscription-lifecycle', 'ignored-subscribe'],
    reason:
      'A subscription is started without making lifecycle ownership explicit.',
    score: 6,
    severity: 'high',
  },
  'rxjs/no-ignored-subscription': {
    category: 'subscription-lifecycle',
    labels: ['subscription-lifecycle', 'ignored-subscription'],
    reason: 'A subscription handle is ignored, making cleanup hard to verify.',
    score: 6,
    severity: 'high',
  },
  'rxjs/no-nested-subscribe': {
    category: 'flow-composition',
    labels: ['flow-composition', 'nested-subscribe'],
    reason: 'Nested subscriptions usually hide ordering and cleanup semantics.',
    score: 5,
    severity: 'medium',
  },
  'rxjs/no-sharereplay': {
    category: 'state-exposure',
    labels: ['state-exposure', 'share-replay-cache'],
    reason:
      'shareReplay can retain cached state unless its lifecycle is intentionally constrained.',
    score: 5,
    severity: 'medium',
  },
  'rxjs/no-subject-unsubscribe': {
    category: 'subscription-lifecycle',
    labels: ['subscription-lifecycle', 'subject-unsubscribe'],
    reason:
      'Unsubscribing a Subject directly can break downstream reactive state unexpectedly.',
    score: 5,
    severity: 'high',
  },
  'rxjs/no-subject-value': {
    category: 'state-access',
    labels: ['state-access', 'subject-value'],
    reason: 'Reading Subject value directly bypasses normal observable flow.',
    score: 4,
    severity: 'medium',
  },
  'rxjs/no-topromise': {
    category: 'migration',
    labels: ['migration', 'deprecated-api'],
    reason:
      'toPromise is deprecated and should be migrated to firstValueFrom or lastValueFrom.',
    score: 4,
    severity: 'medium',
  },
  'rxjs/no-unbound-methods': {
    category: 'flow-composition',
    labels: ['flow-composition', 'unbound-method'],
    reason:
      'Passing unbound methods into reactive callbacks can lose the expected receiver.',
    score: 4,
    severity: 'medium',
  },
  'rxjs/no-unsafe-catch': {
    category: 'error-handling',
    labels: ['error-handling', 'unsafe-catch'],
    reason:
      'Unsafe catchError placement can terminate or replace a wider stream than intended.',
    score: 5,
    severity: 'high',
  },
  'rxjs/no-unsafe-first': {
    category: 'flow-composition',
    labels: ['flow-composition', 'unsafe-first'],
    reason:
      'first without a predicate or safe fallback can fail when the stream completes empty.',
    score: 4,
    severity: 'medium',
  },
  'rxjs/no-unsafe-subject-next': {
    category: 'state-access',
    labels: ['state-access', 'unsafe-subject-next'],
    reason:
      'Calling next on a Subject directly should happen only at well-owned reactive boundaries.',
    score: 5,
    severity: 'high',
  },
  'rxjs/no-unsafe-switchmap': {
    category: 'flow-cancellation',
    labels: ['flow-cancellation', 'unsafe-switchmap'],
    reason: 'Unsafe switchMap usage can cancel work that should be preserved.',
    score: 6,
    severity: 'high',
  },
  'rxjs/no-unsafe-takeuntil': {
    category: 'subscription-lifecycle',
    labels: ['subscription-lifecycle', 'unsafe-takeuntil'],
    reason:
      'Operators after takeUntil can keep work alive past the intended teardown point.',
    score: 6,
    severity: 'high',
  },
  'rxjs/throw-error': {
    category: 'error-handling',
    labels: ['error-handling', 'throw-error-factory'],
    reason:
      'RxJS throwError should preserve lazy error creation for reliable stacks and timing.',
    score: 4,
    severity: 'medium',
  },
}

const applyRxjsOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer.clone().append({
    files: [GLOB_SRC],
    name: 'productive-eslint/analyze-rxjs',
    plugins: {
      rxjs: RXJS_PLUGIN,
    },
    rules: RXJS_RULES,
  })

const toRxjsFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !RXJS_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const profile = RXJS_PROFILES[message.ruleId]

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

export const analyzeRxjs = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyRxjsOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: RXJS_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toRxjsFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const lifecycleCount = findings.filter(
    (finding) => finding.category === 'subscription-lifecycle',
  ).length
  const flowCount = findings.filter((finding) =>
    ['flow-cancellation', 'flow-composition', 'ignored-flow'].includes(
      finding.category ?? '',
    ),
  ).length
  const stateCount = findings.filter((finding) =>
    ['state-access', 'state-exposure'].includes(finding.category ?? ''),
  ).length
  const errorHandlingCount = findings.filter(
    (finding) => finding.category === 'error-handling',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and clarify subscription ownership or reactive state boundaries first.`
      : 'No RxJS flow findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Subscription lifecycle findings: \`${lifecycleCount}\``,
      `Reactive flow findings: \`${flowCount}\``,
      `State boundary findings: \`${stateCount}\``,
      `Error handling findings: \`${errorHandlingCount}\``,
    ],
    title: 'RxJS Analysis',
  }
}
