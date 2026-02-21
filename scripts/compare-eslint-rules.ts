/**
 * Compares two ESLint rules snapshots (e.g. before and after dependency
 * update).
 *
 * Usage: pnpm exec jiti scripts/compare-eslint-rules.ts <before.json>
 * <after.json> Example: pnpm exec jiti scripts/compare-eslint-rules.ts\
 * .eslint-snapshots/rules-before.json .eslint-snapshots/rules-after.json
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ARGV_OFFSET_FIRST_PATH = 2

interface IRulesSnapshotFile {
  union?: Record<string, Record<string, unknown>>
}

const loadSnapshot = async (filePath: string): Promise<IRulesSnapshotFile> => {
  const absolutePath = path.resolve(filePath)
  const content = await fs.readFile(absolutePath)
  return JSON.parse(content) as IRulesSnapshotFile
}

const main = async (): Promise<void> => {
  const [beforePath, afterPath] = process.argv.slice(ARGV_OFFSET_FIRST_PATH)

  if (!beforePath || !afterPath) {
    console.error(
      'Usage: pnpm exec jiti scripts/compare-eslint-rules.ts <before.json> <after.json>',
    )
    process.exit(1)
  }

  const [beforeSnapshot, afterSnapshot] = await Promise.all([
    loadSnapshot(beforePath),
    loadSnapshot(afterPath),
  ])

  const beforeRules = beforeSnapshot.union ?? {}
  const afterRules = afterSnapshot.union ?? {}
  const allRuleNames = new Set([
    ...Object.keys(beforeRules),
    ...Object.keys(afterRules),
  ])

  const added: string[] = []
  const removed: string[] = []
  const changed: string[] = []

  const sortedRuleNames = [...allRuleNames].sort((left, right) =>
    left.localeCompare(right),
  )

  for (const ruleName of sortedRuleNames) {
    const wasInBefore = ruleName in beforeRules
    const isInAfter = ruleName in afterRules

    if (!wasInBefore) {
      added.push(ruleName)
    } else if (isInAfter) {
      const beforeValue = JSON.stringify(beforeRules[ruleName])
      const afterValue = JSON.stringify(afterRules[ruleName])
      if (beforeValue !== afterValue) {
        changed.push(ruleName)
      }
    } else {
      removed.push(ruleName)
    }
  }

  console.log('Added:', added.length)
  console.log('Removed:', removed.length)
  console.log('Changed:', changed.length)

  if (added.length > 0) {
    console.log(`\n+ ${added.join('\n+ ')}`)
  }
  if (removed.length > 0) {
    console.log(`\n- ${removed.join('\n- ')}`)
  }
  if (changed.length > 0) {
    console.log(`\n~ ${changed.join('\n~ ')}`)
  }
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
