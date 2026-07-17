import { useState } from 'react'
import { PhaserGame } from '../game/PhaserGame'
import { QuestBoard } from './QuestBoard'
import { Workbench } from './Workbench'
import { questById } from '../quests/catalog'
import { decodeCity, progressFromSnapshot } from '../share/share'

export function VisitCity({ token }: { token: string }) {
  const snap = decodeCity(token)
  const [showBoard, setShowBoard] = useState(false)
  const [questId, setQuestId] = useState<string | null>(null)

  if (!snap || !snap.public) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stack-bg p-6 text-center">
        <div className="pixel-border max-w-md bg-stack-panel p-6">
          <h2 className="mb-2 text-xl font-bold text-stack-bad">CITY UNAVAILABLE</h2>
          <p className="text-sm text-stack-muted">
            This visit link is invalid or set to private.
          </p>
          <a href={window.location.pathname} className="mt-4 inline-block bg-stack-good px-4 py-2 font-bold text-stack-bg">
            BUILD YOUR OWN CITY
          </a>
        </div>
      </div>
    )
  }

  const progress = progressFromSnapshot(snap)
  const quest = questId ? questById(questId) : undefined

  return (
    <div className="scanlines relative h-full w-full overflow-hidden">
      <PhaserGame
        restoredTiles={[...progress.restoredTiles]}
        raidUnlocked={progress.raidUnlocked}
        visit
        inputEnabled={!showBoard && questId === null}
        onOpenQuest={(id) => setQuestId(id)}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="pixel-border pointer-events-auto bg-stack-panel/90 px-3 py-1">
          <span className="text-xs text-stack-infra">VISITING</span>{' '}
          <span className="font-bold text-stack-text">{snap.name}&rsquo;s Stackfall</span>{' '}
          <span className="text-xs text-stack-muted">· {Math.round(progress.restorePct * 100)}% restored</span>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            className="pixel-border bg-stack-panel/90 px-3 py-1 text-xs hover:bg-stack-panel-2"
            onClick={() => setShowBoard(true)}
          >
            ◧ VIEW PROGRESS
          </button>
          <a
            href={window.location.pathname}
            className="pixel-border bg-stack-good px-3 py-1 text-xs font-bold text-stack-bg"
          >
            BUILD YOUR OWN
          </a>
        </div>
      </div>

      {showBoard && (
        <QuestBoard progress={progress} onPick={(id) => setQuestId(id)} onClose={() => setShowBoard(false)} />
      )}
      {quest && (
        <Workbench quest={quest} progress={progress} readOnly onClose={() => setQuestId(null)} />
      )}
    </div>
  )
}
