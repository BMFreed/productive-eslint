export type TSeverity = 'high' | 'low' | 'medium'

export interface IAnalyzerContext {
  cwd: string
  exclude: string[]
  include: string[]
  top: number
}

export interface IAnalyzerFinding {
  category?: string
  column?: number
  confidence?: 'high' | 'low' | 'medium'
  file: string
  labels?: string[]
  line?: number
  reasons: string[]
  ruleId?: string
  score: number
  severity: TSeverity
}

export interface IAnalyzerFileSummary {
  file: string
  findings: IAnalyzerFinding[]
  labels?: string[]
  reasons?: string[]
  score: number
}

export interface IAnalyzerGroup {
  count: number
  label: string
}

export interface IAnalyzerReport {
  fileCount: number
  findingsCount: number
  nextStep: string
  suggestedOrder: string[]
  summaries: IAnalyzerFileSummary[]
  summaryLines?: string[]
  title: string
  topGroups?: IAnalyzerGroup[]
}

export interface IAnalyzeOptions extends IAnalyzerContext {
  topic: string
}
