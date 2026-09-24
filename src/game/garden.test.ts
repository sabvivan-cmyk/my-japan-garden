import { describe, expect, it } from 'vitest'
import { GRID_SIZE } from './grid'
import {
  applyHoe,
  createInitialGarden,
  getCell,
  getPlantGrowth,
  GROWTH_DURATION_MS,
  harvestPlant,
  plantInCell,
} from './garden'

const PLANTED_AT = 1_000

describe('garden state', () => {
  it('creates an 8 by 8 garden with grass and initial soil plots', () => {
    const garden = createInitialGarden()

    expect(garden).toHaveLength(GRID_SIZE * GRID_SIZE)
    expect(garden.filter((cell) => cell.surface === 'grass').length).toBeGreaterThan(0)
    expect(garden.filter((cell) => cell.surface === 'soil').length).toBeGreaterThan(0)
    expect(garden.every((cell) => cell.isInteractable)).toBe(true)
    expect(garden.every((cell) => cell.plant === null)).toBe(true)
  })

  it('returns null for coordinates outside the garden', () => {
    const garden = createInitialGarden()

    expect(getCell(garden, { x: -1, y: 0 })).toBeNull()
    expect(getCell(garden, { x: 0, y: -1 })).toBeNull()
    expect(getCell(garden, { x: GRID_SIZE, y: 0 })).toBeNull()
    expect(getCell(garden, { x: 0, y: GRID_SIZE })).toBeNull()
  })

  it('changes a grass cell to soil without mutating the garden', () => {
    const garden = createInitialGarden()
    const coordinates = { x: 0, y: 0 }
    const nextGarden = applyHoe(garden, coordinates)

    expect(getCell(garden, coordinates)?.surface).toBe('grass')
    expect(getCell(nextGarden, coordinates)?.surface).toBe('soil')
    expect(nextGarden).not.toBe(garden)
  })

  it('does not change the garden when Hoe is applied to soil again', () => {
    const garden = createInitialGarden()
    const coordinates = { x: 0, y: 0 }
    const gardenWithSoil = applyHoe(garden, coordinates)

    expect(applyHoe(gardenWithSoil, coordinates)).toBe(gardenWithSoil)
  })

  it('plants a selected plant on soil', () => {
    const garden = createInitialGarden()
    const coordinates = { x: 2, y: 2 }
    const plantedGarden = plantInCell(garden, coordinates, 'sakura', PLANTED_AT)

    expect(getCell(plantedGarden, coordinates)?.plant).toEqual({
      type: 'sakura',
      plantedAt: PLANTED_AT,
    })
    expect(getCell(garden, coordinates)?.plant).toBeNull()
  })

  it('does not plant on grass', () => {
    const garden = createInitialGarden()
    const coordinates = { x: 0, y: 0 }

    expect(plantInCell(garden, coordinates, 'flower', PLANTED_AT)).toBe(garden)
    expect(getCell(garden, coordinates)?.plant).toBeNull()
  })

  it('does not replace a plant in an occupied cell', () => {
    const garden = createInitialGarden()
    const coordinates = { x: 2, y: 2 }
    const plantedGarden = plantInCell(garden, coordinates, 'sakura', PLANTED_AT)

    expect(
      plantInCell(plantedGarden, coordinates, 'flower', PLANTED_AT),
    ).toBe(plantedGarden)
    expect(getCell(plantedGarden, coordinates)?.plant?.type).toBe('sakura')
  })

  it('keeps plants when another tool changes a different cell', () => {
    const garden = createInitialGarden()
    const plantedGarden = plantInCell(
      garden,
      { x: 2, y: 2 },
      'flower',
      PLANTED_AT,
    )
    const gardenAfterHoe = applyHoe(plantedGarden, { x: 0, y: 0 })

    expect(getCell(gardenAfterHoe, { x: 2, y: 2 })?.plant?.type).toBe('flower')
  })

  it('calculates seed, sprout and mature stages from planting time', () => {
    const plant = { type: 'sakura' as const, plantedAt: PLANTED_AT }

    expect(getPlantGrowth(plant, PLANTED_AT)).toEqual({
      stage: 'seed',
      progress: 0,
    })
    expect(
      getPlantGrowth(plant, PLANTED_AT + GROWTH_DURATION_MS / 2),
    ).toEqual({ stage: 'sprout', progress: 0.5 })
    expect(
      getPlantGrowth(plant, PLANTED_AT + GROWTH_DURATION_MS),
    ).toEqual({ stage: 'mature', progress: 1 })
  })

  it('does not harvest an immature plant', () => {
    const garden = createInitialGarden()
    const coordinates = { x: 2, y: 2 }
    const plantedGarden = plantInCell(
      garden,
      coordinates,
      'flower',
      PLANTED_AT,
    )

    expect(
      harvestPlant(plantedGarden, coordinates, PLANTED_AT + 10_000),
    ).toBe(plantedGarden)
  })

  it('harvests a mature plant and leaves soil ready for planting', () => {
    const garden = createInitialGarden()
    const coordinates = { x: 2, y: 2 }
    const plantedGarden = plantInCell(
      garden,
      coordinates,
      'sakura',
      PLANTED_AT,
    )
    const harvestedGarden = harvestPlant(
      plantedGarden,
      coordinates,
      PLANTED_AT + GROWTH_DURATION_MS,
    )
    const harvestedCell = getCell(harvestedGarden, coordinates)

    expect(harvestedCell?.plant).toBeNull()
    expect(harvestedCell?.surface).toBe('soil')
    expect(
      plantInCell(harvestedGarden, coordinates, 'flower', PLANTED_AT + 40_000),
    ).not.toBe(harvestedGarden)
  })

  it('grows plants independently from their planting times', () => {
    const garden = createInitialGarden()
    const firstGarden = plantInCell(garden, { x: 2, y: 2 }, 'sakura', 0)
    const plantedGarden = plantInCell(firstGarden, { x: 3, y: 2 }, 'flower', 10_000)
    const firstPlant = getCell(plantedGarden, { x: 2, y: 2 })?.plant
    const secondPlant = getCell(plantedGarden, { x: 3, y: 2 })?.plant

    expect(firstPlant && getPlantGrowth(firstPlant, 20_000).stage).toBe('sprout')
    expect(secondPlant && getPlantGrowth(secondPlant, 20_000).stage).toBe('seed')
  })
})
