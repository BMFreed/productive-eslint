import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type {
  IAnalyzerContext,
  IAnalyzerFinding,
  IAnalyzerGroup,
  IAnalyzerReport,
} from '../runtime/report-types'

import {
  architectureElementTypesRule,
  architectureEntryPointRule,
  formatDirectionLabel,
  matchArchitectureElement,
} from '../../architecture/model'
import { GLOB_SRC, GLOB_VUE } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'
import { summarizeByFile } from '../runtime/summarize-by-file'

const ARCHITECTURE_RULE_IDS = [
  'boundaries/element-types',
  'boundaries/entry-point',
] as const

const IMPORT_SOURCE_PATTERN =
  /\b(?:import|export)\b[\s\S]*?\bfrom\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/u

const PRIVATE_ENTRY_LABEL = 'private entry imports'

interface IArchitectureDetails {
  category?: string
  directionLabel?: string
  labels: string[]
  reason: string
  scoreDelta: number
}

const applyArchitectureOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer.clone().append({
    files: [GLOB_SRC, GLOB_VUE],
    name: 'productive-eslint/analyze-architecture',
    rules: {
      'boundaries/element-types': architectureElementTypesRule,
      'boundaries/entry-point': architectureEntryPointRule,
    },
  })

const extractImportSource = (sourceLine: string): string | null => {
  const match = sourceLine.match(IMPORT_SOURCE_PATTERN)

  return match?.[1] ?? match?.[2] ?? null
}

const resolveImportTargetPath = (
  cwd: string,
  file: string,
  importSource: string,
): string => {
  if (importSource.startsWith('.')) {
    const absoluteTarget = path.resolve(
      path.dirname(path.join(cwd, file)),
      importSource,
    )

    return path.relative(cwd, absoluteTarget)
  }

  return importSource
}

const extractArchitectureDetails = async (
  cwd: string,
  finding: IAnalyzerFinding,
): Promise<IArchitectureDetails> => {
  const sourceMatch = matchArchitectureElement(finding.file)

  if (!sourceMatch) {
    return {
      labels: ['unknown-source'],
      reason: 'Could not map the source file to a known architecture element.',
      scoreDelta: 0,
    }
  }

  if (finding.ruleId === 'boundaries/entry-point') {
    const sourceText = await readFile(path.join(cwd, finding.file), 'utf8')
    const sourceLine =
      sourceText.split('\n')[Math.max(0, (finding.line ?? 1) - 1)] ?? ''
    const importSource = extractImportSource(sourceLine)

    if (!importSource) {
      return {
        category: 'private-entry',
        labels: ['private-entry'],
        reason:
          'A private entry import was reported, but the exact target import could not be recovered.',
        scoreDelta: 4,
      }
    }

    const targetMatch = matchArchitectureElement(
      resolveImportTargetPath(cwd, finding.file, importSource),
    )

    return {
      category: 'private-entry',
      labels: ['private-entry'],
      reason:
        'This import bypasses the public entry point of the target architecture element.',
      scoreDelta: 4,
      ...(targetMatch
        ? { directionLabel: formatDirectionLabel(sourceMatch, targetMatch) }
        : {}),
    }
  }

  const sourceText = await readFile(path.join(cwd, finding.file), 'utf8')
  const sourceLine =
    sourceText.split('\n')[Math.max(0, (finding.line ?? 1) - 1)] ?? ''
  const importSource = extractImportSource(sourceLine)

  if (!importSource) {
    return {
      category: 'layer-direction',
      labels: ['layer-direction'],
      reason:
        'An architecture direction violation was reported, but the target dependency could not be recovered.',
      scoreDelta: 3,
    }
  }

  const targetMatch = matchArchitectureElement(
    resolveImportTargetPath(cwd, finding.file, importSource),
  )

  if (!targetMatch) {
    return {
      category: 'layer-direction',
      labels: ['layer-direction'],
      reason:
        'The target dependency could not be mapped to a known architecture element.',
      scoreDelta: 3,
    }
  }

  return {
    category:
      sourceMatch.type === targetMatch.type
        ? 'slice-direction'
        : 'layer-direction',
    directionLabel: formatDirectionLabel(sourceMatch, targetMatch),
    labels: [
      sourceMatch.type === targetMatch.type
        ? 'slice-direction'
        : 'layer-direction',
    ],
    reason:
      sourceMatch.type === targetMatch.type
        ? 'This import crosses into another slice of the same architecture layer.'
        : 'This import violates the allowed dependency direction between architecture layers.',
    scoreDelta: 3,
  }
}

const toArchitectureFinding = (
  result: { filePath: string; messages: Linter.LintMessage[] },
  message: Linter.LintMessage,
): IAnalyzerFinding | null => {
  if (
    !message.ruleId ||
    !ARCHITECTURE_RULE_IDS.includes(
      message.ruleId as (typeof ARCHITECTURE_RULE_IDS)[number],
    )
  ) {
    return null
  }

  return {
    category:
      message.ruleId === 'boundaries/entry-point'
        ? 'private-entry'
        : 'layer-direction',
    column: message.column,
    confidence: 'high',
    file: result.filePath,
    labels: [],
    line: message.line,
    reasons: [message.message],
    ruleId: message.ruleId,
    score: message.ruleId === 'boundaries/entry-point' ? 5 : 4,
    severity: 'high',
  }
}

const summarizeDirectionGroups = (
  findings: IAnalyzerFinding[],
): IAnalyzerGroup[] => {
  const counts = new Map<string, number>()

  for (const finding of findings) {
    const directionLabel =
      finding.category === 'private-entry'
        ? PRIVATE_ENTRY_LABEL
        : finding.labels?.find((label) => label.includes('->'))

    if (!directionLabel) {
      continue
    }

    counts.set(directionLabel, (counts.get(directionLabel) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort(
      (left, right) =>
        right.count - left.count || left.label.localeCompare(right.label),
    )
    .slice(0, 5)
}

export const analyzeArchitecture = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyArchitectureOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: [...ARCHITECTURE_RULE_IDS],
  })
  const findings: IAnalyzerFinding[] = []

  for (const result of results) {
    for (const message of result.messages) {
      const finding = toArchitectureFinding(result, message)

      if (!finding) {
        continue
      }

      const details = await extractArchitectureDetails(context.cwd, finding)

      findings.push({
        ...finding,
        ...(details.category ? { category: details.category } : {}),
        labels: [
          ...new Set([
            ...(finding.labels ?? []),
            ...details.labels,
            ...(details.directionLabel ? [details.directionLabel] : []),
          ]),
        ],
        reasons: [...finding.reasons, details.reason],
        score: finding.score + details.scoreDelta,
      })
    }
  }

  const summaries = summarizeByFile(findings, context.top)
  const firstSummary = summaries[0]
  const topGroups = summarizeDirectionGroups(findings)
  const privateEntryCount = findings.filter(
    (finding) => finding.category === 'private-entry',
  ).length
  const layerDirectionCount = findings.filter(
    (finding) => finding.category === 'layer-direction',
  ).length
  const sliceDirectionCount = findings.filter(
    (finding) => finding.category === 'slice-direction',
  ).length

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and remove the repeated architecture violations there first.`
      : 'No architecture boundary violations were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `Layer-direction violations: \`${layerDirectionCount}\``,
      `Slice-direction violations: \`${sliceDirectionCount}\``,
      `Private-entry violations: \`${privateEntryCount}\``,
    ],
    title: 'Architecture Analysis',
    topGroups,
  }
}
