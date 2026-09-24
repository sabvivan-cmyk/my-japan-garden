import { useCallback, useState } from 'react'
import { GameCanvas } from '../components/GameCanvas/GameCanvas'
import {
  applyHoe,
  createInitialGarden,
  getCell,
  type Garden,
} from '../game/garden'
import type { GridCell } from '../game/grid'
import styles from './App.module.css'

type Tool = 'select' | 'hoe'

export function App() {
  const [garden, setGarden] = useState<Garden>(createInitialGarden)
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<GridCell | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('select')

  const selectedCell = selectedCoordinates
    ? getCell(garden, selectedCoordinates)
    : null

  const handleCellSelect = useCallback((cell: GridCell) => {
    setSelectedCoordinates(cell)

    if (activeTool === 'hoe') {
      setGarden((currentGarden) => applyHoe(currentGarden, cell))
    }
  }, [activeTool])

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>A small place to slow down</p>
        <h1 className={styles.title}>My Japan Garden</h1>
        <p className={styles.description}>
          Выберите клетку будущего сада
        </p>

        <div className={styles.toolbar} aria-label="Инструменты">
          <button
            className={styles.toolButton}
            data-active={activeTool === 'select'}
            type="button"
            onClick={() => setActiveTool('select')}
          >
            Select
          </button>
          <button
            className={styles.toolButton}
            data-active={activeTool === 'hoe'}
            type="button"
            onClick={() => setActiveTool('hoe')}
          >
            Hoe
          </button>
        </div>

        <GameCanvas
          garden={garden}
          selectedCell={selectedCell}
          onCellSelect={handleCellSelect}
        />

        <div className={styles.status} aria-live="polite">
          {selectedCell ? (
            <>
              Выбрана клетка:{' '}
              <strong>
                x {selectedCell.x}, y {selectedCell.y} · {selectedCell.surface}
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
