// Event-sourced world progress. Everything the player earns is derived by
// folding this append-only log — quest_completed → tile unlocks, blueprints,
// and district restore %.

export interface AccountCreated {
  type: 'account_created'
  at: number
  name: string
}

export interface QuestCompleted {
  type: 'quest_completed'
  at: number
  questId: string
  score: number // 0..100
  blueprintId: string
  tileUnlock: string
}

export interface QuestAttempted {
  type: 'quest_attempted'
  at: number
  questId: string
  score: number
  passed: boolean
}

export type GameEvent = AccountCreated | QuestCompleted | QuestAttempted

export interface Account {
  id: string
  name: string
  createdAt: number
}
