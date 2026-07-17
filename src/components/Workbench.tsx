import { useEffect, useMemo, useState } from 'react'
import { SANDBOX_LABEL, DIFFICULTY_LABEL, trackById, type Quest } from '../quests/dsl'
import { grade, PASS_THRESHOLD, type GradeResult } from '../quests/graders'
import { starterFor } from '../quests/starters'
import { unmetRequirements, type Progress } from '../state/progress'
import { recordAttempt } from '../state/store'

interface WorkbenchProps {
  quest: Quest
  progress: Progress
  readOnly: boolean
  onClose: () => void
}

export function Workbench({ quest, progress, readOnly, onClose }: WorkbenchProps) {
  const [submission, setSubmission] = useState('')
  const [result, setResult] = useState<GradeResult | null>(null)
  const track = trackById(quest.track)
  const completed = progress.completed.has(quest.id)
  const unmet = useMemo(() => unmetRequirements(quest, progress), [quest, progress])
  const raidLocked = quest.unlockAt != null && progress.restorePct < quest.unlockAt

  useEffect(() => {
    setSubmission(starterFor(quest))
    setResult(null)
  }, [quest])

  const locked = unmet.length > 0 || raidLocked
  const canSubmit = !readOnly && !locked

  function runGraders() {
    const r = grade(quest, submission)
    setResult(r)
    recordAttempt(quest, r)
  }

  return (
    <div className="absolute inset-y-0 right-0 z-40 flex w-full max-w-2xl flex-col border-l-2 border-stack-line bg-stack-panel shadow-2xl">
      <header className="flex items-start justify-between border-b-2 border-stack-line bg-stack-panel-2 p-4">
        <div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={track.accent === 'ai' ? 'text-stack-ai' : 'text-stack-infra'}>
              TRACK {quest.track} · {track.name}
            </span>
            <span className="text-stack-muted">/ {SANDBOX_LABEL[quest.sandbox]}</span>
            <span className="border border-stack-line px-1 text-stack-muted">{DIFFICULTY_LABEL[quest.difficulty]}</span>
            {quest.raid && <span className="bg-stack-bad px-1 text-stack-bg">RAID</span>}
            {completed && <span className="bg-stack-good px-1 text-stack-bg">★ RESTORED</span>}
          </div>
          <h2 className="mt-1 text-xl font-bold text-stack-text">{quest.title}</h2>
        </div>
        <button className="px-2 text-2xl leading-none text-stack-muted hover:text-stack-text" onClick={onClose}>
          ×
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 italic text-stack-muted">&ldquo;{quest.hook}&rdquo;</p>
        <div className="mb-4 border-l-2 border-stack-ai bg-stack-panel-2 p-3 text-sm">{quest.brief}</div>

        <div className="mb-4">
          <div className="mb-1 text-xs text-stack-muted">RUBRIC</div>
          <ul className="space-y-1 text-sm">
            {quest.rubric.map((r) => {
              const rr = result?.rubric.find((x) => x.item.id === r.id)
              return (
                <li key={r.id} className="flex items-center justify-between border-b border-stack-line/50 pb-1">
                  <span>
                    {r.label} <span className="text-stack-muted">({Math.round(r.weight * 100)}%)</span>
                  </span>
                  {rr && (
                    <span className={rr.score >= 60 ? 'text-stack-good' : 'text-stack-bad'}>{rr.score}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {locked ? (
          <div className="mb-4 border-2 border-stack-bad bg-stack-panel-2 p-3 text-sm text-stack-bad">
            {raidLocked
              ? `Locked — restore ${Math.round((quest.unlockAt ?? 0) * 100)}% of the district first (currently ${Math.round(
                  progress.restorePct * 100,
                )}%).`
              : `Locked — finish first: ${unmet.map((q) => q.title).join(', ')}.`}
          </div>
        ) : (
          <>
            <div className="mb-1 flex items-center justify-between text-xs text-stack-muted">
              <span>SUBMISSION — {SANDBOX_LABEL[quest.sandbox]}</span>
              {readOnly && <span className="text-stack-bad">VISIT MODE (read-only)</span>}
            </div>
            <textarea
              className="mb-3 h-56 w-full resize-none border-2 border-stack-line bg-stack-bg p-3 font-mono text-sm text-stack-text outline-none focus:border-stack-ai"
              spellCheck={false}
              value={submission}
              disabled={readOnly}
              onChange={(e) => setSubmission(e.target.value)}
            />
            <button
              className="w-full bg-stack-ai px-4 py-3 font-bold text-stack-bg transition enabled:hover:brightness-110 disabled:opacity-40"
              disabled={!canSubmit}
              onClick={runGraders}
            >
              RUN GRADERS
            </button>
          </>
        )}

        {result && (
          <div
            className={`mt-4 border-2 p-3 ${
              result.passed ? 'border-stack-good bg-stack-good/10' : 'border-stack-bad bg-stack-bad/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-bold ${result.passed ? 'text-stack-good' : 'text-stack-bad'}`}>
                {result.passed ? 'PASS' : 'FAIL'} — {result.overall}/100
              </span>
              <span className="text-xs text-stack-muted">pass ≥ {PASS_THRESHOLD}</span>
            </div>
            {result.antiCheat && <p className="mt-1 text-sm text-stack-bad">Anti-cheat: {result.antiCheat}</p>}
            <p className="mt-1 text-sm">{result.feedback}</p>
            {result.passed && (
              <div className="mt-3 border-2 border-stack-infra bg-stack-panel-2 p-2">
                <div className="text-xs text-stack-infra">◈ BLUEPRINT LOOT</div>
                <div className="font-bold">{quest.loot.name}</div>
                <div className="text-sm text-stack-muted">{quest.loot.pattern}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
