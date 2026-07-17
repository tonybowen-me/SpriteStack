import { encodeCity, shareUrl, snapshotFromEvents } from '../share/share'
import type { Account, GameEvent } from '../state/events'

interface SeasonCompleteProps {
  account: Account
  events: GameEvent[]
  onClose: () => void
}

export function SeasonComplete({ account, events, onClose }: SeasonCompleteProps) {
  const url = shareUrl(encodeCity(snapshotFromEvents(account.name, events, true)))

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-stack-bg/95 p-4 text-center backdrop-blur">
      <div className="pixel-border max-w-lg bg-stack-panel p-8">
        <div className="text-5xl">✦</div>
        <h2 className="mt-2 text-3xl font-bold tracking-widest text-stack-good">SEASON 0 COMPLETE</h2>
        <p className="mt-3 text-stack-text">
          District Alpha is fully restored. Every quest across AI, MCP, cloud, and architecture —
          plus the cascading-incident raid — cleared. That was senior work, {account.name}.
        </p>
        <div className="mt-4 inline-block border-2 border-stack-infra px-4 py-2 text-stack-infra">
          ◈ PRESTIGE MARK EARNED
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button
            className="w-full bg-stack-good px-4 py-3 font-bold text-stack-bg transition hover:brightness-110"
            onClick={copy}
          >
            COPY SHAREABLE CITY LINK
          </button>
          <button className="w-full border-2 border-stack-line px-4 py-2 hover:border-stack-ai" onClick={onClose}>
            RETURN TO STACKFALL
          </button>
        </div>
      </div>
    </div>
  )
}
