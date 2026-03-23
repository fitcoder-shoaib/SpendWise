# SpendWise

AI-powered smart spending and auto-saving app with insights and leaderboard.

<<<<<<< HEAD
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

The app now opens on a login screen. You can either:

- log in with the demo account above
- create a new local account from the sign-up view

## Detailed Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd SpendWise
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install backend and frontend dependencies

```bash
npm run setup
```

This runs the equivalent of:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 4. Start the full project

```bash
npm start
```

This starts:

- Backend on `http://localhost:5050`
- Frontend on `http://localhost:3000`

### 5. Open the app

If you are on macOS:

```bash
open http://localhost:3000
open http://localhost:5050/health
```

If you do not want to use `open`, paste these into your browser:

```text
http://localhost:3000
http://localhost:5050/health
```

## Fastest Judge Flow

Use this exact sequence:

```bash
git clone <repo-url>
cd SpendWise
npm install
npm run setup
npm start
```

Then use this demo account:

```text
Email: demo@spendwise.app
Password: demo123
```

## Manual Run Options

### Run backend only

```bash
cd SpendWise
npm install --prefix backend
npm start --prefix backend
```

### Run frontend only

```bash
cd SpendWise
npm install --prefix frontend
npm start --prefix frontend
```

### Run backend and frontend in two terminals

Terminal 1:

```bash
cd SpendWise
npm install --prefix backend
npm start --prefix backend
```

Terminal 2:

```bash
cd SpendWise
npm install --prefix frontend
npm start --prefix frontend
```

## Environment Setup

The project already includes a working local backend env file:

```bash
backend/.env
```

If you want to recreate it:

```bash
cp backend/.env.example backend/.env
```

Use these values:

```env
PORT=5050
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

If you want real OpenAI responses, set:

```env
OPENAI_API_KEY=your_key_here
```

## Chatbot Setup

The AI finance assistant uses the backend `/chat` endpoint and reads:

- the user message
- recent transactions
- savings totals
- goal progress
- rule-based pre-analysis

To enable GPT responses, set these backend environment variables:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
```

If no key is present, the chatbot still works in deterministic fallback mode for demos.

## Features

- Signup/login with in-memory token-based mock auth
- Add and fetch transactions
- Smart savings engine with fixed monthly saving
- Round-off auto-saving
- Rule-based saving when spending crosses a threshold
- Daily limit tracking with 80% and over-limit alerts
- Goal-based savings tracking
- AI chatbot insights via `/api/ai-insights`
- AI finance chatbot via `/chat`
- Weekly social leaderboard with mock friends
- Dashboard API for spending, savings, goals, and leaderboard

## Tech Stack

- Backend: Node.js, Express
- Frontend: React, react-scripts
- Tooling: concurrently, nodemon

## Project Structure

```text
SpendWise/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   ├── public/
│   ├── package.json
│   └── .gitignore
├── package.json
└── README.md
```

## Demo Flow

1. Start the app with `npm start`.
2. Open the frontend at `http://localhost:3000`.
3. Log in with `demo@spendwise.app` / `demo123`, or create a new local account.
4. Review dashboard stats, goals, leaderboard, and AI insights.
5. Explore the tabs for overview, transactions, savings, goals, and social leaderboard.

## API Endpoints
=======
## Project Structure

```text
SpendWise/
├── backend/
├── frontend/
├── package.json
└── README.md
```

## 🚀 Quick Start

```bash
git clone <repo-url>
cd SpendWise
npm install
npm run setup
npm start
```

- Backend: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:3000](http://localhost:3000)

The backend ships with demo-ready mock data and works without any database setup. OpenAI is optional; if no API key is provided, SpendWise returns deterministic fallback insights.

## Demo Credentials

- Email: `demo@spendwise.app`
- Password: `demo123`

## Features

- JWT-based mock auth for signup, login, and profile retrieval
- Transaction tracking with category tagging and daily limit alerts
- Smart savings engine with fixed monthly, round-off, and rule-based savings
- Goal-based savings creation and contribution tracking
- AI insights endpoint at `/api/ai-insights`
- Weekly social leaderboard powered by mock friend data
- Unified dashboard API for balances, savings, goals, and leaderboard
- Hackathon-friendly in-memory demo store with no database dependency

## Tech Stack

- Backend: Node.js, Express, JWT, OpenAI SDK
- Frontend: React, React Context, react-scripts
- Tooling: concurrently, nodemon

## Demo Flow

1. Start the app with `npm start`.
2. Open the frontend and log in with the demo credentials.
3. Review savings stats, goals, leaderboard, and AI insights on the dashboard.
4. Add a new transaction to trigger round-off savings and limit alerts.
5. Use the backend APIs directly if you want to test routes in Postman or curl.

## API Snapshot
>>>>>>> 1bff132 (what you changed)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
<<<<<<< HEAD
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/savings/settings`
- `POST /api/savings/fixed-monthly`
- `POST /api/savings/manual`
- `GET /api/savings/summary`
=======
- `GET /api/dashboard`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/savings/summary`
- `POST /api/savings/fixed-monthly`
>>>>>>> 1bff132 (what you changed)
- `POST /api/goals`
- `GET /api/goals`
- `POST /api/goals/:goalId/contribute`
- `GET /api/leaderboard/weekly`
<<<<<<< HEAD
- `GET /api/dashboard`
- `POST /api/ai-insights`
- `POST /chat`
=======
- `POST /api/ai-insights`

## Environment

Use [backend/.env.example](/Users/shoaibadil/Downloads/SpendWise/backend/.env.example) as a reference.

The included [backend/.env](/Users/shoaibadil/Downloads/SpendWise/backend/.env) works out of the box for local demo use.
>>>>>>> 1bff132 (what you changed)
