import Phaser from 'phaser'
import { QUESTS } from '../quests/catalog'
import { trackById, type Quest } from '../quests/dsl'

export const WORLD_EVENTS = {
  openQuest: 'world:openQuest',
  ready: 'world:ready',
} as const

interface BuildingSprite {
  quest: Quest
  container: Phaser.GameObjects.Container
  base: Phaser.GameObjects.Rectangle
  roof: Phaser.GameObjects.Rectangle
  light: Phaser.GameObjects.Rectangle
  label: Phaser.GameObjects.Text
  x: number
  y: number
}

const TILE = 32
const AI_COLOR = 0x6ee7ff
const INFRA_COLOR = 0xffcf5c
const RAID_COLOR = 0xff6b81
const RUINED = 0x2a2350
const GROUND = 0x14102b

// Lane index per track so each track becomes a readable district column.
const TRACK_LANE: Record<string, number> = { A: 0, B: 1, E: 2, C: 3, D: 4 }

interface Layout {
  laneW: number
  rowH: number
  marginX: number
  marginY: number
  width: number
  height: number
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container
  private playerBody!: Phaser.Physics.Arcade.Body
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'up' | 'down' | 'left' | 'right' | 'interact', Phaser.Input.Keyboard.Key>
  private buildings: BuildingSprite[] = []
  private prompt!: Phaser.GameObjects.Text
  private nearest: BuildingSprite | null = null
  private restored = new Set<string>()
  private raidUnlocked = false

  constructor() {
    super('world')
  }

  init(data: { restored?: string[]; raidUnlocked?: boolean; visit?: boolean }) {
    this.restored = new Set(data.restored ?? [])
    this.raidUnlocked = data.raidUnlocked ?? false
  }

  create() {
    const layout = this.computeLayout()
    const worldW = layout.width
    const worldH = layout.height

    this.physics.world.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setBackgroundColor('#0d0b1a')

    this.drawGround(worldW, worldH)
    this.drawRegionLabels(layout)

    for (const q of QUESTS) {
      this.buildings.push(this.makeBuilding(q, layout))
    }

    // Avatar — a little pixel engineer.
    this.player = this.makeAvatar(worldW / 2, worldH - 80)
    this.physics.add.existing(this.player)
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body
    this.playerBody.setCollideWorldBounds(true)
    this.playerBody.setSize(20, 20)
    this.playerBody.setOffset(-10, -4)

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)

    const kb = this.input.keyboard!
    this.cursors = kb.createCursorKeys()
    this.wasd = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      interact: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }
    kb.on('keydown-SPACE', () => this.tryInteract())
    kb.on('keydown-E', () => this.tryInteract())

    this.prompt = this.add
      .text(0, 0, '', {
        fontFamily: 'Courier New, monospace',
        fontSize: '13px',
        color: '#0d0b1a',
        backgroundColor: '#7cf29c',
        padding: { x: 6, y: 3 },
      })
      .setDepth(50)
      .setVisible(false)

    this.game.events.emit(WORLD_EVENTS.ready)
  }

  private computeLayout(): Layout {
    const laneW = 260
    const rowH = 150
    const marginX = 150
    const marginY = 140
    const lanes = 5
    const maxRows = Math.max(
      ...Object.keys(TRACK_LANE).map((t) => QUESTS.filter((q) => q.track === t && !q.raid).length),
    )
    const width = marginX * 2 + laneW * (lanes - 1) + 200
    const height = marginY * 2 + rowH * maxRows + 220
    return { laneW, rowH, marginX, marginY, width, height }
  }

  private positionFor(q: Quest, layout: Layout): { x: number; y: number } {
    if (q.raid) {
      return { x: layout.width / 2, y: layout.height - 150 }
    }
    const lane = TRACK_LANE[q.track]
    const row = QUESTS.filter((x) => x.track === q.track && !x.raid).findIndex((x) => x.id === q.id)
    return { x: layout.marginX + lane * layout.laneW, y: layout.marginY + row * layout.rowH }
  }

  private drawGround(w: number, h: number) {
    const g = this.add.graphics()
    g.fillStyle(GROUND, 1).fillRect(0, 0, w, h)
    g.lineStyle(1, 0x241d47, 0.6)
    for (let x = 0; x <= w; x += TILE) g.lineBetween(x, 0, x, h)
    for (let y = 0; y <= h; y += TILE) g.lineBetween(0, y, w, y)
    g.setDepth(-10)
  }

  private drawRegionLabels(layout: Layout) {
    this.add
      .text(layout.marginX - 40, 40, 'AI SPIRE', { fontFamily: 'Courier New', fontSize: '22px', color: '#6ee7ff' })
      .setAlpha(0.8)
    this.add
      .text(layout.marginX + 3 * layout.laneW - 40, 40, 'INFRA ANNEX', {
        fontFamily: 'Courier New',
        fontSize: '22px',
        color: '#ffcf5c',
      })
      .setAlpha(0.8)
    this.add
      .text(layout.width / 2, 88, 'DISTRICT ALPHA — STACKFALL', {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: '#9a92c8',
      })
      .setOrigin(0.5, 0.5)
  }

  private accentFor(q: Quest): number {
    if (q.raid) return RAID_COLOR
    return trackById(q.track).accent === 'ai' ? AI_COLOR : INFRA_COLOR
  }

  private makeBuilding(q: Quest, layout: Layout): BuildingSprite {
    const { x, y } = this.positionFor(q, layout)
    const accent = this.accentFor(q)
    const restored = this.restored.has(q.tileUnlock)
    const w = q.raid ? 120 : 84
    const bh = q.raid ? 96 : 72

    const base = this.add.rectangle(0, 0, w, bh, restored ? 0x201a45 : RUINED).setStrokeStyle(2, restored ? accent : 0x3a2f6b)
    const roof = this.add.rectangle(0, -bh / 2 - 6, w * 0.82, 14, restored ? accent : 0x3a2f6b)
    const light = this.add.rectangle(0, 6, w * 0.4, 18, accent, restored ? 0.9 : 0.12)
    const label = this.add
      .text(0, bh / 2 + 8, this.buildingLabel(q), {
        fontFamily: 'Courier New',
        fontSize: '11px',
        color: restored ? '#e7e3ff' : '#6b6396',
        align: 'center',
      })
      .setOrigin(0.5, 0)

    const container = this.add.container(x, y, [base, roof, light, label])
    container.setSize(w, bh)
    container.setDepth(y)

    // A quest-giver marker beside the building.
    const npc = this.add.circle(-w / 2 - 14, 0, 7, accent, restored ? 0.4 : 1)
    container.add(npc)

    this.physics.add.existing(container, true)

    return { quest: q, container, base, roof, light, label, x, y }
  }

  private buildingLabel(q: Quest): string {
    const status = this.restored.has(q.tileUnlock) ? '★' : q.raid && !this.raidUnlocked ? '🔒' : '·'
    return `${status} ${q.track}·${q.id.toUpperCase()}\n${q.title}`
  }

  private makeAvatar(x: number, y: number): Phaser.GameObjects.Container {
    const body = this.add.rectangle(0, 0, 16, 20, 0x7cf29c).setStrokeStyle(2, 0x0d0b1a)
    const head = this.add.rectangle(0, -14, 12, 10, 0xffe0b5).setStrokeStyle(2, 0x0d0b1a)
    const visor = this.add.rectangle(0, -14, 8, 3, 0x6ee7ff)
    const c = this.add.container(x, y, [body, head, visor])
    c.setSize(16, 20)
    c.setDepth(9999)
    return c
  }

  updateRestored(restored: string[], raidUnlocked: boolean) {
    this.restored = new Set(restored)
    this.raidUnlocked = raidUnlocked
    for (const b of this.buildings) this.refreshBuilding(b)
  }

  private refreshBuilding(b: BuildingSprite) {
    const accent = this.accentFor(b.quest)
    const restored = this.restored.has(b.quest.tileUnlock)
    b.base.setFillStyle(restored ? 0x201a45 : RUINED)
    b.base.setStrokeStyle(2, restored ? accent : 0x3a2f6b)
    b.roof.setFillStyle(restored ? accent : 0x3a2f6b)
    b.light.setFillStyle(accent, restored ? 0.9 : 0.12)
    b.label.setText(this.buildingLabel(b.quest))
    b.label.setColor(restored ? '#e7e3ff' : '#6b6396')
  }

  private tryInteract() {
    if (this.nearest) {
      this.game.events.emit(WORLD_EVENTS.openQuest, this.nearest.quest.id)
    }
  }

  update() {
    const speed = 220
    const body = this.playerBody
    body.setVelocity(0)
    const left = this.cursors.left.isDown || this.wasd.left.isDown
    const right = this.cursors.right.isDown || this.wasd.right.isDown
    const up = this.cursors.up.isDown || this.wasd.up.isDown
    const down = this.cursors.down.isDown || this.wasd.down.isDown
    if (left) body.setVelocityX(-speed)
    else if (right) body.setVelocityX(speed)
    if (up) body.setVelocityY(-speed)
    else if (down) body.setVelocityY(speed)
    body.velocity.normalize().scale(speed)

    // Proximity check for the interact prompt.
    let nearest: BuildingSprite | null = null
    let best = Infinity
    for (const b of this.buildings) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y)
      if (d < 120 && d < best) {
        best = d
        nearest = b
      }
    }
    this.nearest = nearest
    if (nearest) {
      const locked = nearest.quest.raid && !this.raidUnlocked
      this.prompt
        .setText(locked ? 'RAID LOCKED — restore 80%' : `SPACE — ${nearest.quest.title}`)
        .setBackgroundColor(locked ? '#ff6b81' : '#7cf29c')
        .setPosition(nearest.x - this.prompt.width / 2, nearest.y - 90)
        .setVisible(true)
    } else {
      this.prompt.setVisible(false)
    }
  }
}
