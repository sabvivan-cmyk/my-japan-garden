import { useCallback, useState } from 'react'
import { GameCanvas } from '../components/GameCanvas/GameCanvas'
import type { GridCell } from '../game/grid'
import styles from './App.module.css'

export function App() {
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null)

  const handleCellSelect = useCallback((cell: GridCell) => {
    setSelectedCell(cell)
  }, [])

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>A small place to slow down</p>
        <h1 className={styles.title}>My Japan Garden</h1>
        <p className={styles.description}>
          Выберите клетку будущего сада
        </p>

        <GameCanvas onCellSelect={handleCellSelect} />

        <div className={styles.status} aria-live="polite">
          {selectedCell ? (
            <>
              Выбрана клетка:{' '}
              <strong>
                x {selectedCell.x}, y {selectedCell.y}
              </strong>
            </>
          ) : (
            'Клетка не выбрана'
          )}
        </div>
      </section>
    </main>
  )
}
