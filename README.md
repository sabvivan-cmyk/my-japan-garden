# My Japan Garden

Небольшая браузерная 2D-игра в эстетике уютного японского сада. Проект создаётся как pet-проект для портфолио frontend-разработчика на React, TypeScript и PixiJS.

Сейчас реализованы базовая интеграция React и PixiJS, состояние поля 8×8, выбор клеток и инструмент Hoe.

## Требования

- Node.js 18.18+ или 20+
- npm 9+

## Запуск

```bash
npm install
npm run dev
```

После запуска откройте адрес, который покажет Vite (обычно `http://localhost:5173`).

## Проверки

```bash
npm run lint
npm test
npm run build
```

## Структура

```text
src/
├── app/                 # React UI и стили страницы
├── components/          # React-компоненты
│   └── GameCanvas/      # Точка интеграции React и PixiJS
└── game/                # PixiJS и чистая игровая логика
    ├── createGardenGame.ts
    ├── garden.test.ts
    ├── garden.ts
    ├── grid.ts
    └── grid.test.ts
```

React отвечает за страницу и отображение выбранных координат. PixiJS владеет canvas, отрисовывает поле и обрабатывает клики. Между ними передаётся только callback с координатами клетки.
