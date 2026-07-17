import type { GraderSpec, Quest, RubricItem } from './dsl'

export interface RubricResult {
  item: RubricItem
  score: number // 0..100
  note: string
}

export interface GradeResult {
  passed: boolean
  overall: number // 0..100 weighted
  rubric: RubricResult[]
  feedback: string // senior-tone summary
  antiCheat?: string // populated when a submission looks trivial/empty
}

const PASS_THRESHOLD = 60

function has(hay: string, needle: string): boolean {
  return hay.toLowerCase().includes(needle.toLowerCase())
}

function countLines(s: string): number {
  return s.split('\n').filter((l) => l.trim().length > 0).length
}

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

// Detect trivial paste / empty submissions (anti-cheat note in the spec).
function antiCheat(submission: string, grader: GraderSpec): string | undefined {
  const trimmed = submission.trim()
  if (trimmed.length === 0) return 'Empty submission.'
  if (trimmed.length < 20) return 'Submission is too short to grade seriously.'
  if (grader.kind === 'architecture' && countWords(trimmed) < 25) {
    return 'This reads like a stub, not an ADR. Senior reviewers want reasoning.'
  }
  const uniqueRatio = new Set(trimmed.replace(/\s/g, '')).size / Math.max(1, trimmed.replace(/\s/g, '').length)
  if (uniqueRatio < 0.03) return 'Submission looks like repeated filler characters.'
  return undefined
}

function weighted(results: RubricResult[]): number {
  const total = results.reduce((sum, r) => sum + r.item.weight, 0) || 1
  return Math.round(results.reduce((sum, r) => sum + r.score * r.item.weight, 0) / total)
}

function gradeCoding(sub: string, g: Extract<GraderSpec, { kind: 'coding' }>, rubric: RubricItem[]): RubricResult[] {
  const lineOk = countLines(sub) >= g.minLines
  const includeHits = g.mustInclude.filter((k) => has(sub, k)).length
  const includeRatio = g.mustInclude.length ? includeHits / g.mustInclude.length : 1
  const forbiddenHit = (g.mustNotInclude ?? []).some((k) => has(sub, k))

  return rubric.map((item, idx) => {
    // Distribute signal: first item leans on required tokens, others on
    // structure + line budget, all penalised by forbidden anti-patterns.
    let score = Math.round(includeRatio * 100)
    if (idx > 0) score = Math.round((includeRatio * 0.6 + (lineOk ? 0.4 : 0)) * 100)
    if (forbiddenHit) score = Math.min(score, 40)
    const note = forbiddenHit
      ? 'Contains a flagged anti-pattern.'
      : includeRatio === 1 && lineOk
        ? 'Required constructs present.'
        : includeRatio < 1
          ? `Missing expected constructs (${g.mustInclude.join(', ')}).`
          : 'Too thin — add real logic.'
    return { item, score, note }
  })
}

function gradeMcp(sub: string, g: Extract<GraderSpec, { kind: 'mcp' }>, rubric: RubricItem[]): RubricResult[] {
  let parsed: unknown = null
  let parseErr = false
  try {
    parsed = JSON.parse(sub)
  } catch {
    parseErr = true
  }
  const obj = (parsed ?? {}) as Record<string, unknown>
  const topOk = g.requiredTopLevel.filter((k) => k in obj).length / (g.requiredTopLevel.length || 1)

  // Tools may live at the top level or be owned by composed servers.
  let tools: Record<string, unknown>[] = []
  if (Array.isArray(obj.tools)) {
    tools = obj.tools as Record<string, unknown>[]
  } else if (Array.isArray(obj.servers)) {
    tools = (obj.servers as { tools?: Record<string, unknown>[] }[]).flatMap((s) => s.tools ?? [])
  }

  const fieldCoverage = tools.length
    ? tools.reduce((acc, t) => acc + g.requiredToolFields.filter((f) => f in t).length / (g.requiredToolFields.length || 1), 0) / tools.length
    : 0

  return rubric.map((item, idx) => {
    let score: number
    if (parseErr) score = 0
    else if (idx === 0) score = Math.round(topOk * 100)
    else score = Math.round(fieldCoverage * 100)
    if (g.requireAuthScopes && !has(sub, 'scope')) score = Math.min(score, 45)
    const note = parseErr
      ? 'Submission is not valid JSON.'
      : score >= 80
        ? 'Manifest satisfies the contract.'
        : `Missing required keys (top-level: ${g.requiredTopLevel.join(', ')}; per-tool: ${g.requiredToolFields.join(', ')}).`
    return { item, score, note }
  })
}

function gradeCloud(sub: string, g: Extract<GraderSpec, { kind: 'cloud' }>, rubric: RubricItem[]): RubricResult[] {
  const lineOk = countLines(sub) >= g.minLines
  const hits = g.requiredPolicies.filter((k) => has(sub, k)).length
  const ratio = g.requiredPolicies.length ? hits / g.requiredPolicies.length : 1
  const forbiddenHit = g.forbidden.some((k) => has(sub, k))
  return rubric.map((item, idx) => {
    let score = Math.round(ratio * 100)
    if (idx > 0) score = Math.round((ratio * 0.7 + (lineOk ? 0.3 : 0)) * 100)
    if (forbiddenHit) score = Math.min(score, 35)
    const note = forbiddenHit
      ? 'Contains a forbidden pattern (e.g. wildcard / open ingress).'
      : ratio === 1
        ? 'Required policy elements present.'
        : `Missing policy elements (${g.requiredPolicies.join(', ')}).`
    return { item, score, note }
  })
}

function gradeArchitecture(sub: string, g: Extract<GraderSpec, { kind: 'architecture' }>, rubric: RubricItem[]): RubricResult[] {
  const words = countWords(sub)
  const wordOk = words >= g.minWords
  const hits = g.requiredSections.filter((s) => has(sub, s)).length
  const ratio = g.requiredSections.length ? hits / g.requiredSections.length : 1
  return rubric.map((item, idx) => {
    let score = Math.round(ratio * 100)
    if (idx > 0) score = Math.round((ratio * 0.6 + (wordOk ? 0.4 : 0)) * 100)
    const note = ratio < 1
      ? `Missing sections (${g.requiredSections.join(', ')}).`
      : wordOk
        ? 'Structured and substantive.'
        : `Add depth — under the ${g.minWords}-word bar for this rubric.`
    return { item, score, note }
  })
}

export function grade(quest: Quest, submission: string): GradeResult {
  const g = quest.grader
  const cheat = antiCheat(submission, g)
  if (cheat) {
    const rubric = quest.rubric.map((item) => ({ item, score: 0, note: 'Not graded — submission rejected.' }))
    return { passed: false, overall: 0, rubric, feedback: 'Rejected before grading.', antiCheat: cheat }
  }

  let results: RubricResult[]
  switch (g.kind) {
    case 'coding':
      results = gradeCoding(submission, g, quest.rubric)
      break
    case 'mcp':
      results = gradeMcp(submission, g, quest.rubric)
      break
    case 'cloud':
      results = gradeCloud(submission, g, quest.rubric)
      break
    case 'architecture':
      results = gradeArchitecture(submission, g, quest.rubric)
      break
  }

  const overall = weighted(results)
  const passed = overall >= PASS_THRESHOLD
  const feedback = passed
    ? `Pass — ${overall}/100. Reads like ${quest.difficulty}-level work. Loot unlocked: ${quest.loot.name}.`
    : `Not yet — ${overall}/100 (need ${PASS_THRESHOLD}). ${results
        .filter((r) => r.score < 60)
        .map((r) => r.item.label)
        .slice(0, 2)
        .join('; ') || 'Tighten the weak areas'} needs work.`
  return { passed, overall, rubric: results, feedback }
}

export { PASS_THRESHOLD }
