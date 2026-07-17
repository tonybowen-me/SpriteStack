import { questById } from '../quests/catalog'
import type { GameEvent } from '../state/events'
import { deriveProgress, type Progress } from '../state/progress'

// A shareable city is a privacy-gated, read-only snapshot encoded in the URL.
// We only ever encode public progress (name + which quests were restored +
// scores) — never raw submissions.

export interface CitySnapshot {
  name: string
  completed: string[]
  scores: Record<string, number>
  public: boolean
}

function toBase64Url(s: string): string {
  const b64 = btoa(unescape(encodeURIComponent(s)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(b64)))
}

export function snapshotFromEvents(name: string, events: GameEvent[], isPublic: boolean): CitySnapshot {
  const p = deriveProgress(events)
  const scores: Record<string, number> = {}
  for (const [id, s] of p.bestScore) scores[id] = s
  return { name, completed: [...p.completed], scores, public: isPublic }
}

export function encodeCity(snapshot: CitySnapshot): string {
  return toBase64Url(JSON.stringify(snapshot))
}

export function decodeCity(token: string): CitySnapshot | null {
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as CitySnapshot
    if (!parsed || typeof parsed.name !== 'string' || !Array.isArray(parsed.completed)) return null
    return parsed
  } catch {
    return null
  }
}

// Rehydrate a read-only Progress from a shared snapshot for Visit mode.
export function progressFromSnapshot(snap: CitySnapshot): Progress {
  const events: GameEvent[] = []
  for (const id of snap.completed) {
    const q = questById(id)
    if (!q) continue
    events.push({
      type: 'quest_completed',
      at: 0,
      questId: id,
      score: snap.scores[id] ?? 100,
      blueprintId: q.loot.id,
      tileUnlock: q.tileUnlock,
    })
  }
  return deriveProgress(events)
}

export function shareUrl(token: string): string {
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?visit=${token}`
}

export function readVisitToken(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('visit')
}
