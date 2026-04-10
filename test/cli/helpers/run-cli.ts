import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

import { repoRoot } from './fixture-path'
import { normalizeOutput } from './normalize-output'

export interface IRunCliOptions {
  args?: string[]
}

export interface IRunCliResult {
  code: number | null
  stderr: string
  stdout: string
}

export const runCli = ({
  args = [],
}: IRunCliOptions = {}): Promise<IRunCliResult> =>
  new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [path.join(repoRoot, 'dist', 'cli.js'), 'analyze', ...args],
      {
        cwd: repoRoot,
        env: { ...process.env, FORCE_COLOR: '0' },
      },
    )
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })

    child.on('close', (code) => {
      resolve({
        code,
        stderr: normalizeOutput(stderr),
        stdout: normalizeOutput(stdout),
      })
    })
  })
