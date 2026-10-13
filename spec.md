Ниже представлена подробная техническая спецификация (**Technical Specification / Task Spec**) в формате Markdown, оптимизированная для скармливания AI-агенту (Antigravity CLI / Cursor / Claude Code). 

Она содержит точные структуры файлов, DDL-схемы, контракты API и пошаговые инструкции без двусмысленностей.

---

```markdown
# Technical Specification: Finance Tracker (React + Vite + Turso + Node.js)

## 1. Контекст и архитектурные решения

- **Архитектура:** Единый монорепозиторий (Monorepo), готовый к деплою на Vercel.
- **Frontend:** React 18/19, Vite, Tailwind CSS, TanStack Query (v5), Lucide-react, Recharts.
- **Backend:** Node.js, Express (или Hono), `@libsql/client` (официальный драйвер Turso).
- **Среда выполнения бэкенда:** Vercel Serverless Function (точка входа `api/index.js`).
- **База данных:** Turso (libSQL).

---

## 2. Структура проекта (Filesystem Tree)

```text
.
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── api/
│   ├── index.js              # Точка входа Vercel Serverless (Express app)
│   ├── db/
│   │   ├── client.js         # Инициализация Turso client
│   │   └── seed.js           # Скрипт миграции и сидирования БД
│   └── routes/
│       ├── categories.js     # Маршруты категорий
│       ├── transactions.js   # Маршруты транзакций
│       └── analytics.js      # Маршруты расчёта аналитики
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── api/
    │   └── client.js         # Axios/fetch обёртка для взаимодействия с /api
    ├── components/
    │   ├── Layout.jsx
    │   ├── SummaryCards.jsx
    │   ├── ExpensePieChart.jsx
    │   ├── TransactionModal.jsx
    │   ├── TransactionList.jsx
    │   └── DateFilter.jsx
    └── hooks/
        └── useFinanceData.js # TanStack Query хуки
```

---

## 3. Переменные окружения (.env.example)

Создать файл `.env.example`:
```env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
PORT=3000
```

---

## 4. Схема базы данных и Seed Data

### 4.1 SQL DDL (`api/db/schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    color TEXT NOT NULL,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- формат YYYY-MM-DD
    note TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
```

### 4.2 Скрипт начальных данных (`api/db/seed.js`)
В скрипт включить создание таблиц и заполнение предустановленных категорий:
- **Расходные категории:**
  - "Продукты" (`#EF4444`, icon: `ShoppingCart`)
  - "Коммуналка" (`#F97316`, icon: `Home`)
  - "Аренда" (`#8B5CF6`, icon: `Key`)
  - "Транспорт" (`#3B82F6`, icon: `Car`)
  - "Развлечения" (`#EC4899`, icon: `Film`)
  - "Здоровье" (`#10B981`, icon: `Activity`)
  - "Другое" (`#6B7280`, icon: `MoreHorizontal`)
- **Доходные категории:**
  - "Зарплата" (`#10B981`, icon: `Briefcase`)
  - "Подработка" (`#06B6D4`, icon: `Laptop`)
  - "Проценты от вкладов" (`#F59E0B`, icon: `Percent`)
  - "Подарки" (`#84CC16`, icon: `Gift`)
  - "Другое" (`#6B7280`, icon: `MoreHorizontal`)

---

## 5. Спецификация Backend API

Базовый путь: `/api`

### 5.1 Категории

#### `GET /api/categories`
- **Query Params:** `type` (опционально: `'income'` | `'expense'`).
- **Response 200:**
```json
[
  { "id": 1, "name": "Продукты", "type": "expense", "color": "#EF4444", "icon": "ShoppingCart" }
]
```

#### `POST /api/categories`
- **Body:** `{ "name": string, "type": "income"|"expense", "color": string, "icon": string }`
- **Response 201:** Созданный объект категории.

---

### 5.2 Транзакции

#### `GET /api/transactions`
- **Query Params:**
  - `startDate` (YYYY-MM-DD, опционально)
  - `endDate` (YYYY-MM-DD, опционально)
  - `type` ('income' | 'expense', опционально)
  - `categoryId` (number, опционально)
  - `limit` (default: 50)
  - `offset` (default: 0)
- **Response 200:**
```json
[
  {
    "id": 10,
    "amount": 1200.50,
    "type": "expense",
    "category_id": 1,
    "category_name": "Продукты",
    "category_color": "#EF4444",
    "date": "2026-10-15",
    "note": "Закупка на неделю",
    "created_at": "2026-10-15T12:00:00Z"
  }
]
```
*(Запрос должен использовать `LEFT JOIN categories ON transactions.category_id = categories.id`)*.

#### `POST /api/transactions`
- **Body:**
```json
{
  "amount": 50000,
  "type": "income",
  "category_id": 2,
  "date": "2026-10-10",
  "note": "Аванс"
}
```
- **Валидация:** `amount > 0`, `category_id` существует, `date` соответствует формату YYYY-MM-DD.
- **Response 201:** Созданная запись.

#### `PUT /api/transactions/:id`
- **Body:** Все или часть полей транзакции.
- **Response 200:** Обновлённая запись.

#### `DELETE /api/transactions/:id`
- **Response 200:** `{ "success": true, "deletedId": 10 }`

---

### 5.3 Аналитика

#### `GET /api/analytics/summary`
- **Query Params:** `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD).
- **Backend SQL:**
  - Расчёт суммарного дохода (`SUM(amount)` WHERE `type = 'income'`).
  - Расчёт суммарного расхода (`SUM(amount)` WHERE `type = 'expense'`).
  - Группировка трат по категориям (`GROUP BY category_id`).
- **Response 200:**
```json
{
  "totalIncome": 120000,
  "totalExpense": 65000,
  "netBalance": 55000,
  "byCategory": [
    { "categoryId": 1, "name": "Продукты", "color": "#EF4444", "total": 25000 },
    { "categoryId": 3, "name": "Аренда", "color": "#8B5CF6", "total": 30000 }
  ]
}
```

---

## 6. Конфигурации деплоя (Vercel & Scripts)

### 6.1 `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 6.2 `package.json` (Root)
Убедиться в наличии следующих скриптов и зависимостей:
```json
{
  "name": "finance-tracker",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:server": "node --watch api/index.js",
    "build": "vite build",
    "preview": "vite preview",
    "db:seed": "node api/db/seed.js"
  },
  "dependencies": {
    "@libsql/client": "^0.6.0",
    "@tanstack/react-query": "^5.0.0",
    "clsx": "^2.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "lucide-react": "^0.378.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.11"
  }
}
```

### 6.3 `vite.config.js` (с proxy для локальной разработки)
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

---

## 7. Требования к UI/UX (Frontend)

1. **Dashboard (Главный экран):**
   - Селектор периода (Текущий месяц, Прошлый месяц, Все время).
   - 3 карточки: **Общий доход** (зеленый акцент), **Общий расход** (красный акцент), **Чистый остаток** (синий/нейтральный).
   - Круговая диаграмма (Donut Chart) расходов по категориям.
   - Кнопка вызова плавающей модалки: **"+ Добавить операцию"**.

2. **Модальное окно добавления/редактирования:**
   - Переключатель табов: **Расход** / **Доход**.
   - Input суммы (числовой, крупный шрифт, автофокус).
   - Dropdown категорий (динамически фильтруется по выбранному типу).
   - Date picker (по умолчанию `new Date().toISOString().slice(0, 10)`).
   - Textarea для комментария (опционально).
   - Инвалидация запросов через `queryClient.invalidateQueries({ queryKey: ['transactions'] })` и `queryKey: ['analytics']` при успехе.

3. **Список последних операций:**
   - Отображение иконки категории с фоновым цветом.
   - Дата, категория, заметка.
   - Сумма: `+` зеленым для доходов, `-` красным для расходов.
   - Кнопка удаления с подтверждением.

---

## 8. Пошаговый план для разработчика (Execution Plan)

- [ ] **Шаг 1:** Инициализировать репозиторий, создать `package.json`, установить зависимости. Настроить Tailwind и Vite.
- [ ] **Шаг 2:** Создать `api/db/client.js` с подключением к Turso через `@libsql/client` (используя `process.env.TURSO_DATABASE_URL` и `process.env.TURSO_AUTH_TOKEN`).
- [ ] **Шаг 3:** Написать и запустить `api/db/seed.js` для создания таблиц и добавления базовых категорий.
- [ ] **Шаг 4:** Реализовать Express-роуты: `/api/categories`, `/api/transactions`, `/api/analytics/summary` в `api/index.js` (экспортировать `app` для Vercel).
- [ ] **Шаг 5:** Настроить React-приложение: настроить `QueryClientProvider`, настроить Tailwind стили.
- [ ] **Шаг 6:** Создать компоненты UI: карточки сводки, диаграмму Recharts, форму модального окна и список транзакций.
- [ ] **Шаг 7:** Проверить локальную работу через `npm run dev:server` и `npm run dev`.
- [ ] **Шаг 8:** Проверить конфигурацию `vercel.json` перед пушем в GitHub.
```