# SpriteStack

SpriteStack — Season 0 MVP
Target: engineers with 5–10 years experience. Curriculum spine: AI tools, MCP, cloud infra, architecture, plus selective advanced SWE. Pixel world + real sandboxes ship as one product.

Shared ship definition (all teams)
A mid-senior engineer can create an account, play through Act I in the 8-bit city of Stackfall, complete graded quests in AI/MCP/cloud/ architecture, restore District Alpha end-to-end, invite a peer to walk their city, and feel the work matched their seniority — not junior leetcode.
5–10 yrs
ICP seniority
1 district
World scope
24 quests
Graded content
6 weeks
Target build
What meshes (single product contract)
Player moment	Product owns	Engineering owns	Design owns
Enter Stackfall	Onboarding narrative + ICP tone	Auth, world load, save state	Title screen, avatar, city tileset
Pick a quest	Quest board taxonomy + difficulty	Quest DSL + routing to sandbox	Board UI, NPC quest-givers
Do real work	Task authenticity for 5–10yr bar	IDE/sandbox/MCP/cloud runners	Split layout: world ↔ workbench
Get judged	Rubrics, pass/fail, feedback copy	Graders, LLM-assist judge hooks	Victory/fail FX, loot reveal
Restore the city	Progression map of 24 quests	Tile unlock events + persistence	8-bit restoration animations
Share / visit	Social CTA + privacy defaults	Shareable city URL + presence	Visit mode chrome + peer sprites
Product team — MVP
Owns what ships, for whom, and the bar for “senior enough.”

Positioning & ICP
• Position SpriteStack as continuing education for mid-senior ICs — architecture judgment under AI-accelerated tooling — not interview prep.

• ICP: 5–10 years SWE/SRE/platform; already ships systems; wants sharp practice on AI tools, MCP, cloud, and architecture tradeoffs.

• Explicit non-ICP for Season 0: bootcamp grads, pure leetcode grinders, managers who don’t write/design systems.

Content scope (24 quests)
• Track A — AI tools (6): agent workflows, eval harnesses, prompt/ tool routing, cost/latency tradeoffs, safe tool use.

• Track B — MCP (5): design an MCP server, auth scopes, tool contracts, failure modes, multi-server orchestration.

• Track C — Cloud infra (6): IAM least-privilege, networking, observability, deploy/rollback, cost guardrails, multi-region sketch.

• Track D — Architecture (5): ADRs, boundaries, consistency models, migration plans, “AI feature in existing system” design.

• Track E — Advanced SWE (2): performance incident, API evolution / compatibility — keep thin; supports the other tracks.

Player journey & progression
• Act I only: prologue → District Alpha (AI Spire + Infra Annex as one contiguous map).

• Quest Board is the hub; 24 tickets unlock in a soft graph (not pure linear) with 1 raid boss at 80% district restore.

• Raid boss = timed multi-skill incident: AI agent misbehaving in prod + MCP tool blast radius + cloud rollback decision.

• Loot = Blueprints (reusable pattern cards) — cosmetic + reference, never paywall skill XP.

• End state: fully restored District Alpha + share link + “Season 0 complete” prestige mark.

Product deliverables
• PRD + quest catalog with acceptance rubrics per quest

• Difficulty calibration doc (5–10yr bar examples / anti-examples)

• Onboarding copy + failure feedback principles

• Privacy defaults for shareable cities

• Success metrics: completion rate, time-to-first-restore, NPS, “felt senior” survey item

Engineering team — MVP
Owns runnable truth: world state, sandboxes, graders, share links.

Client & world
• Web client: Phaser/Pixi world canvas + React workbench shell (quest UI, docs, terminal).

• Load District Alpha map from Tiled; tile-unlock events driven by quest completion payloads.

• Avatar movement, collision, NPC interact → opens Quest Board / workbench without full page reload.

• Visit mode: read-only city from share token; peer sprite optional (async visit OK for MVP).

Quest runtime (must match Product tracks)
• Quest DSL (JSON schema): metadata, assets, starter repo, grader type, rubric, loot id, tile unlock ids.

• Sandbox A — coding: containerized runner for AI-tool/SWE quests (tests as truth).

• Sandbox B — MCP: local mock MCP host + fixture servers; grade tool schemas, auth, and behavior under fault injection.

• Sandbox C — cloud: ephemeral lab (or Terraform/Pulumi plan-mode + policy checks) — no long-lived prod accounts in MVP.

• Sandbox D — architecture: structured ADR / diagram submission + rubric scorer (rules + LLM judge with human-authored rubrics).

• Raid boss orchestrator: sequenced multi-sandbox scenario with timer and shared incident state.

Platform
• Auth (OAuth + email), player profile, progress store

• Event-sourced world progress (quest_completed → tiles)

• Shareable city URLs with privacy flag

• Telemetry: funnel, quest attempt/pass, sandbox cost

• Admin: content pack deploy for 24 quests without redeploying client art when possible

Engineering deliverables
• Playable District Alpha build (web)

• 24 quests wired end-to-end (even if some rubrics are v0)

• Graders green in CI for sample solutions

• Cost ceiling doc for sandboxes at 1k DAU

• Anti-cheat notes: detect trivial paste / empty ADR submissions

Design team — MVP
Owns the fantasy and readability: characters, city, and the workbench that doesn’t break immersion.

Art direction
• Style lock: 16×16 / 32×32 pixel characters; industrial-whimsical Stackfall (ruined tech city), readable at 2×/3× scale.

• Palette: limited city palette + district accent (AI Spire vs Infra Annex) — no neon crypto look.

• One playable avatar set (3–4 variants) + 6 NPCs (quest givers / mentors) with idle + talk frames.

• District Alpha tileset: ruined → restored variants for every unlockable tile group Product lists.

• VFX: tile restore, quest complete, raid alert, blueprint loot — short, punchy, 8-bit.

UX / UI (meshes with Eng shell)
• Primary layout: world viewport + slide-over / docked Workbench (IDE, MCP inspector, cloud lab, ADR editor) — Design owns the chrome; Eng owns editors.

• Quest Board, Blueprint inventory, progress map, share sheet — pixel-adjacent UI, not generic SaaS cards.

• Feedback states for pass/fail that respect senior tone (precise, not childish).

• Visit mode: distinct framing so guests know they’re in someone’s restored city.

• Accessibility: UI scale, contrast for chrome; world can stay aesthetic-first with keyboard move.

Narrative design (with Product)
• Prologue script + NPC dialogue for Act I

• Quest flavor text for all 24 (hooks, not fluff)

• Raid boss cinematic beats (still 8-bit)

Design deliverables
• Art bible + palette + sprite sheets (avatar, NPCs, tiles, VFX)

• Tiled-ready District Alpha map (ruined + restored layers)

• Figma (or equiv) for Workbench, Quest Board, share/visit

• Motion spec for restore/complete/raid

• Asset handoff package Eng can drop into Phaser/Pixi

Cross-team milestones (one calendar)
Week	Product	Engineering	Design
1	PRD + quest catalog draft; rubric bar	World spike + auth skeleton	Art bible; avatar + tileset start
2	Lock 24 quest briefs; raid design	Quest DSL + first coding sandbox	District Alpha map v1; NPC set
3	Content review pass 1 (senior bar)	MCP + architecture graders online	Workbench UX; restore VFX
4	Copy freeze for Act I; metrics plan	Cloud lab + tile unlock pipeline	UI polish; share/visit frames
5	Playtest with 8 ICP users	Wire all 24; raid boss path	Bugfix art/UI from playtest
6	Ship/no-ship; Season 0 launch notes	Hardening, cost, share links	Final asset pack + launch trailer stills
Dependencies (so nothing ships half-baked)
Design → Eng
Tile group IDs and sprite names must match Product’s unlock list before Eng wires quest_completed events. Workbench chrome specs before sandbox panels are embedded.

Product → Eng + Design
Quest catalog + rubrics freeze mid Week 2. No new quest types after that without cutting another. Raid boss needs all four sandbox types available.

Eng → Product + Design
Sandbox capabilities dictate what’s “real” in quest briefs. If cloud lab is plan-mode only, Product writes quests that grade plans/policies — Design still shows a full Infra Annex restore. Honesty in grading, spectacle in the world.

Done means complete product
Not a vertical slice of “one quest in a grey box.” Season 0 MVP = 8-bit District Alpha + 24 senior-calibrated quests across AI/MCP/ cloud/architecture (+2 advanced SWE) + graders + restore fantasy + shareable city. If any pillar is missing, delay ship.
