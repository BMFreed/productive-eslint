import type { IAnalyzerReport } from '../runtime/report-types'

const MAX_FINDINGS_PER_HOTSPOT = 10

export const renderMarkdownReport = (report: IAnalyzerReport): string => {
  const lines: string[] = [
    `# ${report.title}`,
    '',
    '## Summary',
    '',
    `- Files scanned: \`${report.fileCount}\``,
    `- Findings: \`${report.findingsCount}\``,
    `- Hotspots shown: \`${report.summaries.length}\``,
  ]

  if (report.summaryLines && report.summaryLines.length > 0) {
    for (const summaryLine of report.summaryLines) {
      lines.push(`- ${summaryLine}`)
    }
  }

  lines.push('')

  if (report.summaries.length > 0) {
    if (report.topGroups && report.topGroups.length > 0) {
      lines.push('## Top Directions', '')

      for (const group of report.topGroups) {
        lines.push(`- ${group.label}: \`${group.count}\``)
      }

      lines.push('')
    }

    lines.push('## Highest Risk', '')

    for (const summary of report.summaries) {
      lines.push(`### \`${summary.file}\``, '')
      lines.push(`- Score: \`${summary.score}\``)

      if (summary.labels && summary.labels.length > 0) {
        lines.push(
          `- Labels: ${summary.labels.map((label) => `\`${label}\``).join(', ')}`,
        )
      }

      if (summary.reasons && summary.reasons.length > 0) {
        lines.push('- Why this file is prioritized:')

        for (const reason of summary.reasons) {
          lines.push(`  - ${reason}`)
        }
      }

      const visibleFindings = summary.findings.slice(
        0,
        MAX_FINDINGS_PER_HOTSPOT,
      )
      const hiddenFindingsCount =
        summary.findings.length - visibleFindings.length

      for (const finding of visibleFindings) {
        const displayTarget = finding.symbol
          ? `${summary.file} :: ${finding.symbol}`
          : summary.file
        const location = finding.line
          ? `${displayTarget}:${finding.line}${finding.column ? `:${finding.column}` : ''}`
          : displayTarget
        lines.push(
          `- ${finding.ruleId ?? 'unknown-rule'} (${finding.severity}, score ${finding.score}) at \`${location}\``,
        )

        if (finding.labels && finding.labels.length > 0) {
          lines.push(
            `  - Labels: ${finding.labels.map((label) => `\`${label}\``).join(', ')}`,
          )
        }

        for (const reason of finding.reasons) {
          lines.push(`  - ${reason}`)
        }
      }

      if (hiddenFindingsCount > 0) {
        lines.push(
          `- ${hiddenFindingsCount} more findings in this hotspot are omitted from the Markdown report.`,
        )
      }

      lines.push('')
    }
  }

  if (report.suggestedOrder.length > 0) {
    lines.push('## Suggested Order', '')

    report.suggestedOrder.forEach((file, index) => {
      lines.push(`${index + 1}. \`${file}\``)
    })

    lines.push('')
  }

  lines.push('## Next Step', '', report.nextStep)

  return `${lines.join('\n').trim()}\n`
}
