import { useCallback, useEffect, useState } from 'react'
import { GameCanvas } from '../components/GameCanvas/GameCanvas'
import {
  buySeed,
  createInitialGameState,
  harvestForReward,
  plantSeed,
  SEED_PRICES,
} from '../game/economy'
import {
  applyHoe,
  getCell,
  getPlantGrowth,
  type PlantType,
} from '../game/garden'
import type { GridCell } from '../game/grid'
import styles from './App.module.css'

type Tool = 'select' | 'hoe' | 'plant' | 'harvest'

const PLANT_NAMES: Record<PlantType, string> = {
  sakura: 'Sakura',
  flower: 'Flower',
}

export function App() {
  const [gameState, setGameState] = useState(createInitialGameState)
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<GridCell | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const [plantType, setPlantType] = useState<PlantType>('sakura')
  const [currentTime, setCurrentTime] = useState(Date.now)
  const { garden, economy } = gameState

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1_000)

    return () => window.clearInterval(timerId)
  }, [])

  const selectedCell = selectedCoordinates
    ? getCell(garden, selectedCoordinates)
    : null
  const selectedGrowth = selectedCell?.plant
    ? getPlantGrowth(selectedCell.plant, currentTime)
    : null

  const handleCellSelect = useCallback((cell: GridCell) => {
    setSelectedCoordinates(cell)

    if (activeTool === 'hoe') {
      setGameState((currentState) => {
        const garden = applyHoe(currentState.garden, cell)

        return garden === currentState.garden
          ? currentState
          : { ...currentState, garden }
      })
    }

    if (activeTool === 'plant') {
      setGameState((currentState) =>
        plantSeed(currentState, cell, plantType, Date.now()),
      )
    }

    if (activeTool === 'harvest') {
      setGameState((currentState) =>
        harvestForReward(currentState, cell, Date.now()),
      )
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

        <div className={styles.resources} aria-label="Ресурсы">
          <span>Coins: <strong>{economy.coins}</strong></span>
          <span>Sakura seeds: <strong>{economy.seeds.sakura}</strong></span>
          <span>Flower seeds: <strong>{economy.seeds.flower}</strong></span>
        </div>

        <div className={styles.shop} aria-label="Магазин семян">
          {(Object.entries(PLANT_NAMES) as [PlantType, string][]).map(
            ([type, name]) => (
              <button
                key={type}
                className={styles.shopButton}
                type="button"
                disabled={economy.coins < SEED_PRICES[type]}
                onClick={() =>
                  setGameState((currentState) => buySeed(currentState, type))
                }
              >
                Buy {name} seed · {SEED_PRICES[type]} coins
              </button>
            ),
          )}
        </div>

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
          <button
            className={styles.toolButton}
            data-active={activeTool === 'harvest'}
            type="button"
            onClick={() => setActiveTool('harvest')}
          >
            Harvest
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
          currentTime={currentTime}
          onCellSelect={handleCellSelect}
        />

        <div className={styles.status} aria-live="polite">
          {selectedCell ? (
            <>
              Выбрана клетка:{' '}
              <strong>
                x {selectedCell.x}, y {selectedCell.y} · {selectedCell.surface}
                {selectedCell.plant && selectedGrowth && (
                  <>
                    {' '}· {PLANT_NAMES[selectedCell.plant.type]} ·{' '}
                    {selectedGrowth.stage} ·{' '}
                    {Math.round(selectedGrowth.progress * 100)}%
                  </>
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
