// Quest DSL — the JSON-serialisable contract shared by Product (rubrics),
// Engineering (grader routing + tile unlocks) and Design (loot + flavor).

export type TrackId = 'A' | 'B' | 'C' | 'D' | 'E'

export type SandboxType =
  | 'coding' // Sandbox A — containerized runner, tests as truth
  | 'mcp' // Sandbox B — MCP host + fixture servers
  | 'cloud' // Sandbox C — plan-mode lab + policy checks
  | 'architecture' // Sandbox D — ADR / diagram submission + rubric scorer

export type Difficulty = 'mid' | 'senior' | 'staff'

export interface Track {
  id: TrackId
  name: string
  accent: 'ai' | 'infra'
  blurb: string
}

export interface RubricItem {
  id: string
  label: string
  weight: number // 0..1, weights across a quest sum to 1
}

export interface Blueprint {
  id: string
  name: string
  pattern: string // the reusable pattern card text
}

export interface Quest {
  id: string
  track: TrackId
  title: string
  difficulty: Difficulty
  sandbox: SandboxType
  hook: string // narrative flavor, senior tone
  brief: string // what the player must actually do
  rubric: RubricItem[]
  loot: Blueprint
  tileUnlock: string // tile group id restored on pass
  // Soft-graph gating: quest ids that should be complete first (advisory).
  requires?: string[]
  // Grader configuration, interpreted by graders.ts per sandbox type.
  grader: GraderSpec
  // The raid boss: a timed multi-skill incident unlocked at 80% restore.
  raid?: boolean
  // % of district restored required before this quest is playable (0..1).
  unlockAt?: number
}

export type GraderSpec =
  | CodingGrader
  | McpGrader
  | CloudGrader
  | ArchitectureGrader

export interface CodingGrader {
  kind: 'coding'
  language: 'ts' | 'pseudo'
  // Substrings/regex that MUST appear, and forbidden anti-patterns.
  mustInclude: string[]
  mustNotInclude?: string[]
  minLines: number
}

export interface McpGrader {
  kind: 'mcp'
  // Player submits a JSON MCP tool/server manifest. These keys must exist.
  requiredTopLevel: string[]
  requiredToolFields: string[]
  requireAuthScopes: boolean
}

export interface CloudGrader {
  kind: 'cloud'
  // Player submits an IaC plan / policy sketch (text). Policy keywords.
  requiredPolicies: string[]
  forbidden: string[]
  minLines: number
}

export interface ArchitectureGrader {
  kind: 'architecture'
  // ADR submission. Headings required + min prose to beat anti-cheat.
  requiredSections: string[]
  minWords: number
}

export const TRACKS: Track[] = [
  { id: 'A', name: 'AI Tools', accent: 'ai', blurb: 'Agent workflows, evals, routing, cost/latency, safe tool use.' },
  { id: 'B', name: 'MCP', accent: 'ai', blurb: 'Server design, auth scopes, tool contracts, fault modes, orchestration.' },
  { id: 'C', name: 'Cloud Infra', accent: 'infra', blurb: 'IAM, networking, observability, deploy/rollback, cost, multi-region.' },
  { id: 'D', name: 'Architecture', accent: 'infra', blurb: 'ADRs, boundaries, consistency, migrations, AI-in-existing-systems.' },
  { id: 'E', name: 'Advanced SWE', accent: 'ai', blurb: 'Performance incidents and API evolution — thin, supports other tracks.' },
]

export function trackById(id: TrackId): Track {
  const t = TRACKS.find((x) => x.id === id)
  if (!t) throw new Error(`unknown track ${id}`)
  return t
}

export const SANDBOX_LABEL: Record<SandboxType, string> = {
  coding: 'Coding Sandbox',
  mcp: 'MCP Inspector',
  cloud: 'Cloud Lab (plan-mode)',
  architecture: 'ADR Editor',
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  mid: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
}
