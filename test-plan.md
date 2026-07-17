# SpriteStack Season 0 MVP — Test Plan

App: http://localhost:5173 (Vite dev). No backend; client-side, localStorage.
Focus: breadth across sandbox types, tile restore, share/visit read-only, anti-cheat, reload persistence.
Grader source of truth: `src/quests/graders.ts` (PASS_THRESHOLD=60). Gating: `src/state/progress.ts`.

## Setup (already done, not part of recording)
- Login as handle `tony` → click ENTER STACKFALL. World + HUD render.

## Test 1 — Quest Board layout + gating (locked quests)
Open QUEST BOARD (top-right). 
- PASS if 5 track sections show counts A 0/6, B 0/5, C 0/6, D 0/5, E 0/2, plus a raid boss card.
- PASS if `a2 Build an Eval Harness` shows 🔒 (requires a1) and raid quest shows 🔒 (requires 80%). Available quests (a1, b1, c1, d1) show `·`.
- FAIL if a2 or raid are clickable/available before prerequisites.

## Test 2 — Anti-cheat rejects empty/trivial (coding quest a1)
Open `a1 Wire an Agent Loop` (coding). Clear textarea → RUN GRADERS with empty.
- PASS if result is FAIL — 0/100 with "Anti-cheat: Empty submission." and quest NOT restored.
Then type just `x` (1 char) → RUN GRADERS.
- PASS if FAIL with anti-cheat "too short to grade seriously." Quest still not restored.
- FAIL if either empty/trivial submission passes or restores a tile.

## Test 3 — Coding grader passes valid solution + tile restore + blueprint + meter (a1)
In `a1`, replace textarea with a real bounded agent loop containing tokens `while`, `tool`, `step`, ≥6 non-empty lines, and NOT `while(true)`/`while (true)`. Example:
```
let step = 0
const maxSteps = 5
while (step < maxSteps) {
  const plan = decide(step)
  const result = tool(plan)
  if (done(result)) break
  step++
}
```
RUN GRADERS.
- PASS if result shows PASS — score ≥60, "★ RESTORED" badge, BLUEPRINT LOOT card "Bounded Agent Loop".
- PASS if HUD RESTORE meter increments from 0% to ~4% (1/24) and BLUEPRINTS count = 1.
- Close workbench; PASS if a1 building in world changes from ruined (gray) to restored (colored border/roof/★ label).
- FAIL if score <60, no restore, meter/blueprint unchanged, or building stays ruined.

## Test 4 — MCP starter passes as-is = 100 (b1)
Open `b1 Design an MCP Server`. Do NOT edit the prefilled JSON starter. RUN GRADERS.
- PASS if PASS — 100/100 (starter already satisfies server+tools+name/description/inputSchema).
- FAIL if <100 or FAIL.

## Test 5 — Cloud grader + forbidden wildcard (c1)
Open `c1 IAM Least-Privilege`. Submit a valid least-privilege plan (≥6 lines) containing `allow`, `resource`, `action`, no `"*"`. Example lines with named ARNs.
- PASS if PASS ≥60, tile c1 restored.
Then edit to include an action wildcard `"*"` and re-run.
- PASS if score drops (capped ≤35 on forbidden hit → FAIL) and note mentions forbidden pattern. Because c1 already restored, no de-restore expected — verify the score/feedback reflects the cap.
- FAIL if wildcard version still scores ≥60.

## Test 6 — Architecture ADR: stub rejected + valid passes (d1)
Open `d1 Write a Real ADR`. The starter has section headers but few words → RUN GRADERS.
- PASS if FAIL with anti-cheat "reads like a stub, not an ADR" (architecture <25 words).
Then paste a real ADR (≥90 words) including sections Context, Decision, Consequences, Alternative. RUN GRADERS.
- PASS if PASS ≥60, tile d1 restored, blueprint "ADR Template" awarded.
- FAIL if stub passes or valid ADR fails.

## Test 7 — Blueprints inventory
Open BLUEPRINTS. 
- PASS if count matches quests passed so far (a1, b1, c1, d1 = 4 cards) with correct names.
- FAIL if count/names mismatch passed quests.

## Test 8 — Share City → read-only Visit mode
Open SHARE CITY. Copy the `?visit=<token>` URL from the field.
- Open that URL in a new tab. PASS if banner reads "VISITING tony's Stackfall" with "% restored", restored buildings appear lit, and there is NO SIGN OUT/QUEST BOARD authoring HUD (instead VIEW PROGRESS / BUILD YOUR OWN).
- Click VIEW PROGRESS, open a restored quest. PASS if Workbench shows "VISIT MODE (read-only)", textarea disabled, and RUN GRADERS button is absent/disabled.
- FAIL if visit tab allows grading or shows editable submission.

## Test 9 — Reload persistence
Return to main app tab (no ?visit). Reload the page.
- PASS if still signed in as tony (no Login screen), HUD shows same restore % and blueprint count, and restored buildings remain lit.
- FAIL if reload logs out or resets progress.
