const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { createChatRouter } = require("./routes/chat");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = Number(process.env.PORT || 5050);
const sessionStore = new Map();

app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

const store = {
  users: [
    {
      id: "user-demo",
      name: "Demo User",
      email: "demo@spendwise.app",
      password: "demo123",
      savings: 8450,
      weeklySavings: 1320,
      dailyLimit: 2200,
      fixedMonthlySaving: 5000
    }
  ],
  transactions: [
    {
      id: "txn-1",
      userId: "user-demo",
      amount: 1320,
      category: "food",
      type: "expense",
      description: "Weekend dinner with friends",
      date: "2026-03-22T13:15:00.000Z"
    },
    {
      id: "txn-2",
      userId: "user-demo",
      amount: 48000,
      category: "income",
      type: "income",
      description: "Salary credit",
      date: "2026-03-20T05:30:00.000Z"
    },
    {
      id: "txn-3",
      userId: "user-demo",
      amount: 649,
      category: "shopping",
      type: "expense",
      description: "Online essentials order",
      date: "2026-03-21T11:00:00.000Z"
    }
  ],
  goals: [
    {
      id: "goal-1",
      userId: "user-demo",
      name: "Emergency Fund",
      targetAmount: 50000,
      currentAmount: 18000,
      deadline: "2026-08-31"
    },
    {
      id: "goal-2",
      userId: "user-demo",
      name: "Bali Trip",
      targetAmount: 35000,
      currentAmount: 9000,
      deadline: "2026-10-15"
    }
  ],
  leaderboard: [
    { id: "user-neha", name: "Neha", weeklySavings: 2100 },
    { id: "user-aisha", name: "Aisha", weeklySavings: 1800 },
    { id: "user-demo", name: "Demo User", weeklySavings: 1320 },
    { id: "user-rahul", name: "Rahul", weeklySavings: 1250 }
  ]
};

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function createToken(userId) {
  const token = `${userId}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  sessionStore.set(token, userId);
  return token;
}

function findUserById(userId) {
  return store.users.find((user) => user.id === userId) || null;
}

function findUserByEmail(email) {
  return store.users.find((user) => user.email === String(email || "").trim().toLowerCase()) || null;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    weeklySavings: user.weeklySavings,
    savings: user.savings,
    savingsSettings: {
      dailyLimit: user.dailyLimit,
      fixedMonthlySaving: user.fixedMonthlySaving
    }
  };
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    message
  });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const userId = sessionStore.get(token);
  const user = findUserById(userId);

  if (!token || !userId || !user) {
    return sendError(res, 401, "Unauthorized. Please log in again.");
  }

  req.user = user;
  return next();
}

function normalizeDescription(value) {
  return String(value || "").trim().slice(0, 120);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeDateInput(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function inferCategory(type, description, providedCategory) {
  if (providedCategory) {
    return String(providedCategory).trim().toLowerCase();
  }

  const normalized = description.toLowerCase();

  if (type === "income") {
    return "income";
  }
  if (normalized.includes("food") || normalized.includes("dinner") || normalized.includes("lunch")) {
    return "food";
  }
  if (normalized.includes("uber") || normalized.includes("cab") || normalized.includes("metro")) {
    return "transport";
  }
  if (normalized.includes("amazon") || normalized.includes("shopping") || normalized.includes("order")) {
    return "shopping";
  }

  return "misc";
}

function parsePositiveAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

function getExpenseTotal(userId) {
  return store.transactions
    .filter((item) => item.userId === userId)
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);
}

function getIncomeTotal(userId) {
  return store.transactions
    .filter((item) => item.userId === userId)
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
}

function getTodaySpending(userId) {
  const today = new Date().toISOString().slice(0, 10);

  return store.transactions
    .filter((item) => item.userId === userId)
    .filter((item) => item.type === "expense")
    .filter((item) => String(item.date).slice(0, 10) === today)
    .reduce((sum, item) => sum + Number(item.amount), 0);
}

function getDailyStatus(user) {
  const totalSpent = getTodaySpending(user.id);
  const usagePercentage =
    user.dailyLimit > 0 ? Math.round((totalSpent / user.dailyLimit) * 100) : 0;

  return {
    totalSpent,
    dailyLimit: user.dailyLimit,
    usagePercentage,
    alert: usagePercentage >= 100 ? "over-limit" : usagePercentage >= 80 ? "warning-80-percent" : "safe"
  };
}

function getInsights(userId) {
  const expenseTotalsByCategory = store.transactions
    .filter((item) => item.userId === userId)
    .filter((item) => item.type === "expense")
    .reduce((accumulator, item) => {
      accumulator[item.category] = (accumulator[item.category] || 0) + Number(item.amount);
      return accumulator;
    }, {});

  const spendingPatterns = Object.entries(expenseTotalsByCategory)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([category, amount]) => ({ category, amount }));

  return {
    source: process.env.OPENAI_API_KEY ? "demo-openai-ready" : "fallback",
    summary:
      spendingPatterns[0]
        ? `${spendingPatterns[0].category} is your top spend category this week.`
        : "Track a few more expenses to unlock richer insights.",
    spendingPatterns,
    suggestions: [
      "Cut food delivery spending by 10% this week and redirect the difference into auto-save.",
      "Keep round-off savings turned on for every expense transaction.",
      "If you stay under your daily cap for 5 days, move the surplus into your top savings goal."
    ]
  };
}

function getWeeklyLeaderboard(user) {
  const baseEntries = store.leaderboard.some((entry) => entry.id === user.id)
    ? store.leaderboard
    : [
        ...store.leaderboard,
        {
          id: user.id,
          name: user.name,
          weeklySavings: user.weeklySavings
        }
      ];

  return baseEntries
    .map((entry) => ({
      ...entry,
      weeklySavings: entry.id === user.id ? user.weeklySavings : entry.weeklySavings
    }))
    .sort((left, right) => right.weeklySavings - left.weeklySavings)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));
}

function getUserTransactions(userId) {
  return store.transactions.filter((item) => item.userId === userId);
}

function getUserGoals(userId) {
  return store.goals.filter((goal) => goal.userId === userId);
}

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SpendWise backend is running.",
    backend: `http://localhost:${PORT}`,
    frontend: "http://localhost:3000"
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email);

  if (!isValidEmail(email) || !password) {
    return sendError(res, 400, "A valid email and password are required.");
  }

  if (!user || password !== user.password) {
    return sendError(res, 401, "Invalid credentials.");
  }

  return res.json({
    success: true,
    token: createToken(user.id),
    user: sanitizeUser(user)
  });
});

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!name || !email || !password) {
    return sendError(res, 400, "Name, email, and password are required.");
  }
  if (!isValidEmail(normalizedEmail)) {
    return sendError(res, 400, "Please provide a valid email address.");
  }
  if (String(password).length < 6) {
    return sendError(res, 400, "Password must be at least 6 characters long.");
  }

  if (findUserByEmail(normalizedEmail)) {
    return sendError(res, 409, "An account with this email already exists.");
  }

  const user = {
    id: createId("user"),
    name: String(name).trim().slice(0, 80),
    email: normalizedEmail.slice(0, 120),
    password: String(password).slice(0, 80),
    savings: 0,
    weeklySavings: 0,
    dailyLimit: 2000,
    fixedMonthlySaving: 3000
  };

  store.users.push(user);

  return res.status(201).json({
    success: true,
    token: createToken(user.id),
    user: sanitizeUser(user)
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
});

app.get("/api/transactions", requireAuth, (req, res) => {
  res.json({
    success: true,
    transactions: store.transactions
      .filter((item) => item.userId === req.user.id)
      .sort((left, right) => new Date(right.date) - new Date(left.date))
  });
});

app.post("/api/transactions", requireAuth, (req, res) => {
  const amount = parsePositiveAmount(req.body?.amount);
  const type = req.body?.type === "income" ? "income" : "expense";
  const description = normalizeDescription(req.body?.description || "New transaction");

  if (!amount) {
    return sendError(res, 400, "Amount must be a valid positive number.");
  }

  const transaction = {
    id: createId("txn"),
    userId: req.user.id,
    amount,
    category: inferCategory(type, description, req.body?.category),
    type,
    description,
    date: normalizeDateInput(req.body?.date || new Date().toISOString()) || new Date().toISOString()
  };

  store.transactions.unshift(transaction);

  if (transaction.type === "expense") {
    const roundOff = Math.ceil(transaction.amount / 100) * 100 - transaction.amount;
    if (roundOff > 0) {
      req.user.savings += roundOff;
      req.user.weeklySavings += roundOff;
    }
  }

  res.status(201).json({
    success: true,
    transaction,
    dailyStatus: getDailyStatus(req.user)
  });
});

app.get("/api/savings/summary", requireAuth, (req, res) => {
  res.json({
    success: true,
    totalSavings: req.user.savings,
    weeklySavings: req.user.weeklySavings,
    savingsSettings: {
      dailyLimit: req.user.dailyLimit,
      fixedMonthlySaving: req.user.fixedMonthlySaving
    },
    dailyStatus: getDailyStatus(req.user)
  });
});

app.put("/api/savings/settings", requireAuth, (req, res) => {
  const dailyLimit = parsePositiveAmount(req.body?.dailyLimit || req.body?.dailySpendingLimit);
  const fixedMonthlySaving = parsePositiveAmount(
    req.body?.fixedMonthlySaving || req.body?.fixedMonthlySavings
  );

  if (dailyLimit) {
    req.user.dailyLimit = dailyLimit;
  }
  if (fixedMonthlySaving) {
    req.user.fixedMonthlySaving = fixedMonthlySaving;
  }

  return res.json({
    success: true,
    savingsSettings: {
      dailyLimit: req.user.dailyLimit,
      fixedMonthlySaving: req.user.fixedMonthlySaving
    }
  });
});

app.post("/api/savings/fixed-monthly", requireAuth, (req, res) => {
  const amount = parsePositiveAmount(req.body?.amount || req.user.fixedMonthlySaving);

  if (!amount) {
    return sendError(res, 400, "Amount must be a valid positive number.");
  }

  req.user.savings += amount;
  req.user.weeklySavings += amount;

  res.status(201).json({
    success: true,
    entry: {
      source: "fixed-monthly",
      amount
    }
  });
});

app.post("/api/savings/manual", requireAuth, (req, res) => {
  const amount = parsePositiveAmount(req.body?.amount);

  if (!amount) {
    return sendError(res, 400, "Amount must be a valid positive number.");
  }

  req.user.savings += amount;
  req.user.weeklySavings += amount;

  return res.status(201).json({
    success: true,
    entry: {
      source: "manual",
      amount,
      note: normalizeDescription(req.body?.note || "Manual savings top-up")
    }
  });
});

app.get("/api/goals", requireAuth, (req, res) => {
  res.json({
    success: true,
    goals: store.goals
      .filter((goal) => goal.userId === req.user.id)
      .sort((left, right) => new Date(left.deadline) - new Date(right.deadline))
  });
});

app.post("/api/goals", requireAuth, (req, res) => {
  const targetAmount = parsePositiveAmount(req.body?.targetAmount);

  if (!req.body?.name || !targetAmount || !req.body?.deadline) {
    return sendError(res, 400, "Name, target amount, and deadline are required.");
  }

  const normalizedDeadline = normalizeDateInput(req.body.deadline);
  if (!normalizedDeadline) {
    return sendError(res, 400, "Deadline must be a valid date.");
  }

  const goal = {
    id: createId("goal"),
    userId: req.user.id,
    name: String(req.body.name).trim().slice(0, 80),
    targetAmount,
    currentAmount: 0,
    deadline: normalizedDeadline.slice(0, 10)
  };

  store.goals.push(goal);
  res.status(201).json({ success: true, goal });
});

app.post("/api/goals/:goalId/contribute", requireAuth, (req, res) => {
  const goal = store.goals.find((item) => item.id === req.params.goalId && item.userId === req.user.id);
  const amount = parsePositiveAmount(req.body?.amount);

  if (!goal) {
    return sendError(res, 404, "Goal not found.");
  }
  if (!amount) {
    return sendError(res, 400, "Amount must be a valid positive number.");
  }

  goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
  req.user.savings += amount;
  req.user.weeklySavings += amount;

  return res.json({ success: true, goal });
});

app.get("/api/leaderboard/weekly", requireAuth, (req, res) => {
  res.json({ success: true, leaderboard: getWeeklyLeaderboard(req.user) });
});

app.get("/api/dashboard", requireAuth, (req, res) => {
  const totalIncome = getIncomeTotal(req.user.id);
  const totalSpending = getExpenseTotal(req.user.id);

  res.json({
    success: true,
    dashboard: {
      totalIncome,
      totalSpending,
      totalSavings: req.user.savings,
      weeklySavings: req.user.weeklySavings,
      availableBalance: totalIncome - totalSpending - req.user.savings,
      dailyStatus: getDailyStatus(req.user),
      savingsSettings: {
        dailyLimit: req.user.dailyLimit,
        fixedMonthlySaving: req.user.fixedMonthlySaving
      },
      goals: store.goals
        .filter((goal) => goal.userId === req.user.id)
        .sort((left, right) => new Date(left.deadline) - new Date(right.deadline)),
      leaderboard: getWeeklyLeaderboard(req.user)
    }
  });
});

app.post("/api/ai-insights", requireAuth, (req, res) => {
  res.json({
    success: true,
    insights: getInsights(req.user.id)
  });
});

app.post("/api/ai", requireAuth, (req, res) => {
  res.json({
    success: true,
    insights: getInsights(req.user.id)
  });
});

app.use(
  "/chat",
  createChatRouter({
    requireAuth,
    getUserTransactions,
    getUserGoals,
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiModel: process.env.OPENAI_MODEL
  })
);

app.use(
  "/api/chat",
  createChatRouter({
    requireAuth,
    getUserTransactions,
    getUserGoals,
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiModel: process.env.OPENAI_MODEL
  })
);

app.use((req, res) => {
  sendError(res, 404, "Route not found.");
});

app.listen(PORT, () => {
  console.log(`SpendWise backend running on http://localhost:${PORT}`);
});
