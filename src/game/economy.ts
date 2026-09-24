import {
  createInitialGarden,
  getCell,
  harvestPlant,
  plantInCell,
  type Garden,
  type PlantType,
} from './garden'
import type { GridCell } from './grid'

export type Economy = Readonly<{
  coins: number
  seeds: Readonly<Record<PlantType, number>>
}>

export type GameState = Readonly<{
  garden: Garden
  economy: Economy
}>

export const SEED_PRICES: Readonly<Record<PlantType, number>> = {
  sakura: 5,
  flower: 3,
}

export const HARVEST_REWARDS: Readonly<Record<PlantType, number>> = {
  sakura: 12,
  flower: 7,
}

export function createInitialGameState(): GameState {
  return {
    garden: createInitialGarden(),
    economy: {
      coins: 10,
      seeds: {
        sakura: 2,
        flower: 2,
      },
    },
  }
}

export function buySeed(state: GameState, plantType: PlantType): GameState {
  const price = SEED_PRICES[plantType]

  if (state.economy.coins < price) {
    return state
  }

  return {
    ...state,
    economy: {
      coins: state.economy.coins - price,
      seeds: {
        ...state.economy.seeds,
        [plantType]: state.economy.seeds[plantType] + 1,
      },
    },
  }
}

export function plantSeed(
  state: GameState,
  coordinates: GridCell,
  plantType: PlantType,
  plantedAt: number,
): GameState {
  if (state.economy.seeds[plantType] < 1) {
    return state
  }

  const garden = plantInCell(
    state.garden,
    coordinates,
    plantType,
    plantedAt,
  )

  if (garden === state.garden) {
    return state
  }

  return {
    garden,
    economy: {
      ...state.economy,
      seeds: {
        ...state.economy.seeds,
        [plantType]: state.economy.seeds[plantType] - 1,
      },
    },
  }
}

export function harvestForReward(
  state: GameState,
  coordinates: GridCell,
  currentTime: number,
): GameState {
  const plantType = getCell(state.garden, coordinates)?.plant?.type

  if (!plantType) {
    return state
  }

  const garden = harvestPlant(state.garden, coordinates, currentTime)

  if (garden === state.garden) {
    return state
  }

  return {
    garden,
    economy: {
      ...state.economy,
      coins: state.economy.coins + HARVEST_REWARDS[plantType],
    },
  }
}
