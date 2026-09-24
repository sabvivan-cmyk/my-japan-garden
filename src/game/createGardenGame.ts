import { Application, Graphics, Rectangle } from 'pixi.js'
import {
  CELL_SIZE,
  GRID_PIXEL_SIZE,
  isSameCell,
  pointToCell,
  type GridCell,
} from './grid'
import type { Garden } from './garden'

export type GardenGame = {
  update: (garden: Garden, selectedCell: GridCell | null) => void
  destroy: () => void
}

const COLORS = {
  background: 0x223329,
  grass: 0x426b45,
  soil: 0x8a6545,
  gridLine: 0x54705c,
  selectedBorder: 0xf3d79a,
  sakuraTrunk: 0x6f4938,
  sakuraBlossom: 0xf3a9b8,
  flowerStem: 0x315c32,
  flowerPetal: 0xf2df70,
  flowerCenter: 0x9a6230,
}

function drawPlant(graphics: Graphics, cell: Garden[number]) {
  if (!cell.plant) {
    return
  }

  const centerX = cell.x * CELL_SIZE + CELL_SIZE / 2
  const centerY = cell.y * CELL_SIZE + CELL_SIZE / 2

  if (cell.plant === 'sakura') {
    graphics
      .rect(centerX - 4, centerY + 4, 8, 22)
      .fill(COLORS.sakuraTrunk)
      .circle(centerX, centerY - 6, 16)
      .circle(centerX - 12, centerY, 11)
      .circle(centerX + 12, centerY, 11)
      .fill(COLORS.sakuraBlossom)
    return
  }

  graphics
    .rect(centerX - 2, centerY, 4, 22)
    .fill(COLORS.flowerStem)
    .circle(centerX, centerY - 8, 6)
    .circle(centerX - 7, centerY - 2, 6)
    .circle(centerX + 7, centerY - 2, 6)
    .circle(centerX, centerY + 4, 6)
    .fill(COLORS.flowerPetal)
    .circle(centerX, centerY - 2, 5)
    .fill(COLORS.flowerCenter)
}

export async function createGardenGame(
  host: HTMLElement,
  onCellSelect: (cell: GridCell) => void,
  signal: AbortSignal,
): Promise<GardenGame | null> {
  const app = new Application()

  await app.init({
    width: GRID_PIXEL_SIZE,
    height: GRID_PIXEL_SIZE,
    backgroundColor: COLORS.background,
    antialias: true,
    autoDensity: true,
    autoStart: false,
    resolution: Math.min(window.devicePixelRatio, 2),
  })

  if (signal.aborted) {
    app.destroy(true, { children: true })
    return null
  }

  const grid = new Graphics()
  const drawGrid = (garden: Garden, selectedCell: GridCell | null) => {
    grid.clear()

    for (const cell of garden) {
      const isSelected = isSameCell(selectedCell, cell)

      grid
        .rect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        .fill(COLORS[cell.surface])
        .stroke({
          color: isSelected ? COLORS.selectedBorder : COLORS.gridLine,
          width: isSelected ? 4 : 1,
        })

      drawPlant(grid, cell)
    }
  }

  grid.eventMode = 'static'
  grid.hitArea = new Rectangle(0, 0, GRID_PIXEL_SIZE, GRID_PIXEL_SIZE)
  grid.on('pointertap', (event) => {
    const cell = pointToCell(event.global.x, event.global.y)

    if (!cell) {
      return
    }

    onCellSelect(cell)
  })

  app.stage.addChild(grid)
  host.replaceChildren(app.canvas)
  app.start()

  let isDestroyed = false

  return {
    update: drawGrid,
    destroy: () => {
      if (isDestroyed) {
        return
      }

      isDestroyed = true
      app.destroy(true, { children: true })
    },
  }
}
