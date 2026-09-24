import { describe, expect, it } from 'vitest'
import { CELL_SIZE, GRID_PIXEL_SIZE, isSameCell, pointToCell } from './grid'

describe('pointToCell', () => {
  it('converts a point to zero-based grid coordinates', () => {
    expect(pointToCell(0, 0)).toEqual({ x: 0, y: 0 })
    expect(pointToCell(CELL_SIZE + 10, CELL_SIZE * 3 + 1)).toEqual({
      x: 1,
      y: 3,
    })
    expect(pointToCell(GRID_PIXEL_SIZE - 1, GRID_PIXEL_SIZE - 1)).toEqual({
      x: 7,
      y: 7,
    })
  })

  it('returns null for points outside the grid', () => {
    expect(pointToCell(-1, 0)).toBeNull()
    expect(pointToCell(0, -1)).toBeNull()
    expect(pointToCell(GRID_PIXEL_SIZE, 0)).toBeNull()
    expect(pointToCell(0, GRID_PIXEL_SIZE)).toBeNull()
  })
})

describe('isSameCell', () => {
  it('compares cell coordinates', () => {
    expect(isSameCell({ x: 2, y: 4 }, { x: 2, y: 4 })).toBe(true)
    expect(isSameCell({ x: 2, y: 4 }, { x: 3, y: 4 })).toBe(false)
    expect(isSameCell(null, { x: 2, y: 4 })).toBe(false)
  })
})
