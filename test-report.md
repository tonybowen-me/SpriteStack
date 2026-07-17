# SpriteStack Season 0 MVP — Test Report

**PR:** #1 (`devin/1784306659-season0-mvp`)
**Env:** Local Vite dev server (`npm run dev`, Node 22) at http://localhost:5173. No backend; client-side, localStorage.
**Method:** Full end-to-end UI testing of the golden path, breadth across all four sandbox types, tile restore, share/visit, anti-cheat, gating, and reload persistence. Recording attached.

## Headline result
The **game logic (graders, gating, tile restore, blueprints, share/visit, persistence, anti-cheat) all work correctly**. However, I found **one major bug**: the Workbench submission editor cannot receive `SPACE`, `W`, `A`, `S`, or `D` keystrokes, because the Phaser game captures those keys globally. This makes typing any real submission impossible for the coding/cloud/architecture sandboxes. I verified grader behavior by injecting submission text as a workaround (clearly disclosed below).

---

## 🔴 BUG — Workbench editor swallows SPACE / W / A / S / D (and quest-switches on SPACE/E)

**Severity: High.** The core "type a submission → RUN GRADERS" loop is broken via keyboard for coding, cloud, and architecture quests (every real submission needs spaces and those letters). MCP is unaffected only because its starter passes untouched.

**Two observable symptoms:**
1. **Keys are dropped.** Typing `let step = 0 / const maxSteps = 5 / while (step < maxSteps)...` produced `lettep=0 / contmxStep=5 / hile(tep<mxStep)...` — every space and every `w/a/s/d` was missing.
2. **SPACE/E switch the quest.** When the player avatar is within 120px of a building, pressing SPACE or `e` in the editor triggers the world's interact handler, closing the current quest and opening the nearest building's quest — discarding the in-progress submission.

**Root cause (code):** `src/game/WorldScene.ts` lines 88–96 register the movement/interact keys with `kb.addKey(...)` and `kb.on('keydown-SPACE'/'keydown-E', ...)`. Phaser's `addKey` defaults `enableCapture=true`, which calls `preventDefault` on the native DOM event, and Phaser keyboard captures are **global** (per Phaser docs). These listeners stay active while the React Workbench overlay is open, so W/A/S/D/SPACE never reach the focused `<textarea>`, and SPACE/E also fire `tryInteract()`.

**Suggested fix:** Disable the scene's keyboard input (e.g. `this.input.keyboard.enabled = false` / `disableGlobalCapture()`) while a Workbench/overlay is open, or ignore interact keys when the event target is an input/textarea.

| 🔴 Typing `abc` + one space switches quest to RAID | 🔴 Typed code with all spaces + w/a/s/d dropped |
|---|---|
| ![space switches quest](https://app.devin.ai/attachments/a1fb8257-fe1d-497d-ac29-7e0cfbe95d63/ss_e8ad6491.png) | ![dropped keys](https://app.devin.ai/attachments/8ade3800-1bbd-4960-a67e-10cdbdde37ec/ss_875f3437.png) |

**Testing workaround:** To verify the graders still function, I set the textarea value programmatically (React controlled-input setter + `input` event) instead of typing, then clicked RUN GRADERS normally. All grader results below used this workaround for the coding/cloud/architecture submissions. MCP and all stub/empty cases used the real prefilled starter with no typing.

---

## Test results

### 1. Quest Board layout + prerequisite gating — PASS
5 tracks with correct counts (A 6+raid=7, B 5, C 6, D 5, E 2). Locked (🔒) quests: `a2` (needs a1), raid (needs 80%), `b2–b5`, `Deploy & Rollback`, `Multi-Region`, `d2–d5` — all matching their `requires`. Available quests show `·`.

![quest board gating](https://app.devin.ai/attachments/cb80a2d5-e0b1-4af5-90de-5e49af0f5efa/ss_1d3a9229.png)

### 2. Anti-cheat rejects empty/trivial (coding a1) — PASS
Empty submission → `FAIL — 0/100`, "Anti-cheat: Empty submission." Single char `x` → "Submission is too short to grade seriously." No tile restored; HUD stayed 0%.

![anti-cheat empty](https://app.devin.ai/attachments/8a8914f0-e576-4606-a7cc-06079b4b4392/ss_921f5124.png)

### 3. Coding grader pass + tile restore + blueprint + meter (a1) — PASS (via injection workaround)
Valid bounded agent loop → `PASS — 100/100`, ★ RESTORED, "Bounded Agent Loop" blueprint. HUD: 0%→4%, BLUEPRINTS 0→1. The a1 building lit cyan (roof/border/light) with a ★ label while ruined neighbors stayed gray with `·`.

| PASS 100/100 + blueprint | Tile restored (cyan a1 vs gray neighbors) |
|---|---|
| ![coding pass](https://app.devin.ai/attachments/6da533a2-ff31-4ac7-bb78-a723d46dee12/ss_c498b1c0.png) | ![tile restore](https://app.devin.ai/attachments/d19a75a6-3b92-4155-adfd-c584435edd61/ss_zoom_9f368e32.png) |

### 4. MCP starter passes as-is = 100 (b1) — PASS
Ran graders on the untouched prefilled JSON manifest → `PASS — 100/100`, "MCP Server Skeleton" blueprint. HUD → 8%, BLUEPRINTS 2. (No typing needed — this is the one flow unaffected by the keyboard bug.)

![mcp pass](https://app.devin.ai/attachments/b0452e2c-3703-4440-aa23-f32d41598eae/ss_61924420.png)

### 5. Cloud grader + forbidden wildcard rejection (c1) — PASS (via injection workaround)
Valid least-privilege plan → `PASS — 100/100`, tile restored, HUD → 13%. Then a plan containing `action: "*"` → `FAIL — 35/100` (rubric all capped at 35), note about the forbidden pattern. Quest stayed RESTORED (no de-restore), HUD unchanged — correct.

![cloud wildcard fail](https://app.devin.ai/attachments/8b07951a-bc26-41e5-83d6-4bd18a828e08/ss_04338f85.png)

### 6. Architecture ADR: stub rejected + valid passes (d1) — PASS (valid via injection workaround)
Prefilled stub (headers only) → `FAIL — 0/100`, "Anti-cheat: This reads like a stub, not an ADR." A substantive 141-word ADR with all required sections → `PASS — 100/100`, "ADR Template" blueprint, HUD → 17%.

| 🔴 Stub rejected | 🟢 Substantive ADR passes |
|---|---|
| ![adr stub fail](https://app.devin.ai/attachments/cee138a1-b4e4-4b3b-9de1-677ba9a5f256/ss_f0b6589e.png) | ![adr pass](https://app.devin.ai/attachments/3bdf2400-a00f-4578-a310-d3fd75c76674/ss_e2a665f6.png) |

### 7. Blueprints inventory — PASS
Shows exactly 4 cards matching the 4 passed quests: Bounded Agent Loop, MCP Server Skeleton, Least-Privilege Policy, ADR Template.

![blueprints](https://app.devin.ai/attachments/e42b65bd-5fb4-4504-b035-1effcc08e932/ss_4933ce62.png)

### 8. Share City → read-only Visit mode — PASS
SHARE CITY produced a `?visit=<token>` URL. Opening it in a new tab rendered "VISITING tony's Stackfall · 17% restored", VIEW PROGRESS / BUILD YOUR OWN controls (no authoring HUD), restored tiles reflected. Opening a restored quest showed "VISIT MODE (read-only)", the textarea `disabled`, and RUN GRADERS `disabled`.

![visit read-only](https://app.devin.ai/attachments/8b9c9026-ed59-4760-bd20-b2eed2da0e93/ss_c957831c.png)

### 9. Reload persistence — PASS
Reloading the main tab (F5) kept the user signed in as tony with 4 quests · 17% and BLUEPRINTS 4 — no logout, no progress reset.

![reload persistence](https://app.devin.ai/attachments/72ada853-d3ce-4968-bdda-6f776cb9a4dd/ss_b5d699ec.png)

---

## Notes / caveats
- All coding/cloud/architecture submissions were injected programmatically due to the keyboard-capture bug; the **grading logic itself is correct**, but a real user cannot type these submissions today.
- Raid boss remained correctly locked throughout (17% < 80%); its 80% unlock path and season-complete flow were not exercised (would require restoring 20+ quests).
