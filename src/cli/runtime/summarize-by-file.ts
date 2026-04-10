import type { IAnalyzerFileSummary, IAnalyzerFinding } from './report-types'

export const summarizeByFile = (
  findings: IAnalyzerFinding[],
  top: number,
): IAnalyzerFileSummary[] => {
  const byFile = new Map<string, IAnalyzerFinding[]>()

  for (const finding of findings) {
    const fileFindings = byFile.get(finding.file) ?? []
    fileFindings.push(finding)
    byFile.set(finding.file, fileFindings)
  }

  return [...byFile.entries()]
    .map(([file, fileFindings]) => ({
      file,
      findings: fileFindings.sort((left, right) => right.score - left.score),
      labels: [
        ...new Set(fileFindings.flatMap((finding) => finding.labels ?? [])),
      ],
      reasons: [
        ...new Set(
          fileFindings.flatMap((finding) => finding.reasons.slice(0, 1)),
        ),
      ],
      score: fileFindings.reduce((sum, finding) => sum + finding.score, 0),
    }))
    .sort(
      (left, right) =>
        right.score - left.score || left.file.localeCompare(right.file),
    )
    .slice(0, top)
}
