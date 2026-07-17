import type { Quest, SandboxType } from './dsl'

// Per-sandbox starter scaffolds so the player begins from a senior-shaped
// blank page, not a truly empty box.
const STARTERS: Record<SandboxType, string> = {
  coding: `// Implement the solution. The grader checks for real structure, not just keywords.
function solve(input) {
  // ...
}
`,
  mcp: `{
  "server": { "name": "annex-tools", "version": "0.1.0" },
  "tools": [
    {
      "name": "example_tool",
      "description": "what it does",
      "inputSchema": { "type": "object", "properties": {} }
    }
  ]
}
`,
  cloud: `# Plan-mode submission (no live prod). Describe policies, not vibes.
resource: 
allow:
  action:
`,
  architecture: `# ADR-000: <title>

## Context

## Decision

## Consequences
`,
}

export function starterFor(quest: Quest): string {
  // Tailor a couple of high-signal starters to their rubric sections.
  if (quest.grader.kind === 'architecture') {
    const sections = quest.grader.requiredSections.map((s) => `## ${s}\n`).join('\n')
    return `# ADR: ${quest.title}\n\n${sections}`
  }
  return STARTERS[quest.sandbox]
}
