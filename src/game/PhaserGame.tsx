import Phaser from 'phaser'
import { useEffect, useRef } from 'react'
import { WORLD_EVENTS, WorldScene } from './WorldScene'

interface PhaserGameProps {
  restoredTiles: string[]
  raidUnlocked: boolean
  visit?: boolean
  inputEnabled: boolean
  onOpenQuest: (questId: string) => void
}

export function PhaserGame({ restoredTiles, raidUnlocked, visit, inputEnabled, onOpenQuest }: PhaserGameProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const sceneRef = useRef<WorldScene | null>(null)
  const onOpenRef = useRef(onOpenQuest)
  onOpenRef.current = onOpenQuest

  // Create the game exactly once.
  useEffect(() => {
    if (!parentRef.current || gameRef.current) return
    const scene = new WorldScene()
    sceneRef.current = scene

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: parentRef.current,
      backgroundColor: '#0d0b1a',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    })
    gameRef.current = game

    game.events.on(WORLD_EVENTS.openQuest, (questId: string) => onOpenRef.current(questId))
    // Re-sync tiles once the scene finishes booting (avoids a create/effect race).
    game.events.on(WORLD_EVENTS.ready, () => scene.updateRestored(restoredTiles, raidUnlocked))
    game.scene.add('world', scene, true, { restored: restoredTiles, raidUnlocked, visit })

    return () => {
      game.destroy(true)
      gameRef.current = null
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push progress into the running scene once it has booted.
  useEffect(() => {
    const scene = sceneRef.current
    if (scene?.scene?.isActive?.()) {
      scene.updateRestored(restoredTiles, raidUnlocked)
    }
  }, [restoredTiles, raidUnlocked])

  // Hand keyboard focus to the DOM while an overlay is open.
  useEffect(() => {
    const scene = sceneRef.current
    if (scene?.scene?.isActive?.()) scene.setInputEnabled(inputEnabled)
  }, [inputEnabled])

  return <div ref={parentRef} className="h-full w-full" />
}
