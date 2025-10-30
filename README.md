# Expense Tracker (Node + React + MongoDB)

An interactive expense tracker with authentication, an expenses page, and a dashboard with graphs.

## Features

- Login/Signup with JWT (stored as httpOnly cookie + exposed token for convenience)
- Expenses CRUD with filters (date range, category)
- Dashboard charts: spending over time and by category (Recharts)
- Tailwind UI for a clean, responsive layout
- Dev-friendly: if no `MONGODB_URI` is set, the backend uses an in-memory MongoDB automatically

## Prerequisites

- Node.js 18+
- Optional: MongoDB running locally OR Docker (only if you want persistent data). If you skip, the server will use in-memory DB.

## Quick start (two terminals)

Terminal 1 (server):

```powershell
cd "d:\expense tracker\server"; npm init -y; npm install express cors dotenv mongoose jsonwebtoken bcryptjs cookie-parser express-validator helmet morgan mongodb-memory-server; npm install -D nodemon
```

Create `.env` by copying `.env.sample` and adjust if needed:

```powershell
Copy-Item ".env.sample" ".env"
```

Start the server:

```powershell
npm run dev
```

If `dev` is missing, add this to `server/package.json` scripts and re-run:

```json
"scripts": { "dev": "nodemon ./src/index.js", "start": "node ./src/index.js" }
```

Terminal 2 (client):

```powershell
cd "d:\expense tracker\client"; npm install; npm run dev
```

Open the app:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000/api/health

If you use a real MongoDB, set `MONGODB_URI` in `server/.env` and restart the server.

## Environment files

- `server/.env.sample` (copy to `.env`)
- `client/.env.sample` (copy to `.env`)

## Notes

- Protected routes redirect to /login if you are not authenticated.
- The server sets an httpOnly cookie. The client also stores the token in localStorage to attach as Bearer for API calls.
- For production, set `JWT_SECRET`, enable HTTPS, and configure `secure: true` cookies.
