import type { ESLint, Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import { reactCliRules } from '../../react.config'
import { reactHooksCliRules } from '../../reactHooks.config'
import { GLOB_TS, GLOB_TSX } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

const REACT_PLUGIN_RULES = {
  ...reactCliRules,
} as const satisfies Linter.RulesRecord

const REACT_HOOK_RULES = {
  ...reactHooksCliRules,
} as const satisfies Linter.RulesRecord

const REACT_RULES = {
  ...REACT_HOOK_RULES,
  ...REACT_PLUGIN_RULES,
} as const satisfies Linter.RulesRecord

const REACT_PLUGIN = reactPlugin as unknown as ESLint.Plugin
const REACT_HOOKS_PLUGIN = reactHooksPlugin as unknown as ESLint.Plugin
const REACT_RULE_IDS = Object.keys(REACT_RULES)

interface IReactProfile {
  category: string
  labels: string[]
  reason: string
  score: number
  severity: TSeverity
}

const REACT_PROFILES: Record<string, IReactProfile> = {
  'react-hooks/exhaustive-deps': {
    category: 'hooks-contract',
    labels: ['hooks-contract', 'effect-dependency-drift'],
    reason:
      'Hook dependencies drift away from captured values and make effect timing unpredictable.',
    score: 5,
    severity: 'high',
  },
  'react-hooks/globals': {
    category: 'render-purity',
    labels: ['render-purity', 'global-mutation-during-render'],
    reason:
      'Mutating module-level state during render makes component behavior impure and order-dependent.',
    score: 7,
    severity: 'high',
  },
  'react-hooks/immutability': {
    category: 'render-purity',
    labels: ['render-purity', 'mutation-of-immutable-input'],
    reason:
      'Mutating props or other immutable inputs breaks React assumptions and hides state transitions.',
    score: 7,
    severity: 'high',
  },
  'react-hooks/purity': {
    category: 'render-purity',
    labels: ['render-purity', 'impure-render'],
    reason:
      'Known impure calls inside components or hooks make render output depend on hidden side effects.',
    score: 6,
    severity: 'medium',
  },
  'react-hooks/refs': {
    category: 'render-purity',
    labels: ['render-purity', 'ref-mutation-during-render'],
    reason:
      'Reading or writing refs during render creates hidden mutable state that bypasses React updates.',
    score: 6,
    severity: 'medium',
  },
  'react-hooks/set-state-in-effect': {
    category: 'hooks-contract',
    labels: ['hooks-contract', 'synchronous-state-churn'],
    reason:
      'Immediate state updates inside effects often signal unnecessary render loops or derived-state drift.',
    score: 5,
    severity: 'medium',
  },
  'react-hooks/set-state-in-render': {
    category: 'render-stability',
    labels: ['render-stability', 'state-update-during-render'],
    reason:
      'State updates during render can trigger infinite loops and make component output unstable.',
    score: 8,
    severity: 'high',
  },
  'react-hooks/void-use-memo': {
    category: 'hooks-contract',
    labels: ['hooks-contract', 'misused-use-memo'],
    reason:
      'Using useMemo without returning a value usually means side effects were placed in the wrong hook.',
    score: 4,
    severity: 'medium',
  },
  'react/jsx-no-script-url': {
    category: 'security',
    labels: ['security', 'script-url'],
    reason:
      'javascript: URLs in JSX can become code-execution sinks and should be treated as unsafe.',
    score: 7,
    severity: 'high',
  },
  'react/no-array-index-key': {
    category: 'render-stability',
    labels: ['render-stability', 'unstable-list-key'],
    reason:
      'Array index keys make list reconciliation unstable when ordering changes.',
    score: 5,
    severity: 'medium',
  },
  'react/no-adjacent-inline-elements': {
    category: 'render-stability',
    labels: ['render-stability', 'adjacent-inline-elements'],
    reason:
      'Adjacent inline elements often hide fragile layout or copy-rendering assumptions in JSX output.',
    score: 2,
    severity: 'low',
  },
  'react/no-danger': {
    category: 'security',
    labels: ['security', 'unsafe-html'],
    reason:
      'Raw HTML rendering in React can expose XSS risk when the source is not strictly controlled.',
    score: 7,
    severity: 'high',
  },
}

const applyReactOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer
    .clone()
    .append({
      files: [GLOB_TS, GLOB_TSX],
      name: 'productive-eslint/analyze-react-hooks',
      plugins: {
        'react-hooks': REACT_HOOKS_PLUGIN,
      },
      rules: REACT_HOOK_RULES,
    })
    .append({
      files: [GLOB_TSX],
      name: 'productive-eslint/analyze-react',
      plugins: {
        react: REACT_PLUGIN,
      },
      rules: REACT_PLUGIN_RULES,
      settings: {
        react: {
          version: 'detect',
        },
      },
    })

const toReactFinding = (
  file: string,
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (!message.ruleId || !REACT_RULE_IDS.includes(message.ruleId)) {
    return null
  }

  const profile = REACT_PROFILES[message.ruleId]

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

export const analyzeReact = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyReactOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: REACT_RULE_IDS,
  })
  const findings = results.flatMap((result) =>
    result.messages.flatMap((message) => {
      const finding = toReactFinding(result.filePath, message)
      return finding ? [finding] : []
    }),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const hooksCount = findings.filter(
    (finding) => finding.category === 'hooks-contract',
  ).length
  const renderStabilityCount = findings.filter(
    (finding) => finding.category === 'render-stability',
  ).length
  const renderPurityCount = findings.filter(
    (finding) => finding.category === 'render-purity',
  ).length
  const securityCount = findings.filter(
    (finding) => finding.category === 'security',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and stabilize hook dependencies or JSX semantics there first.`
      : 'No React correctness findings were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Hooks contract findings: \`${hooksCount}\``,
      `Render stability findings: \`${renderStabilityCount}\``,
      `Render purity findings: \`${renderPurityCount}\``,
      `Security findings: \`${securityCount}\``,
    ],
    title: 'React Analysis',
  }
}
