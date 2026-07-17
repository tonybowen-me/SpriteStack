import { NON_RAID_QUESTS, questById, QUESTS } from '../quests/catalog'
import type { Blueprint, Quest } from '../quests/dsl'
import type { GameEvent } from './events'

export interface Progress {
  completed: Set<string> // quest ids passed
  bestScore: Map<string, number> // quest id → best score seen
  blueprints: Blueprint[]
  restoredTiles: Set<string>
  restorePct: number // 0..1 over the 24 non-raid quests
  raidUnlocked: boolean
  raidComplete: boolean
  seasonComplete: boolean
}

// Fold the event log into derived world state.
export function deriveProgress(events: GameEvent[]): Progress {
  const completed = new Set<string>()
  const bestScore = new Map<string, number>()
  const restoredTiles = new Set<string>()
  const blueprintIds = new Set<string>()

  for (const ev of events) {
    if (ev.type === 'quest_attempted') {
      bestScore.set(ev.questId, Math.max(bestScore.get(ev.questId) ?? 0, ev.score))
    }
    if (ev.type === 'quest_completed') {
      completed.add(ev.questId)
      restoredTiles.add(ev.tileUnlock)
      blueprintIds.add(ev.blueprintId)
      bestScore.set(ev.questId, Math.max(bestScore.get(ev.questId) ?? 0, ev.score))
    }
  }

  const blueprints: Blueprint[] = []
  for (const q of QUESTS) {
    if (blueprintIds.has(q.loot.id)) blueprints.push(q.loot)
  }

  const nonRaidDone = NON_RAID_QUESTS.filter((q) => completed.has(q.id)).length
  const restorePct = nonRaidDone / NON_RAID_QUESTS.length
  const raidComplete = completed.has('raid')
  const seasonComplete = nonRaidDone === NON_RAID_QUESTS.length && raidComplete

  return {
    completed,
    bestScore,
    blueprints,
    restoredTiles,
    restorePct,
    raidUnlocked: restorePct >= 0.8,
    raidComplete,
    seasonComplete,
  }
}

export type QuestStatus = 'complete' | 'available' | 'locked'

export function questStatus(quest: Quest, progress: Progress): QuestStatus {
  if (progress.completed.has(quest.id)) return 'complete'
  if (quest.unlockAt != null && progress.restorePct < quest.unlockAt) return 'locked'
  const reqs = quest.requires ?? []
  const gated = reqs.some((id) => !progress.completed.has(id))
  return gated ? 'locked' : 'available'
}

export function unmetRequirements(quest: Quest, progress: Progress): Quest[] {
  return (quest.requires ?? [])
    .filter((id) => !progress.completed.has(id))
    .map((id) => questById(id))
    .filter((q): q is Quest => Boolean(q))
}
