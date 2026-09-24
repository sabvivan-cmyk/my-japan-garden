export const GRID_SIZE = 8
export const CELL_SIZE = 64
export const GRID_PIXEL_SIZE = GRID_SIZE * CELL_SIZE

export type GridCell = {
  x: number
  y: number
}

export function pointToCell(x: number, y: number): GridCell | null {
  if (x < 0 || y < 0 || x >= GRID_PIXEL_SIZE || y >= GRID_PIXEL_SIZE) {
    return null
  }

  return {
    x: Math.floor(x / CELL_SIZE),
    y: Math.floor(y / CELL_SIZE),
  }
}

export function isSameCell(first: GridCell | null, second: GridCell): boolean {
  return first?.x === second.x && first.y === second.y
}
