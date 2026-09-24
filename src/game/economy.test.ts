import { describe, expect, it } from 'vitest'
import {
  buySeed,
  createInitialGameState,
  HARVEST_REWARDS,
  harvestForReward,
  plantSeed,
  SEED_PRICES,
  type GameState,
} from './economy'
import { getCell, GROWTH_DURATION_MS } from './garden'

const SOIL_CELL = { x: 2, y: 2 }
const PLANTED_AT = 1_000

describe('economy rules', () => {
  it('buys a seed for coins', () => {
    const state = createInitialGameState()
    const nextState = buySeed(state, 'sakura')

    expect(nextState.economy.coins).toBe(
      state.economy.coins - SEED_PRICES.sakura,
    )
    expect(nextState.economy.seeds.sakura).toBe(
      state.economy.seeds.sakura + 1,
    )
  })

  it('does not buy a seed without enough coins', () => {
    const state: GameState = {
      ...createInitialGameState(),
      economy: {
        coins: 0,
        seeds: { sakura: 0, flower: 0 },
      },
    }

    expect(buySeed(state, 'flower')).toBe(state)
  })

  it('spends one seed after successful planting', () => {
    const state = createInitialGameState()
    const nextState = plantSeed(state, SOIL_CELL, 'flower', PLANTED_AT)

    expect(nextState.economy.seeds.flower).toBe(
      state.economy.seeds.flower - 1,
    )
    expect(getCell(nextState.garden, SOIL_CELL)?.plant?.type).toBe('flower')
  })

  it('does not plant without seeds', () => {
    const initialState = createInitialGameState()
    const state: GameState = {
      ...initialState,
      economy: {
        ...initialState.economy,
        seeds: { ...initialState.economy.seeds, sakura: 0 },
      },
    }

    expect(plantSeed(state, SOIL_CELL, 'sakura', PLANTED_AT)).toBe(state)
  })

  it('does not spend a seed when planting is rejected', () => {
    const state = createInitialGameState()

    expect(plantSeed(state, { x: 0, y: 0 }, 'flower', PLANTED_AT)).toBe(state)
  })

  it('awards coins only after harvesting a mature plant', () => {
    const state = plantSeed(
      createInitialGameState(),
      SOIL_CELL,
      'sakura',
      PLANTED_AT,
    )

    expect(harvestForReward(state, SOIL_CELL, PLANTED_AT + 10_000)).toBe(state)

    const harvestedState = harvestForReward(
      state,
      SOIL_CELL,
      PLANTED_AT + GROWTH_DURATION_MS,
    )

    expect(harvestedState.economy.coins).toBe(
      state.economy.coins + HARVEST_REWARDS.sakura,
    )
    expect(getCell(harvestedState.garden, SOIL_CELL)?.plant).toBeNull()
  })
})
