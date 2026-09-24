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
