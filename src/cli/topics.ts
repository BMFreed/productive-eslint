import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import type { IAnalyzerContext, IAnalyzerReport } from './runtime/report-types'

import { analyzeArchitecture } from './analyzers/architecture'
import { analyzeAsync } from './analyzers/async'
import { analyzeComplexity } from './analyzers/complexity'
import { analyzeSuppressions } from './analyzers/suppressions'
import { analyzeTypes } from './analyzers/types'

export type TAnalyzeTopic =
  | 'architecture'
  | 'async'
  | 'complexity'
  | 'suppressions'
  | 'types'

export type TAnalyzer = (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
) => Promise<IAnalyzerReport>

export const ANALYZE_TOPICS: Record<TAnalyzeTopic, TAnalyzer> = {
  architecture: analyzeArchitecture,
  async: analyzeAsync,
  complexity: analyzeComplexity,
  suppressions: analyzeSuppressions,
  types: analyzeTypes,
}

export const isAnalyzeTopic = (value: string): value is TAnalyzeTopic =>
  value in ANALYZE_TOPICS
