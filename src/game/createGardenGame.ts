import { Application, Graphics, Rectangle } from 'pixi.js'
import {
  CELL_SIZE,
  GRID_PIXEL_SIZE,
  GRID_SIZE,
  isSameCell,
  pointToCell,
  type GridCell,
} from './grid'

type GardenGame = {
  destroy: () => void
}

const COLORS = {
  background: 0x223329,
  cell: 0x304a39,
  alternateCell: 0x2c4435,
  gridLine: 0x54705c,
  selectedCell: 0xc99b5d,
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
  let selectedCell: GridCell | null = null

  const drawGrid = () => {
    grid.clear()

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const isSelected = isSameCell(selectedCell, { x, y })
        const fillColor = isSelected
          ? COLORS.selectedCell
          : (x + y) % 2 === 0
            ? COLORS.cell
            : COLORS.alternateCell

        grid
          .rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          .fill(fillColor)
          .stroke({
            color: isSelected ? COLORS.selectedBorder : COLORS.gridLine,
            width: isSelected ? 3 : 1,
          })
      }
    }
  }

  drawGrid()
  grid.eventMode = 'static'
  grid.hitArea = new Rectangle(0, 0, GRID_PIXEL_SIZE, GRID_PIXEL_SIZE)
  grid.on('pointertap', (event) => {
    const cell = pointToCell(event.global.x, event.global.y)

    if (!cell || isSameCell(selectedCell, cell)) {
      return
    }

    selectedCell = cell
    drawGrid()
    onCellSelect(cell)
  })

  app.stage.addChild(grid)
  host.replaceChildren(app.canvas)
  app.start()

  let isDestroyed = false

  return {
    destroy: () => {
      if (isDestroyed) {
        return
      }

      isDestroyed = true
      app.destroy(true, { children: true })
    },
  }
}
