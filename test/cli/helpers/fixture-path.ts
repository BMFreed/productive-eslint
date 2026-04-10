import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(
  fileURLToPath(new URL('../../..', import.meta.url)),
)

export const fixturePath = (...segments: string[]): string =>
  path.join(repoRoot, 'test', 'fixtures', 'cli', ...segments)
