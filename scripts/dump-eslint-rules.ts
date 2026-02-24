/**
 * Dumps all active ESLint rules for a set of target files into a JSON snapshot.
 * Run from repo root. Before comparing after a dependency update, run again and
 * use scripts/compare-eslint-rules.ts to diff the two snapshots.
 *
 * Usage: pnpm exec jiti scripts/dump-eslint-rules.ts [filename] filename:
 * optional output filename (e.g. rules-before.json). Files are always saved
 * under .eslint-snapshots/. Default: rules-<timestamp>.json
 */

import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ARGV_INDEX_OUTPUT_PATH = 2
const INDENT_SPACES = 2
const TIMESTAMP_LENGTH = 19

const scriptDir = import.meta.dirname
const rootDir = path.resolve(scriptDir, '..')

const TARGETS: string[] = [
  'src/index.config.ts',
  'src/javascript.config.ts',
  'src/typescript.config.ts',
  'src/vue.config.ts',
  'src/import.config.ts',
  'src/plugins/productive.plugin.ts',
  'eslint.config.ts',
]

interface IEslintPrintConfigResult {
  rules?: Record<string, unknown>
}

interface IRulesSnapshot {
  createdAt: string
  node: string
  snapshots: Record<string, Record<string, unknown> | { __error__: string }>
  targets: string[]
  union: Record<string, Record<string, unknown>>
}

interface IRunResult {
  error: string | null
  filePath: string
  rules: Record<string, unknown>
}

const runEslintPrintConfig = (filePath: string): Promise<IRunResult> =>
  new Promise((resolve, reject) => {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(rootDir, filePath)

    const [execCommand, ...execArgs] = [
      'exec',
      'eslint',
      '--print-config',
      absolutePath,
    ]
    const child = spawn('pnpm', [execCommand, ...execArgs], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8').on('data', (outputChunk: string) => {
      stdout += outputChunk
    })
    child.stderr.setEncoding('utf8').on('data', (outputChunk: string) => {
      stderr += outputChunk
    })

    child.on('close', (exitCode: number | null) => {
      let result: IRunResult = {
        error: null,
        filePath,
        rules: {},
      }

      try {
        const config = JSON.parse(stdout) as IEslintPrintConfigResult
        result = {
          error: null,
          filePath,
          rules: config.rules ?? {},
        }
      } catch (parseError) {
        if (stdout.trim().length > 0) {
          reject(
            new Error(
              `Failed to parse ESLint config for ${filePath}: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
            ),
          )
          return
        }
        result = {
          error: stderr || exitCode !== 0 ? `code ${exitCode}` : null,
          filePath,
          rules: {},
        }
      }

      resolve(result)
    })
    child.on('error', reject)
  })

const main = async (): Promise<void> => {
  const [filenameArg] = process.argv.slice(ARGV_INDEX_OUTPUT_PATH)
  const snapshots: IRulesSnapshot['snapshots'] = {}
  const union: IRulesSnapshot['union'] = {}

  for (const targetFile of TARGETS) {
    try {
      const { error, filePath, rules } = await runEslintPrintConfig(targetFile)
      snapshots[filePath] = error === null ? rules : { __error__: error }
      if (error === null && typeof rules === 'object') {
        for (const [rule, value] of Object.entries(rules)) {
          const ruleEntry = union[rule] ?? {}
          ruleEntry[filePath] = value
          union[rule] = ruleEntry
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(message)
      snapshots[targetFile] = { __error__: message }
    }
  }

  const output: IRulesSnapshot = {
    createdAt: new Date().toISOString(),
    node: process.version,
    snapshots,
    targets: TARGETS,
    union,
  }

  const snapshotDir = path.join(rootDir, '.eslint-snapshots')
  const timestamp = new Date()
    .toISOString()
    .replaceAll(/[:.]/g, '-')
    .slice(0, TIMESTAMP_LENGTH)
  const filename = `rules-${
    filenameArg ? path.basename(filenameArg) : timestamp
  }.json`
  const outPath = path.join(snapshotDir, filename)

  await fs.mkdir(snapshotDir, { recursive: true })
  await fs.writeFile(
    outPath,
    JSON.stringify(output, null, INDENT_SPACES),
    'utf8',
  )
  console.log(outPath)
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
