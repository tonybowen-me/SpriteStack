import { useState } from 'react'
import { encodeCity, shareUrl, snapshotFromEvents } from '../share/share'
import type { Account, GameEvent } from '../state/events'

interface ShareSheetProps {
  account: Account
  events: GameEvent[]
  onClose: () => void
}

export function ShareSheet({ account, events, onClose }: ShareSheetProps) {
  const [isPublic, setIsPublic] = useState(true)
  const [copied, setCopied] = useState(false)

  const url = shareUrl(encodeCity(snapshotFromEvents(account.name, events, isPublic)))

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard may be blocked; the field is selectable as a fallback.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-stack-bg/90 p-4 backdrop-blur">
      <div className="pixel-border w-full max-w-lg bg-stack-panel p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-widest text-stack-good">SHARE YOUR CITY</h2>
          <button className="text-2xl leading-none text-stack-muted hover:text-stack-text" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="mb-4 text-sm text-stack-muted">
          Send a read-only walk of {account.name}&rsquo;s restored District Alpha. Only your progress
          (which tiles are restored) is shared — never your submissions.
        </p>

        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Public visit link
        </label>

        <input
          readOnly
          className="mb-3 w-full select-all border-2 border-stack-line bg-stack-bg p-2 text-xs text-stack-text"
          value={url}
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          className="w-full bg-stack-good px-4 py-3 font-bold text-stack-bg transition hover:brightness-110"
          onClick={copy}
        >
          {copied ? 'COPIED!' : 'COPY VISIT LINK'}
        </button>
      </div>
    </div>
  )
}
