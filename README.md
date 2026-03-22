# Smart Spending + Auto-Saving FinTech App MVP

Production-ready backend MVP for a hackathon-friendly fintech app with smart savings automation, AI spending insights, daily spending controls, goal tracking, and a social leaderboard.

## Backend Architecture

```text
src/
  app.js
  server.js
  config/
    db.js
  middleware/
    auth.js
    errorHandler.js
  models/
    User.js
    Transaction.js
    Goal.js
  routes/
    auth.js
    transactions.js
    savings.js
    goals.js
    ai.js
    leaderboard.js
    dashboard.js
  services/
    savingsEngine.js
    aiService.js
    leaderboardService.js
  utils/
    categoryRules.js
    date.js
  data/
    mockData.js
  scripts/
    seedMockData.js
```

## Database Schema

### User

- `name`: string
- `email`: unique string
- `password`: hashed string
- `savingsGoalsSummary`: string
- `savingsSettings.fixedMonthlySavings`: number
- `savingsSettings.dailySpendingLimit`: number
- `savingsSettings.autoRoundOff`: boolean
- `savingsSettings.dailyAutoSaveThreshold`: number
- `savingsSettings.dailyAutoSaveAmount`: number
- `savingsSettings.leaderboardShowPercentage`: boolean
- `savingsLedger[]`: `{ source, amount, date, goal, note }`
- `totalSavings`: number
- `weeklyFinancialScore`: number
- `savingsStreak`: number
- `badges[]`: `{ key, label, unlockedAt }`
- `friends[]`: `{ friend, alias }`

### Transaction

- `user`: ObjectId
- `amount`: number
- `category`: string
- `description`: string
- `date`: Date
- `type`: `expense | income`
- `autoCategorized`: boolean

### Goal

- `user`: ObjectId
- `name`: string
- `targetAmount`: number
- `currentAmount`: number
- `deadline`: Date
- `linkedAutoSave`: boolean
- `notes`: string

## Core API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Transactions

- `POST /api/transactions`
- `GET /api/transactions`

### Savings

- `PUT /api/savings/settings`
- `POST /api/savings/fixed-monthly`
- `POST /api/savings/manual`
- `GET /api/savings/summary`

### Goals

- `POST /api/goals`
- `GET /api/goals`
- `POST /api/goals/:goalId/contribute`

### AI

- `POST /api/ai-insights`

### Social + Dashboard

- `POST /api/leaderboard/friends`
- `GET /api/leaderboard/weekly`
- `GET /api/dashboard`

## Smart Logic Included

- Rule-based transaction auto-categorization from description keywords
- Round-off savings: `487 -> 500`, auto-save `13`
- Daily rule-based savings: if daily spending exceeds the configured threshold, auto-save the configured amount
- Daily spend alerts:
  - `warning-80-percent`
  - `limit-exceeded`
- Goal-linked savings allocation to the nearest active goal
- Weekly leaderboard with `Top Saver` and `Most Improved`
- Bonus gamification:
  - `weeklyFinancialScore`
  - savings streaks
  - badges
- OpenAI-powered AI insights route with local fallback when `OPENAI_API_KEY` is missing

## Sample Requests

### Signup

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aisha",
    "email": "aisha@example.com",
    "password": "Password123!",
    "savingsGoalsSummary": "Emergency fund",
    "savingsSettings": {
      "fixedMonthlySavings": 3000,
      "dailySpendingLimit": 1500
    }
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aisha@example.com",
    "password": "Password123!"
  }'
```

### Add Transaction

```bash
curl -X POST http://localhost:4000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "amount": 487,
    "description": "Zomato dinner order",
    "date": "2026-03-22T19:30:00.000Z",
    "type": "expense"
  }'
```

### Update Savings Settings

```bash
curl -X PUT http://localhost:4000/api/savings/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "fixedMonthlySavings": 3500,
    "dailySpendingLimit": 2000,
    "dailyAutoSaveThreshold": 1000,
    "dailyAutoSaveAmount": 100
  }'
```

### Create Goal

```bash
curl -X POST http://localhost:4000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "name": "New Phone",
    "targetAmount": 60000,
    "deadline": "2026-10-01"
  }'
```

### AI Insights

```bash
curl -X POST http://localhost:4000/api/ai-insights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{}'
```

### Weekly Leaderboard

```bash
curl -X GET "http://localhost:4000/api/leaderboard/weekly?showPercentage=true" \
  -H "Authorization: Bearer <JWT>"
```

### Dashboard

```bash
curl -X GET http://localhost:4000/api/dashboard \
  -H "Authorization: Bearer <JWT>"
```

## Run Locally

```bash
npm install
cp .env.example .env
npm run seed
npm run dev
```

## Notes

- This MVP uses MongoDB + Mongoose for a clean hackathon backend.
- The AI route works in demo mode without an OpenAI key by returning deterministic local insights.
- If you add `OPENAI_API_KEY`, the `/api/ai-insights` endpoint will call the OpenAI API.
