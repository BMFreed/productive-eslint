import type { Linter } from 'eslint'
import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

import type {
  IAnalyzerContext,
  IAnalyzerFileSummary,
  IAnalyzerFinding,
  IAnalyzerReport,
  TSeverity,
} from '../runtime/report-types'

import { GLOB_SRC } from '../../utils/globs'
import { CliError } from '../runtime/errors'
import { runAnalyzerLint } from '../runtime/eslint-runtime'

const COMPLEXITY_RULES = {
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'no-nested-ternary': 'error',
  'productive/no-abusive-nested-if': ['error', 3],
  'sonarjs/cognitive-complexity': ['error', 15],
} as const satisfies Linter.RulesRecord

const COMPLEXITY_RULE_IDS = Object.keys(COMPLEXITY_RULES)

const CANONICAL_RULE_SCORE_MAP: Record<string, number> = {
  complexity: 3,
  'max-depth': 3,
  'no-nested-ternary': 2,
  'productive/no-abusive-nested-if': 2,
  'sonarjs/cognitive-complexity': 4,
}

const CANONICAL_RULE_REASON_MAP: Record<string, string> = {
  complexity: 'Cyclomatic complexity already crossed the analyzer threshold.',
  'max-depth': 'Branch nesting is above the safe editing threshold.',
  'no-nested-ternary':
    'Nested ternaries make branch intent harder to preserve.',
  'productive/no-abusive-nested-if':
    'Nested if chains are dense enough to deserve structural attention.',
  'sonarjs/cognitive-complexity':
    'Cognitive complexity is already high before additional risk scoring.',
}

interface IFunctionMetrics {
  asyncInsideBranches: number
  booleanGuardComplexity: number
  branchMutations: number
  functionLines: number
  maxDepth: number
  mixedReturnShapes: number
  sharedMutableAcrossBranches: number
  sideEffectBranches: number
  tryCatchInsideBranches: number
}

interface IFunctionContext {
  displayName: string
  endLine: number
  file: string
  metrics: IFunctionMetrics
  startLine: number
}

interface ICanonicalRuleHit {
  line: number
  message: string
  ruleId: string
}

const FUNCTION_LINE_THRESHOLD = 40

const getScriptKind = (filePath: string): ts.ScriptKind => {
  if (filePath.endsWith('.tsx')) {
    return ts.ScriptKind.TSX
  }

  return ts.ScriptKind.TS
}

const isFunctionLikeDeclaration = (
  node: ts.Node,
): node is
  | ts.ArrowFunction
  | ts.ConstructorDeclaration
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.GetAccessorDeclaration
  | ts.MethodDeclaration
  | ts.SetAccessorDeclaration =>
  ts.isArrowFunction(node) ||
  ts.isConstructorDeclaration(node) ||
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isGetAccessor(node) ||
  ts.isMethodDeclaration(node) ||
  ts.isSetAccessor(node)

const getFunctionName = (
  node:
    | ts.ArrowFunction
    | ts.ConstructorDeclaration
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.GetAccessorDeclaration
    | ts.MethodDeclaration
    | ts.SetAccessorDeclaration,
): string => {
  if (ts.isConstructorDeclaration(node)) {
    return 'constructor'
  }

  if ('name' in node && node.name) {
    if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
      return node.name.text
    }

    return node.name.getText()
  }

  const parent = node.parent

  if (
    parent &&
    ts.isVariableDeclaration(parent) &&
    ts.isIdentifier(parent.name)
  ) {
    return parent.name.text
  }

  if (
    parent &&
    ts.isPropertyAssignment(parent) &&
    (ts.isIdentifier(parent.name) ||
      ts.isStringLiteral(parent.name) ||
      ts.isNumericLiteral(parent.name))
  ) {
    return parent.name.text
  }

  if (
    parent &&
    ts.isBinaryExpression(parent) &&
    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
  ) {
    return parent.left.getText()
  }

  return '<anonymous>'
}

const returnShape = (expression: ts.Expression | undefined): string => {
  if (!expression) {
    return 'void'
  }

  if (ts.isObjectLiteralExpression(expression)) {
    return 'object'
  }

  if (ts.isArrayLiteralExpression(expression)) {
    return 'array'
  }

  if (ts.isStringLiteralLike(expression) || ts.isNumericLiteral(expression)) {
    return 'literal'
  }

  if (
    expression.kind === ts.SyntaxKind.TrueKeyword ||
    expression.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return 'boolean'
  }

  if (ts.isIdentifier(expression)) {
    return 'identifier'
  }

  if (ts.isCallExpression(expression)) {
    return 'call'
  }

  if (ts.isAwaitExpression(expression)) {
    return 'await'
  }

  if (ts.isConditionalExpression(expression)) {
    return 'conditional'
  }

  return ts.SyntaxKind[expression.kind] ?? 'other'
}

const countLogicalOperators = (node: ts.Node): number => {
  let count = 0

  const visit = (currentNode: ts.Node): void => {
    if (
      ts.isBinaryExpression(currentNode) &&
      (currentNode.operatorToken.kind ===
        ts.SyntaxKind.AmpersandAmpersandToken ||
        currentNode.operatorToken.kind === ts.SyntaxKind.BarBarToken)
    ) {
      count += 1
    }

    currentNode.forEachChild(visit)
  }

  visit(node)

  return count
}

const mutationTarget = (
  node:
    | ts.ArrayLiteralExpression
    | ts.ElementAccessExpression
    | ts.Identifier
    | ts.ObjectLiteralExpression
    | ts.PropertyAccessExpression,
): string => {
  if (ts.isIdentifier(node)) {
    return node.text
  }

  return node.getText()
}

const isAssignmentOperatorToken = (kind: ts.SyntaxKind): boolean =>
  kind === ts.SyntaxKind.EqualsToken ||
  kind === ts.SyntaxKind.PlusEqualsToken ||
  kind === ts.SyntaxKind.MinusEqualsToken ||
  kind === ts.SyntaxKind.AsteriskEqualsToken ||
  kind === ts.SyntaxKind.AsteriskAsteriskEqualsToken ||
  kind === ts.SyntaxKind.SlashEqualsToken ||
  kind === ts.SyntaxKind.PercentEqualsToken ||
  kind === ts.SyntaxKind.AmpersandEqualsToken ||
  kind === ts.SyntaxKind.BarEqualsToken ||
  kind === ts.SyntaxKind.CaretEqualsToken ||
  kind === ts.SyntaxKind.LessThanLessThanEqualsToken ||
  kind === ts.SyntaxKind.GreaterThanGreaterThanEqualsToken ||
  kind === ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken ||
  kind === ts.SyntaxKind.AmpersandAmpersandEqualsToken ||
  kind === ts.SyntaxKind.BarBarEqualsToken ||
  kind === ts.SyntaxKind.QuestionQuestionEqualsToken

const analyzeFunctionMetrics = (
  node:
    | ts.ArrowFunction
    | ts.ConstructorDeclaration
    | ts.FunctionDeclaration
    | ts.FunctionExpression
    | ts.GetAccessorDeclaration
    | ts.MethodDeclaration
    | ts.SetAccessorDeclaration,
  sourceFile: ts.SourceFile,
): IFunctionMetrics => {
  let nextBranchId = 0
  const branchStack: number[] = []
  const branchMutations = new Map<number, Set<string>>()
  const branchesWithMutations = new Set<number>()
  const branchesWithSideEffects = new Set<number>()
  const returnShapes = new Set<string>()
  let maxDepth = 0
  let asyncInsideBranches = 0
  let tryCatchInsideBranches = 0
  let booleanGuardComplexity = 0

  const withBranch = (branchNode: ts.Node): void => {
    const branchId = nextBranchId
    nextBranchId += 1
    branchStack.push(branchId)
    maxDepth = Math.max(maxDepth, branchStack.length)
    visit(branchNode)
    branchStack.pop()
  }

  const markMutation = (name: string): void => {
    const currentBranchId = branchStack.at(-1)

    if (currentBranchId === undefined) {
      return
    }

    const names = branchMutations.get(currentBranchId) ?? new Set<string>()
    names.add(name)
    branchMutations.set(currentBranchId, names)
    branchesWithMutations.add(currentBranchId)
  }

  const markSideEffect = (): void => {
    const currentBranchId = branchStack.at(-1)

    if (currentBranchId === undefined) {
      return
    }

    branchesWithSideEffects.add(currentBranchId)
  }

  const visit = (currentNode: ts.Node): void => {
    if (currentNode !== node && isFunctionLikeDeclaration(currentNode)) {
      return
    }

    if (ts.isIfStatement(currentNode)) {
      booleanGuardComplexity += countLogicalOperators(currentNode.expression)
      withBranch(currentNode.thenStatement)

      if (currentNode.elseStatement) {
        withBranch(currentNode.elseStatement)
      }

      return
    }

    if (
      ts.isForStatement(currentNode) ||
      ts.isForInStatement(currentNode) ||
      ts.isForOfStatement(currentNode) ||
      ts.isWhileStatement(currentNode) ||
      ts.isDoStatement(currentNode)
    ) {
      if ('expression' in currentNode && currentNode.expression) {
        booleanGuardComplexity += countLogicalOperators(currentNode.expression)
      }

      withBranch(currentNode.statement)
      return
    }

    if (ts.isSwitchStatement(currentNode)) {
      for (const clause of currentNode.caseBlock.clauses) {
        withBranch(clause)
      }

      return
    }

    if (ts.isTryStatement(currentNode) && branchStack.length > 0) {
      tryCatchInsideBranches += 1
    }

    if (ts.isAwaitExpression(currentNode) && branchStack.length > 0) {
      asyncInsideBranches += 1
    }

    if (
      ts.isBinaryExpression(currentNode) &&
      isAssignmentOperatorToken(currentNode.operatorToken.kind) &&
      (ts.isIdentifier(currentNode.left) ||
        ts.isPropertyAccessExpression(currentNode.left) ||
        ts.isElementAccessExpression(currentNode.left) ||
        ts.isArrayLiteralExpression(currentNode.left) ||
        ts.isObjectLiteralExpression(currentNode.left))
    ) {
      markMutation(mutationTarget(currentNode.left))
    }

    if (
      ts.isPrefixUnaryExpression(currentNode) ||
      ts.isPostfixUnaryExpression(currentNode)
    ) {
      if (
        currentNode.operator === ts.SyntaxKind.PlusPlusToken ||
        currentNode.operator === ts.SyntaxKind.MinusMinusToken
      ) {
        const operand = currentNode.operand

        if (
          ts.isIdentifier(operand) ||
          ts.isPropertyAccessExpression(operand) ||
          ts.isElementAccessExpression(operand)
        ) {
          markMutation(mutationTarget(operand))
        }
      }
    }

    if (
      (ts.isCallExpression(currentNode) || ts.isNewExpression(currentNode)) &&
      branchStack.length > 0
    ) {
      markSideEffect()
    }

    if (ts.isReturnStatement(currentNode)) {
      returnShapes.add(returnShape(currentNode.expression))
    }

    currentNode.forEachChild(visit)
  }

  if (node.body) {
    visit(node.body)
  }

  const mutatedAcrossBranches = new Map<string, number>()

  for (const names of branchMutations.values()) {
    for (const name of names) {
      mutatedAcrossBranches.set(
        name,
        (mutatedAcrossBranches.get(name) ?? 0) + 1,
      )
    }
  }

  const startLine =
    sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
  const endLine = sourceFile.getLineAndCharacterOfPosition(node.end).line + 1

  return {
    asyncInsideBranches,
    booleanGuardComplexity,
    branchMutations: branchesWithMutations.size,
    functionLines: endLine - startLine + 1,
    maxDepth,
    mixedReturnShapes: returnShapes.size > 1 ? returnShapes.size : 0,
    sharedMutableAcrossBranches: [...mutatedAcrossBranches.values()].filter(
      (count) => count > 1,
    ).length,
    sideEffectBranches: branchesWithSideEffects.size,
    tryCatchInsideBranches,
  }
}

const collectFunctionContexts = (
  file: string,
  sourceFile: ts.SourceFile,
): IFunctionContext[] => {
  const contexts: IFunctionContext[] = []

  const visit = (node: ts.Node): void => {
    if (isFunctionLikeDeclaration(node)) {
      const startLine =
        sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
          .line + 1
      const endLine =
        sourceFile.getLineAndCharacterOfPosition(node.end).line + 1

      contexts.push({
        displayName: getFunctionName(node),
        endLine,
        file,
        metrics: analyzeFunctionMetrics(node, sourceFile),
        startLine,
      })
    }

    node.forEachChild(visit)
  }

  visit(sourceFile)

  return contexts
}

const findContainingFunction = (
  functions: IFunctionContext[],
  line: number | undefined,
): IFunctionContext | null => {
  if (line === undefined) {
    return null
  }

  return (
    functions
      .filter((context) => line >= context.startLine && line <= context.endLine)
      .sort(
        (left, right) =>
          left.endLine - left.startLine - (right.endLine - right.startLine),
      )[0] ?? null
  )
}

const resolveNamedOwner = (
  functions: IFunctionContext[],
  hits: ICanonicalRuleHit[],
  currentOwner: IFunctionContext | null,
): IFunctionContext | null => {
  if (currentOwner && currentOwner.displayName !== '<anonymous>') {
    return currentOwner
  }

  const namedFunctions = functions.filter(
    (context) => context.displayName !== '<anonymous>',
  )

  for (const hit of hits) {
    const namedOwner = findContainingFunction(namedFunctions, hit.line)

    if (namedOwner) {
      return namedOwner
    }
  }

  return currentOwner
}

const computeSignalScore = (metrics: IFunctionMetrics): number =>
  Math.max(0, metrics.maxDepth - 2) +
  metrics.branchMutations * 2 +
  metrics.asyncInsideBranches * 2 +
  metrics.tryCatchInsideBranches * 2 +
  (metrics.mixedReturnShapes > 0 ? 2 : 0) +
  metrics.sharedMutableAcrossBranches * 3 +
  Math.max(0, metrics.sideEffectBranches - 1) * 3 +
  (metrics.functionLines > FUNCTION_LINE_THRESHOLD ? 1 : 0) +
  metrics.booleanGuardComplexity

const metricsReasons = (metrics: IFunctionMetrics): string[] => {
  const reasons: string[] = []

  if (metrics.maxDepth > 2) {
    reasons.push(`Nested branch depth reaches ${metrics.maxDepth}.`)
  }

  if (metrics.branchMutations > 0) {
    reasons.push(`Branches mutate state in ${metrics.branchMutations} places.`)
  }

  if (metrics.sharedMutableAcrossBranches > 0) {
    reasons.push(
      `Mutable state is shared across ${metrics.sharedMutableAcrossBranches} branch paths.`,
    )
  }

  if (metrics.asyncInsideBranches > 0) {
    reasons.push(
      `Async work appears inside ${metrics.asyncInsideBranches} branch paths.`,
    )
  }

  if (metrics.sideEffectBranches > 1) {
    reasons.push(
      `Side effects appear in ${metrics.sideEffectBranches} different branches.`,
    )
  }

  if (metrics.tryCatchInsideBranches > 0) {
    reasons.push('Try/catch handling is nested inside branching logic.')
  }

  if (metrics.mixedReturnShapes > 0) {
    reasons.push('The function returns more than one structural shape.')
  }

  if (metrics.functionLines > FUNCTION_LINE_THRESHOLD) {
    reasons.push(`Function spans ${metrics.functionLines} lines.`)
  }

  if (metrics.booleanGuardComplexity > 0) {
    reasons.push('Boolean guards contain multiple logical operators.')
  }

  return reasons
}

const severityFromScore = (score: number): TSeverity => {
  if (score >= 12) {
    return 'high'
  }

  if (score >= 7) {
    return 'medium'
  }

  return 'low'
}

const applyComplexityOverlay = (
  composer: FlatConfigComposer<Linter.Config>,
): FlatConfigComposer<Linter.Config> =>
  composer.clone().append({
    files: [GLOB_SRC],
    name: 'productive-eslint/analyze-complexity',
    rules: COMPLEXITY_RULES,
  })

const summarizeComplexityHotspots = (
  findings: IAnalyzerFinding[],
  top: number,
): IAnalyzerFileSummary[] =>
  findings
    .sort(
      (left, right) =>
        right.score - left.score || left.file.localeCompare(right.file),
    )
    .slice(0, top)
    .map((finding) => ({
      file: finding.file,
      findings: [finding],
      ...(finding.labels ? { labels: finding.labels } : {}),
      reasons: finding.reasons.slice(0, 3),
      score: finding.score,
    }))

export const analyzeComplexity = async (
  composer: FlatConfigComposer<Linter.Config>,
  context: IAnalyzerContext,
): Promise<IAnalyzerReport> => {
  if (context.top < 1) {
    throw new CliError('--top must be at least 1.')
  }

  const config = await applyComplexityOverlay(composer).toConfigs()
  const results = await runAnalyzerLint({
    config,
    context,
    ruleIds: COMPLEXITY_RULE_IDS,
  })
  const findings: IAnalyzerFinding[] = []

  for (const result of results) {
    if (result.messages.length === 0) {
      continue
    }

    const absolutePath = path.join(context.cwd, result.filePath)
    const sourceText = await readFile(absolutePath, 'utf8')
    const sourceFile = ts.createSourceFile(
      absolutePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      getScriptKind(absolutePath),
    )
    const functions = collectFunctionContexts(result.filePath, sourceFile)
    const groupedHits = new Map<
      string,
      {
        context: IFunctionContext | null
        hits: ICanonicalRuleHit[]
      }
    >()

    for (const message of result.messages) {
      if (!message.ruleId || !COMPLEXITY_RULE_IDS.includes(message.ruleId)) {
        continue
      }

      const owner = findContainingFunction(functions, message.line)
      const hotspotKey = owner
        ? `${result.filePath} :: ${owner.displayName}:${owner.startLine}`
        : `${result.filePath} :: <module>:0`
      const entry = groupedHits.get(hotspotKey) ?? {
        context: owner,
        hits: [],
      }

      entry.hits.push({
        line: message.line,
        message: message.message,
        ruleId: message.ruleId,
      })
      groupedHits.set(hotspotKey, entry)
    }

    for (const [, entry] of groupedHits) {
      const namedOwner = resolveNamedOwner(functions, entry.hits, entry.context)
      const metrics = namedOwner?.metrics ?? {
        asyncInsideBranches: 0,
        booleanGuardComplexity: 0,
        branchMutations: 0,
        functionLines: 0,
        maxDepth: 0,
        mixedReturnShapes: 0,
        sharedMutableAcrossBranches: 0,
        sideEffectBranches: 0,
        tryCatchInsideBranches: 0,
      }
      const canonicalScore = entry.hits.reduce(
        (sum, hit) => sum + (CANONICAL_RULE_SCORE_MAP[hit.ruleId] ?? 1),
        0,
      )
      const signalScore = computeSignalScore(metrics)
      const score = canonicalScore + signalScore
      const severity = severityFromScore(score)
      const functionLabel = namedOwner
        ? `${result.filePath} :: ${namedOwner.displayName}`
        : `${result.filePath} :: <module>`
      const canonicalReasons = entry.hits.map(
        (hit) =>
          `${CANONICAL_RULE_REASON_MAP[hit.ruleId] ?? hit.message} (${hit.ruleId} at line ${hit.line})`,
      )
      const enrichedReasons = [...canonicalReasons, ...metricsReasons(metrics)]

      findings.push({
        category: 'semantic-change-risk',
        confidence: 'medium',
        file: functionLabel,
        labels: [
          severity,
          ...(namedOwner
            ? [`function:${namedOwner.displayName}`]
            : ['module-scope']),
        ],
        reasons: enrichedReasons,
        ruleId: 'complexity/hotspot',
        score,
        severity,
      })
    }
  }

  const summaries = summarizeComplexityHotspots(findings, context.top)
  const highRiskCount = findings.filter(
    (finding) => finding.severity === 'high',
  ).length
  const mediumRiskCount = findings.filter(
    (finding) => finding.severity === 'medium',
  ).length
  const lowRiskCount = findings.filter(
    (finding) => finding.severity === 'low',
  ).length
  const firstSummary = summaries[0]

  return {
    fileCount: results.length,
    findingsCount: findings.length,
    nextStep: firstSummary
      ? `Start with \`${firstSummary.file}\` and reduce the branch and side-effect risk there first.`
      : 'No complexity hotspots were reported by the current analyzer ruleset.',
    suggestedOrder: summaries.map((summary) => summary.file),
    summaries,
    summaryLines: [
      `High-risk hotspots: \`${highRiskCount}\``,
      `Medium-risk hotspots: \`${mediumRiskCount}\``,
      `Low-risk hotspots: \`${lowRiskCount}\``,
    ],
    title: 'Complexity Analysis',
  }
}
