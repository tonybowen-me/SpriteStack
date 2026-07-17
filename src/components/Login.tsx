import { useState } from 'react'
import { signIn } from '../state/store'

export function Login() {
  const [name, setName] = useState('')

  return (
    <div className="scanlines relative flex h-full w-full items-center justify-center overflow-hidden bg-stack-bg p-6">
      <div className="pixel-border w-full max-w-md bg-stack-panel p-8">
        <div className="mb-1 text-center text-3xl font-bold tracking-widest text-stack-ai">SPRITE&#8203;STACK</div>
        <div className="mb-6 text-center text-xs text-stack-muted">SEASON 0 — DISTRICT ALPHA</div>

        <p className="mb-6 text-sm leading-relaxed text-stack-text">
          Stackfall fell. The AI Spire is dark, the Infra Annex is rubble. You&rsquo;re a mid-senior
          engineer — 5&ndash;10 years in — and the city runs on real work: agents, MCP, cloud, and
          architecture judgment. Restore District Alpha, one graded quest at a time.
        </p>

        <label className="mb-2 block text-xs text-stack-muted">ENGINEER HANDLE</label>
        <input
          className="mb-4 w-full border-2 border-stack-line bg-stack-panel-2 px-3 py-2 text-stack-text outline-none focus:border-stack-ai"
          placeholder="e.g. tony"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') signIn(name)
          }}
        />
        <button
          className="w-full bg-stack-good px-4 py-3 font-bold text-stack-bg transition hover:brightness-110"
          onClick={() => signIn(name)}
        >
          ENTER STACKFALL
        </button>
        <p className="mt-4 text-center text-[10px] text-stack-muted">
          MVP auth: local handle (OAuth + email planned). Progress saves to this browser.
        </p>
      </div>
    </div>
  )
}
