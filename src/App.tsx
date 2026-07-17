import { useState } from 'react'
import { PhaserGame } from './game/PhaserGame'
import { Login } from './components/Login'
import { Hud } from './components/Hud'
import { QuestBoard } from './components/QuestBoard'
import { Workbench } from './components/Workbench'
import { BlueprintInventory } from './components/BlueprintInventory'
import { ShareSheet } from './components/ShareSheet'
import { SeasonComplete } from './components/SeasonComplete'
import { VisitCity } from './components/VisitCity'
import { questById } from './quests/catalog'
import { signOut, useStore } from './state/store'
import { readVisitToken } from './share/share'

type Overlay = 'board' | 'blueprints' | 'share' | null

export default function App() {
  const visitToken = readVisitToken()
  if (visitToken) return <VisitCity token={visitToken} />
  return <MainGame />
}

function MainGame() {
  const { account, events, progress } = useStore()
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [questId, setQuestId] = useState<string | null>(null)
  const [prestigeDismissed, setPrestigeDismissed] = useState(false)

  if (!account) return <Login />

  const quest = questId ? questById(questId) : undefined
  const restoredTiles = [...progress.restoredTiles]

  function openQuest(id: string) {
    setOverlay(null)
    setQuestId(id)
  }

  return (
    <div className="scanlines relative h-full w-full overflow-hidden">
      <PhaserGame
        restoredTiles={restoredTiles}
        raidUnlocked={progress.raidUnlocked}
        inputEnabled={overlay === null && quest === undefined}
        onOpenQuest={openQuest}
      />

      <Hud
        name={account.name}
        progress={progress}
        onBoard={() => setOverlay('board')}
        onBlueprints={() => setOverlay('blueprints')}
        onShare={() => setOverlay('share')}
        onSignOut={signOut}
      />

      {overlay === 'board' && (
        <QuestBoard progress={progress} onPick={openQuest} onClose={() => setOverlay(null)} />
      )}
      {overlay === 'blueprints' && (
        <BlueprintInventory progress={progress} onClose={() => setOverlay(null)} />
      )}
      {overlay === 'share' && (
        <ShareSheet account={account} events={events} onClose={() => setOverlay(null)} />
      )}

      {quest && (
        <Workbench quest={quest} progress={progress} readOnly={false} onClose={() => setQuestId(null)} />
      )}

      {progress.seasonComplete && !prestigeDismissed && (
        <SeasonComplete
          account={account}
          events={events}
          onClose={() => setPrestigeDismissed(true)}
        />
      )}
    </div>
  )
}
