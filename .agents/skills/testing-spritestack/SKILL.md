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

## KNOWN BUG (verified) — game captures editor keystrokes
`src/game/WorldScene.ts` registers WASD/SPACE via `kb.addKey(...)` (default `enableCapture=true` → global `preventDefault`) plus `keydown-SPACE`/`keydown-E` → `tryInteract()`. These stay active while the Workbench overlay is open, so:
- The submission `<textarea>` never receives SPACE / W / A / S / D characters.
- Pressing SPACE or `e` near a building (within 120px) switches the open quest.
Any real coding/cloud/architecture submission is therefore impossible to type. Likely fix: disable scene keyboard while an overlay is open, or ignore interact keys when event target is an input/textarea.

## Workaround to test graders despite the bug
Set the textarea value programmatically (bypasses key capture), then click RUN GRADERS normally:
```js
(function(){
  const ta = document.querySelector('textarea');
  const val = `...submission...`;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
  setter.call(ta, val);
  ta.dispatchEvent(new Event('input',{bubbles:true}));
})();
```
Note: `navigator.clipboard.writeText` from the console tool failed (CDP eval error); xclip is not installed (xdotool is). The value-injection above is the reliable path. Disclose this workaround in reports — it verifies grader logic, not the (broken) typing UX.

## Navigation tips
- Open quests via QUEST BOARD (top-right) rather than walking + SPACE, to avoid the interact bug.
- Camera follows the avatar; to view a specific building, move the avatar (arrows/WASD) with the world focused and no overlay open.
