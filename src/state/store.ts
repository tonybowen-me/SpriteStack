import { useSyncExternalStore } from 'react'
import type { Quest } from '../quests/dsl'
import type { GradeResult } from '../quests/graders'
import type { Account, GameEvent } from './events'
import { deriveProgress, type Progress } from './progress'

const SESSION_KEY = 'spritestack.session'
const eventsKey = (accountId: string) => `spritestack.events.${accountId}`

interface StoreState {
  account: Account | null
  events: GameEvent[]
  progress: Progress
}

function loadEvents(accountId: string): GameEvent[] {
  try {
    const raw = localStorage.getItem(eventsKey(accountId))
    return raw ? (JSON.parse(raw) as GameEvent[]) : []
  } catch {
    return []
  }
}

function loadSession(): Account | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Account) : null
  } catch {
    return null
  }
}

function initialState(): StoreState {
  const account = loadSession()
  const events = account ? loadEvents(account.id) : []
  return { account, events, progress: deriveProgress(events) }
}

let state: StoreState = initialState()
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (state.account) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.account))
    localStorage.setItem(eventsKey(state.account.id), JSON.stringify(state.events))
  }
}

function setState(next: StoreState) {
  state = next
  persist()
  emit()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ── Public actions ───────────────────────────────────────────────────────

export function signIn(name: string) {
  const clean = name.trim() || 'Anonymous Engineer'
  const id = `acct-${clean.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  let events = loadEvents(id)
  if (events.length === 0) {
    events = [{ type: 'account_created', at: Date.now(), name: clean }]
  }
  const account: Account = { id, name: clean, createdAt: Date.now() }
  setState({ account, events, progress: deriveProgress(events) })
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
  setState({ account: null, events: [], progress: deriveProgress([]) })
}

export function recordAttempt(quest: Quest, result: GradeResult) {
  if (!state.account) return
  const now = Date.now()
  const events = [...state.events]
  events.push({ type: 'quest_attempted', at: now, questId: quest.id, score: result.overall, passed: result.passed })
  if (result.passed && !state.progress.completed.has(quest.id)) {
    events.push({
      type: 'quest_completed',
      at: now,
      questId: quest.id,
      score: result.overall,
      blueprintId: quest.loot.id,
      tileUnlock: quest.tileUnlock,
    })
  }
  setState({ ...state, events, progress: deriveProgress(events) })
}

// ── React binding ─────────────────────────────────────────────────────────

function getSnapshot(): StoreState {
  return state
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function currentEvents(): GameEvent[] {
  return state.events
}
