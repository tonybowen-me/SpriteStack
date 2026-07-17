import type { Progress } from '../state/progress'

interface HudProps {
  name: string
  progress: Progress
  onBoard: () => void
  onBlueprints: () => void
  onShare: () => void
  onSignOut: () => void
}

export function Hud({ name, progress, onBoard, onBlueprints, onShare, onSignOut }: HudProps) {
  const pct = Math.round(progress.restorePct * 100)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3">
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2">
        <div className="pixel-border bg-stack-panel/90 px-3 py-1">
          <span className="text-xs text-stack-muted">ENGINEER</span>{' '}
          <span className="font-bold text-stack-text">{name}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <HudButton label="◧ QUEST BOARD" onClick={onBoard} />
          <HudButton label={`◈ BLUEPRINTS ${progress.blueprints.length}`} onClick={onBlueprints} />
          <HudButton label="↗ SHARE CITY" onClick={onShare} />
          <HudButton label="⎋ SIGN OUT" onClick={onSignOut} />
        </div>
      </div>

      <div className="pointer-events-auto max-w-md">
        <div className="pixel-border bg-stack-panel/90 p-2">
          <div className="mb-1 flex items-center justify-between text-[11px] text-stack-muted">
            <span>DISTRICT ALPHA RESTORE</span>
            <span>
              {progress.completed.size} quests · {pct}%
            </span>
          </div>
          <div className="h-3 w-full border border-stack-line bg-stack-bg">
            <div
              className="h-full bg-stack-good transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-stack-muted">
            {progress.seasonComplete
              ? '✦ SEASON 0 COMPLETE — District Alpha fully restored'
              : progress.raidUnlocked && !progress.raidComplete
                ? '⚠ RAID AVAILABLE — the cascading incident awaits'
                : `Raid boss unlocks at 80% (${Math.max(0, 80 - pct)}% to go)`}
          </div>
        </div>
      </div>

      <div className="pointer-events-none max-w-md text-[10px] text-stack-muted/80">
        WASD / arrows to move · walk to a building · SPACE to open a quest
      </div>
    </div>
  )
}

function HudButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="pixel-border bg-stack-panel/90 px-3 py-1 text-xs text-stack-text transition hover:bg-stack-panel-2"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
