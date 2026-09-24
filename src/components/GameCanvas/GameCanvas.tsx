import { useEffect, useRef } from 'react'
import {
  createGardenGame,
  type GardenGame,
} from '../../game/createGardenGame'
import type { Garden } from '../../game/garden'
import type { GridCell } from '../../game/grid'
import styles from './GameCanvas.module.css'

type GameCanvasProps = {
  garden: Garden
  selectedCell: GridCell | null
  onCellSelect: (cell: GridCell) => void
}

type ViewState = Pick<GameCanvasProps, 'garden' | 'selectedCell'>

export function GameCanvas({
  garden,
  selectedCell,
  onCellSelect,
}: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCellSelect)
  const gameRef = useRef<GardenGame | null>(null)
  const viewStateRef = useRef<ViewState>({ garden, selectedCell })

  useEffect(() => {
    callbackRef.current = onCellSelect
  }, [onCellSelect])

  useEffect(() => {
    const viewState = { garden, selectedCell }
    viewStateRef.current = viewState
    gameRef.current?.update(viewState.garden, viewState.selectedCell)
  }, [garden, selectedCell])

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    const controller = new AbortController()
    let destroyGame: (() => void) | undefined

    void createGardenGame(
      host,
      (cell) => callbackRef.current(cell),
      controller.signal,
    ).then((game) => {
      if (controller.signal.aborted) {
        game?.destroy()
        return
      }

      gameRef.current = game
      const viewState = viewStateRef.current
      game?.update(viewState.garden, viewState.selectedCell)
      destroyGame = game?.destroy
    })

    return () => {
      controller.abort()
      gameRef.current = null
      destroyGame?.()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className={styles.canvasHost}
      aria-label="Игровое поле 8 на 8 клеток"
    />
  )
}
