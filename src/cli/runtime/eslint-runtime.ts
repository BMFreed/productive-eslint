import { ESLint } from 'eslint'
import path from 'node:path'

import type { IAnalyzerContext } from './report-types'

export interface IRunAnalyzerLintOptions {
  config: Awaited<
    ReturnType<
      typeof import('eslint-flat-config-utils').FlatConfigComposer.prototype.toConfigs
    >
  >
  context: IAnalyzerContext
  ruleIds: string[]
}

export const runAnalyzerLint = async ({
  config,
  context,
  ruleIds,
}: IRunAnalyzerLintOptions): Promise<ESLint.LintResult[]> => {
  const eslint = new ESLint({
    cwd: context.cwd,
    errorOnUnmatchedPattern: false,
    ignore: true,
    ignorePatterns: context.exclude,
    overrideConfig: config,
    overrideConfigFile: true,
    passOnNoPatterns: true,
    ruleFilter: ({ ruleId }) => ruleIds.includes(ruleId),
  })

  const patterns = context.include.length > 0 ? context.include : ['.']

  const results = await eslint.lintFiles(patterns)

  return results.map((result) => ({
    ...result,
    filePath: path.relative(context.cwd, result.filePath) || result.filePath,
  }))
}
