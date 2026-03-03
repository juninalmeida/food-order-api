# Deploy on Railway (Free)

## 1. Create the project

1. Connect this repository to Railway.
2. Keep the default build command (`npm run build`).
3. Keep the default start command (`npm start`).

## 2. Add persistent storage for SQLite

1. Add a `Volume` in Railway.
2. Mount path: `/data`.

The app reads `DATABASE_PATH` and will use `/data/database.db`.

## 3. Set environment variables

Set these variables in Railway:

- `NODE_ENV=production`
- `PORT=3333`
- `CORS_ORIGIN=https://your-frontend-domain.com`
- `DATABASE_PATH=/data/database.db`

## 4. First boot behavior

On startup the app runs:

1. `migrate:latest`
2. `seed:run` (idempotent, it only inserts missing default records)
3. starts HTTP server

Healthcheck endpoint:

- `GET /health`
