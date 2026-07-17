import type { Progress } from '../state/progress'

interface BlueprintInventoryProps {
  progress: Progress
  onClose: () => void
}

export function BlueprintInventory({ progress, onClose }: BlueprintInventoryProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-stack-bg/95 p-4 backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-widest text-stack-infra">◈ BLUEPRINTS</h2>
          <p className="text-xs text-stack-muted">Reusable pattern cards — career capital, never a paywall.</p>
        </div>
        <button className="border-2 border-stack-line px-3 py-1 hover:border-stack-infra" onClick={onClose}>
          CLOSE
        </button>
      </header>

      {progress.blueprints.length === 0 ? (
        <p className="text-stack-muted">No blueprints yet. Pass a quest to earn your first pattern card.</p>
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
          {progress.blueprints.map((b) => (
            <div key={b.id} className="pixel-border bg-stack-panel p-3">
              <div className="text-xs text-stack-infra">◈ PATTERN CARD</div>
              <div className="mb-1 text-lg font-bold text-stack-text">{b.name}</div>
              <p className="text-sm text-stack-muted">{b.pattern}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
