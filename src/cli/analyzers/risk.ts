import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import { CliError } from '../runtime/errors'
import { summarizeByFile } from '../runtime/summarize-by-file'
import { analyzeApi } from './api'
import { analyzeArchitecture } from './architecture'
import { analyzeAsync } from './async'
import { analyzeComplexity } from './complexity'
import { analyzeDeadCode } from './dead-code'
import { analyzeImports } from './imports'
import { analyzeSuppressions } from './suppressions'
import { analyzeTypes } from './types'

interface IRiskAnalyzer {
  analyze: (
    composer: FlatConfigComposer<Linter.Config>,
    context: IAnalyzerContext,
  ) => Promise<IAnalyzerReport>
  label: string
  topic: string
}

const RISK_ANALYZERS: IRiskAnalyzer[] = [
  { analyze: analyzeTypes, label: 'Types', topic: 'types' },
  {
    analyze: analyzeArchitecture,
    label: 'Architecture',
    topic: 'architecture',
  },
  { analyze: analyzeComplexity, label: 'Complexity', topic: 'complexity' },
  { analyze: analyzeAsync, label: 'Async', topic: 'async' },
  {
    analyze: analyzeSuppressions,
    label: 'Suppressions',
    topic: 'suppressions',
  },
  { analyze: analyzeDeadCode, label: 'Dead Code', topic: 'dead-code' },
  { analyze: analyzeImports, label: 'Imports', topic: 'imports' },
  { analyze: analyzeApi, label: 'API', topic: 'api' },
]

const getRiskSeverity = (score: number): TSeverity => {
  if (score >= 10) {
    return 'high'
  }

  if (score >= 4) {
    return 'medium'
  }

  return 'low'
}

const toRiskFindings = (
  report: IAnalyzerReport,
  analyzer: IRiskAnalyzer,
): IAnalyzerFinding[] =>
  report.summaries.map((summary) => ({
    category: analyzer.topic,
    confidence: 'medium',
    file: summary.file,
    labels: ['risk', `risk:${analyzer.topic}`, ...(summary.labels ?? [])],
    reasons: [
      `${analyzer.label} analyzer reported score ${summary.score} for this file.`,
      ...(summary.reasons ?? []).slice(0, 2),
    ],
    ruleId: `productive/risk-${analyzer.topic}`,
    score: summary.score,
    severity: getRiskSeverity(summary.score),
  }))

export const analyzeRisk = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const reports: { analyzer: IRiskAnalyzer; report: IAnalyzerReport }[] = []

  for (const analyzer of RISK_ANALYZERS) {
    reports.push({
      analyzer,
      report: await analyzer.analyze(composer, context),
    })
  }

  const findings = reports.flatMap(({ analyzer, report }) =>
    toRiskFindings(report, analyzer),
  )
  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]

  return {
    fileCount: Math.max(0, ...reports.map(({ report }) => report.fileCount)),
    findingsCount: reports.reduce(
      (sum, { report }) => sum + report.findingsCount,
      0,
    ),
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\`; it is the highest combined-risk file across the universal analyzer set.`
      : 'No risk findings were reported by the universal analyzer set.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: reports.map(
      ({ analyzer, report }) =>
        `${analyzer.label} findings: \`${report.findingsCount}\``,
    ),
    title: 'Risk Analysis',
    topGroups: reports
      .map(({ analyzer, report }) => ({
        count: report.findingsCount,
        label: analyzer.label,
      }))
      .filter((group) => group.count > 0),
  }
}
