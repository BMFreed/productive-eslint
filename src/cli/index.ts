#!/usr/bin/env node

import path from 'node:path'
import process from 'node:process'

import type { IAnalyzeOptions } from './runtime/report-types'

import { runAnalyzeCommand } from './commands/analyze'
import { CliError } from './runtime/errors'

const parseAnalyzeOptions = (args: string[]): IAnalyzeOptions => {
  const [topic, ...rest] = args

  if (!topic) {
    throw new CliError(
      'Missing analyzer topic. Example: productive-eslint analyze types',
    )
  }

  const options: IAnalyzeOptions = {
    cwd: process.cwd(),
    exclude: [],
    include: [],
    top: 10,
    topic,
  }

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index]
    const next = rest[index + 1]

    if (arg === '--cwd') {
      if (!next) {
        throw new CliError('Missing value for --cwd.')
      }

      options.cwd = path.resolve(next)
      index += 1
      continue
    }

    if (arg === '--include') {
      if (!next) {
        throw new CliError('Missing value for --include.')
      }

      options.include.push(next)
      index += 1
      continue
    }

    if (arg === '--exclude') {
      if (!next) {
        throw new CliError('Missing value for --exclude.')
      }

      options.exclude.push(next)
      index += 1
      continue
    }

    if (arg === '--top') {
      if (!next) {
        throw new CliError('Missing value for --top.')
      }

      options.top = Number.parseInt(next, 10)
      index += 1
      continue
    }

    throw new CliError(`Unknown option "${arg}".`)
  }

  if (!Number.isInteger(options.top) || options.top < 1) {
    throw new CliError('--top must be a positive integer.')
  }

  return options
}

const main = async (): Promise<void> => {
  const [, , command, ...rest] = process.argv

  if (command !== 'analyze') {
    throw new CliError(
      'Unknown command. Supported command: productive-eslint analyze <topic>',
    )
  }

  const output = await runAnalyzeCommand(parseAnalyzeOptions(rest))
  process.stdout.write(output)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
})
