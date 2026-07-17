---
name: Testing SpriteStack (Season 0 web game)
description: How to run and test the SpriteStack Vite+React+Phaser game locally, including a known input bug and a text-injection workaround for graded submissions.
---

# Testing SpriteStack

## Setup
- Requires Node 22 (toolchain needs >= 20.19; default 20.18 breaks native binaries).
  `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22`
- `npm install` then `npm run dev` → http://localhost:5173.
- No backend, no auth, no secrets. State persists to `localStorage`.
- To reset to a clean state, run `localStorage.clear()` in the browser console and reload.

## App model (source of truth)
- Graders: `src/quests/graders.ts` (PASS_THRESHOLD = 60). Anti-cheat rejects empty (<1 char), <20 chars, architecture <25 words, or repeated-filler.
- Catalog/gating: `src/quests/catalog.ts` + `src/state/progress.ts`. `requires` gates quests; raid needs `restorePct >= 0.8`.
- Sandbox types: coding (needs tokens + minLines, forbids anti-patterns), mcp (JSON: server+tools with name/description/inputSchema — the b1 starter passes as-is = 100), cloud (requiredPolicies + forbidden wildcards + minLines), architecture (requiredSections + minWords).
- Share/visit: `src/share/share.ts` encodes public progress into `?visit=<base64url token>`; `VisitCity.tsx` renders read-only (Workbench textarea + RUN GRADERS disabled).

## Keyboard focus (Workbench editor) — how it works
Earlier the game captured WASD/SPACE globally and the Workbench `<textarea>` couldn't be typed in. This is fixed:
- `src/game/WorldScene.ts` calls `kb.clearCaptures()` so movement/interact keys are NOT `preventDefault`ed, and exposes `setInputEnabled(enabled)` which toggles `this.input.keyboard.enabled`.
- `tryInteract()` also bails out when `document.activeElement` is an `<input>`/`<textarea>`.
- `PhaserGame` receives an `inputEnabled` prop; `App.tsx`/`VisitCity.tsx` set it to `false` whenever any overlay (Quest Board / Blueprints / Share / Workbench) is open, so keystrokes reach the DOM and the avatar doesn't move.

So real coding/cloud/architecture submissions can be typed directly now — no injection workaround needed. If this regresses (typing drops spaces or SPACE switches quests), check `clearCaptures()`, the `inputEnabled` wiring, and the `tryInteract` guard first.

## Navigation tips
- Open quests via QUEST BOARD (top-right) or walk to a building and press SPACE (only fires when no overlay is open and focus isn't in a field).
- Camera follows the avatar; to view a specific building, move the avatar (arrows/WASD) with the world focused and no overlay open.
