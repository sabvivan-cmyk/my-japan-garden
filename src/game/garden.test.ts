import { describe, expect, it } from 'vitest'
import { GRID_SIZE } from './grid'
import { applyHoe, createInitialGarden, getCell } from './garden'

describe('garden state', () => {
  it('creates an 8 by 8 garden with grass and initial soil plots', () => {
    const garden = createInitialGarden()

    expect(garden).toHaveLength(GRID_SIZE * GRID_SIZE)
    expect(garden.filter((cell) => cell.surface === 'grass').length).toBeGreaterThan(0)
    expect(garden.filter((cell) => cell.surface === 'soil').length).toBeGreaterThan(0)
    expect(garden.every((cell) => cell.isInteractable)).toBe(true)
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
})
