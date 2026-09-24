import { GRID_SIZE, type GridCell } from './grid'

export type SurfaceType = 'grass' | 'soil'

export type GardenCell = Readonly<GridCell & {
  surface: SurfaceType
  isInteractable: boolean
}>

export type Garden = readonly GardenCell[]

const INITIAL_SOIL_CELLS = new Set([
  '2,2',
  '3,2',
  '2,3',
  '5,4',
  '5,5',
  '6,5',
])

export function createInitialGarden(): Garden {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
    const x = index % GRID_SIZE
    const y = Math.floor(index / GRID_SIZE)

    return {
      x,
      y,
      surface: INITIAL_SOIL_CELLS.has(`${x},${y}`) ? 'soil' : 'grass',
      isInteractable: true,
    }
  })
}

export function getCell(garden: Garden, coordinates: GridCell): GardenCell | null {
  const { x, y } = coordinates

  if (
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    y < 0 ||
    x >= GRID_SIZE ||
    y >= GRID_SIZE
  ) {
    return null
  }

  return garden[y * GRID_SIZE + x] ?? null
}

export function applyHoe(garden: Garden, coordinates: GridCell): Garden {
  const cell = getCell(garden, coordinates)

  if (!cell?.isInteractable || cell.surface === 'soil') {
    return garden
  }

  const cellIndex = cell.y * GRID_SIZE + cell.x
  const nextGarden = [...garden]
  nextGarden[cellIndex] = { ...cell, surface: 'soil' }

  return nextGarden
}
