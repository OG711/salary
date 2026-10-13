# Finance Tracker

Веб-приложение для учёта личных финансов, разделения потоков на доходы и расходы по категориям, а также анализа финансового состояния.

## Стек технологий

- **Frontend:** React 18, Vite, Tailwind CSS, TanStack Query v5, Recharts, Lucide React
- **Backend:** Node.js, Express, `@libsql/client` (Turso)
- **База данных:** Turso (libSQL)
- **Деплой:** Готов к деплою на Vercel (Serverless Functions)

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/OG711/salary.git
cd salary
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
Создайте `.env` файл на основе `.env.example`:
```env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
PORT=3000
```

4. Инициализируйте базу данных (создание таблиц и начальных категорий):
```bash
npm run db:seed
```

5. Запустите проект:
- Backend: `npm run dev:server` (порт 3000)
- Frontend: `npm run dev` (порт 5173)

## Сборка для продакшена

```bash
npm run build
```
