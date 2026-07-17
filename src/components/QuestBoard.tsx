import { QUESTS } from '../quests/catalog'
import { DIFFICULTY_LABEL, SANDBOX_LABEL, TRACKS, type Quest } from '../quests/dsl'
import { questStatus, type Progress } from '../state/progress'

interface QuestBoardProps {
  progress: Progress
  onPick: (questId: string) => void
  onClose: () => void
}

const STATUS_STYLE = {
  complete: 'border-stack-good text-stack-good',
  available: 'border-stack-ai text-stack-text',
  locked: 'border-stack-line text-stack-muted opacity-60',
} as const

export function QuestBoard({ progress, onPick, onClose }: QuestBoardProps) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-stack-bg/95 p-4 backdrop-blur">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-widest text-stack-ai">QUEST BOARD</h2>
          <p className="text-xs text-stack-muted">
            {progress.completed.size} restored · {Math.round(progress.restorePct * 100)}% of District Alpha
          </p>
        </div>
        <button className="border-2 border-stack-line px-3 py-1 hover:border-stack-ai" onClick={onClose}>
          CLOSE
        </button>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
        {TRACKS.map((t) => {
          const quests = QUESTS.filter((q) => q.track === t.id)
          return (
            <section key={t.id} className="pixel-border bg-stack-panel p-3">
              <div className="mb-1 flex items-baseline justify-between">
                <h3 className={t.accent === 'ai' ? 'font-bold text-stack-ai' : 'font-bold text-stack-infra'}>
                  {t.id} · {t.name}
                </h3>
                <span className="text-[10px] text-stack-muted">
                  {quests.filter((q) => progress.completed.has(q.id)).length}/{quests.length}
                </span>
              </div>
              <p className="mb-2 text-[11px] text-stack-muted">{t.blurb}</p>
              <ul className="space-y-2">
                {quests.map((q) => (
                  <QuestRow key={q.id} quest={q} progress={progress} onPick={onPick} />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function QuestRow({ quest, progress, onPick }: { quest: Quest; progress: Progress; onPick: (id: string) => void }) {
  const status = questStatus(quest, progress)
  return (
    <li>
      <button
        className={`w-full border-2 bg-stack-panel-2 p-2 text-left transition hover:brightness-125 ${STATUS_STYLE[status]}`}
        onClick={() => onPick(quest.id)}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold">
            {status === 'complete' ? '★ ' : status === 'locked' ? '🔒 ' : '· '}
            {quest.title}
          </span>
          <span className="text-[10px] text-stack-muted">{DIFFICULTY_LABEL[quest.difficulty]}</span>
        </div>
        <div className="text-[10px] text-stack-muted">{SANDBOX_LABEL[quest.sandbox]}</div>
      </button>
    </li>
  )
}
