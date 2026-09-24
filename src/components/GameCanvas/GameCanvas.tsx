import { useEffect, useRef } from 'react'
import { createGardenGame } from '../../game/createGardenGame'
import type { GridCell } from '../../game/grid'
import styles from './GameCanvas.module.css'

type GameCanvasProps = {
  onCellSelect: (cell: GridCell) => void
}

export function GameCanvas({ onCellSelect }: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCellSelect)

  useEffect(() => {
    callbackRef.current = onCellSelect
  }, [onCellSelect])

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

      destroyGame = game?.destroy
    })

    return () => {
      controller.abort()
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
