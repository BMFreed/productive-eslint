import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import type { IAnalyzerContext, IAnalyzerReport } from './runtime/report-types'

import { analyzeApi } from './analyzers/api'
import { analyzeArchitecture } from './analyzers/architecture'
import { analyzeAsync } from './analyzers/async'
import { analyzeComplexity } from './analyzers/complexity'
import { analyzeDeadCode } from './analyzers/dead-code'
import { analyzeImports } from './analyzers/imports'
import { analyzeMigrations } from './analyzers/migrations'
import { analyzeRisk } from './analyzers/risk'
import { analyzeRxjs } from './analyzers/rxjs'
import { analyzeSuppressions } from './analyzers/suppressions'
import { analyzeTypes } from './analyzers/types'
import { analyzeVue } from './analyzers/vue'

export type TAnalyzeTopic =
  | 'api'
  | 'architecture'
  | 'async'
  | 'complexity'
  | 'dead-code'
  | 'imports'
  | 'migrations'
  | 'risk'
  | 'rxjs'
  | 'suppressions'
  | 'types'
  | 'vue'

export type TAnalyzer = (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
) => Promise<IAnalyzerReport>

export const ANALYZE_TOPICS: Record<TAnalyzeTopic, TAnalyzer> = {
  api: analyzeApi,
  architecture: analyzeArchitecture,
  async: analyzeAsync,
  complexity: analyzeComplexity,
  'dead-code': analyzeDeadCode,
  imports: analyzeImports,
  migrations: analyzeMigrations,
  risk: analyzeRisk,
  rxjs: analyzeRxjs,
  suppressions: analyzeSuppressions,
  types: analyzeTypes,
  vue: analyzeVue,
}

export const isAnalyzeTopic = (value: string): value is TAnalyzeTopic =>
  value in ANALYZE_TOPICS
