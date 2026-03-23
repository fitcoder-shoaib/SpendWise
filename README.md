# SpendWise

AI-powered smart spending and auto-saving app with insights, goals, chatbot coaching, and a social leaderboard.

## Project Structure

```text
SpendWise/
├── backend/
├── frontend/
├── package.json
└── README.md
```

## 🚀 Quick Start

Copy and paste this exactly:

```bash
git clone <repo-url>
cd SpendWise
npm install
npm run setup
npm start
```

Open:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5050](http://localhost:5050)
- Health check: [http://localhost:5050/health](http://localhost:5050/health)

Demo login:

```text
Email: demo@spendwise.app
Password: demo123
```

## Detailed Setup

### 1. Install dependencies

```bash
cd SpendWise
npm install
npm run setup
```

### 2. Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Then set these values in `backend/.env`:

```env
PORT=5050
JWT_SECRET=spendwise-demo-secret
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
SQLITE_PATH=backend/data/spendwise.sqlite
```

### 3. Start with local SQLite

On the first backend boot, SpendWise creates a local SQLite database file and auto-seeds demo data:

- demo user
- transactions
- goals
- savings entries
- leaderboard friends

### 4. Start the full app

```bash
npm start
```

### 5. Open the app

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5050
Health:   http://localhost:5050/health
```

## SQLite Notes

- SpendWise now uses a local SQLite database file for persistence.
- The default database path is `backend/data/spendwise.sqlite`.
- No external database service or signup is required.

## Features

- JWT signup and login
- SQLite-backed users, transactions, goals, savings entries, and leaderboard friends
- Smart savings engine with fixed monthly, round-off, and rule-based savings
- Daily spending alerts
- Goal-based savings
- AI insights endpoint
- AI chatbot with finance logic before GPT
- Weekly social leaderboard
- Dark mode and tabbed dashboard UI

## Tech Stack

- Backend: Node.js, Express, SQLite, JWT, OpenAI SDK
- Frontend: React, react-scripts
- Tooling: concurrently, nodemon

## Demo Flow

1. Start the app with `npm start`.
2. Open `http://localhost:3000`.
3. Log in with `demo@spendwise.app` / `demo123`.
4. Add a transaction and watch savings logic update.
5. Create a goal, contribute to it, and use the AI Coach tab.

## API Snapshot

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/savings/summary`
- `PUT /api/savings/settings`
- `POST /api/savings/fixed-monthly`
- `POST /api/savings/manual`
- `GET /api/goals`
- `POST /api/goals`
- `POST /api/goals/:goalId/contribute`
- `GET /api/leaderboard/weekly`
- `POST /api/ai-insights`
- `POST /chat`
- `POST /api/chat`
