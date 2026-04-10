import type { IAnalyzeOptions } from '../runtime/report-types'

import { renderMarkdownReport } from '../render/markdown'
import { CliError } from '../runtime/errors'
import { loadProjectConfig } from '../runtime/load-project-config'
import { ANALYZE_TOPICS, isAnalyzeTopic } from '../topics'

export const runAnalyzeCommand = async (
  options: IAnalyzeOptions,
): Promise<string> => {
  if (!isAnalyzeTopic(options.topic)) {
    throw new CliError(`Unknown analyzer topic "${options.topic}".`)
  }

  const { composer } = await loadProjectConfig(options.cwd)
  const analyzer = ANALYZE_TOPICS[options.topic]
  const report = await analyzer(composer, options)

  return renderMarkdownReport(report)
}
