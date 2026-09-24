import { GRID_SIZE, type GridCell } from './grid'

export type SurfaceType = 'grass' | 'soil'
export type PlantType = 'sakura' | 'flower'
export type GrowthStage = 'seed' | 'sprout' | 'mature'

export type Plant = Readonly<{
  type: PlantType
  plantedAt: number
}>

export type PlantGrowth = Readonly<{
  stage: GrowthStage
  progress: number
}>

export const GROWTH_DURATION_MS = 30_000
const SPROUT_AT_MS = GROWTH_DURATION_MS / 2

export type GardenCell = Readonly<GridCell & {
  surface: SurfaceType
  isInteractable: boolean
  plant: Plant | null
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
      plant: null,
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

export function plantInCell(
  garden: Garden,
  coordinates: GridCell,
  plantType: PlantType,
  plantedAt: number,
): Garden {
  const cell = getCell(garden, coordinates)

  if (!cell?.isInteractable || cell.surface !== 'soil' || cell.plant) {
    return garden
  }

  const cellIndex = cell.y * GRID_SIZE + cell.x
  const nextGarden = [...garden]
  nextGarden[cellIndex] = {
    ...cell,
    plant: { type: plantType, plantedAt },
  }

  return nextGarden
}

export function getPlantGrowth(plant: Plant, currentTime: number): PlantGrowth {
  const elapsedTime = Math.max(0, currentTime - plant.plantedAt)
  const progress = Math.min(elapsedTime / GROWTH_DURATION_MS, 1)

  if (elapsedTime >= GROWTH_DURATION_MS) {
    return { stage: 'mature', progress }
  }

  if (elapsedTime >= SPROUT_AT_MS) {
    return { stage: 'sprout', progress }
  }

  return { stage: 'seed', progress }
}

export function harvestPlant(
  garden: Garden,
  coordinates: GridCell,
  currentTime: number,
): Garden {
  const cell = getCell(garden, coordinates)

  if (
    !cell?.isInteractable ||
    !cell.plant ||
    getPlantGrowth(cell.plant, currentTime).stage !== 'mature'
  ) {
    return garden
  }

  const cellIndex = cell.y * GRID_SIZE + cell.x
  const nextGarden = [...garden]
  nextGarden[cellIndex] = { ...cell, plant: null }

  return nextGarden
}
