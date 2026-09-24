import { useCallback, useState } from 'react'
import { GameCanvas } from '../components/GameCanvas/GameCanvas'
import {
  applyHoe,
  createInitialGarden,
  getCell,
  plantInCell,
  type Garden,
  type PlantType,
} from '../game/garden'
import type { GridCell } from '../game/grid'
import styles from './App.module.css'

type Tool = 'select' | 'hoe' | 'plant'

const PLANT_NAMES: Record<PlantType, string> = {
  sakura: 'Sakura',
  flower: 'Flower',
}

export function App() {
  const [garden, setGarden] = useState<Garden>(createInitialGarden)
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<GridCell | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [plantType, setPlantType] = useState<PlantType>('sakura')

  const selectedCell = selectedCoordinates
    ? getCell(garden, selectedCoordinates)
    : null

  const handleCellSelect = useCallback((cell: GridCell) => {
    setSelectedCoordinates(cell)

    if (activeTool === 'hoe') {
      setGarden((currentGarden) => applyHoe(currentGarden, cell))
    }

    if (activeTool === 'plant') {
      setGarden((currentGarden) => plantInCell(currentGarden, cell, plantType))
    }
  }, [activeTool, plantType])

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
          <button
            className={styles.toolButton}
            data-active={activeTool === 'plant'}
            type="button"
            onClick={() => setActiveTool('plant')}
          >
            Plant
          </button>
        </div>

        {activeTool === 'plant' && (
          <div className={styles.plantPicker} aria-label="Вид растения">
            {(Object.entries(PLANT_NAMES) as [PlantType, string][]).map(
              ([type, name]) => (
                <button
                  key={type}
                  className={styles.plantButton}
                  type="button"
                  aria-pressed={plantType === type}
                  onClick={() => setPlantType(type)}
                >
                  {name}
                </button>
              ),
            )}
          </div>
        )}

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
                {selectedCell.plant && (
                  <> · {PLANT_NAMES[selectedCell.plant]}</>
                )}
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
