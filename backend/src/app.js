require("./config/env");

const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const savingsRoutes = require("./routes/savings");
const goalsRoutes = require("./routes/goals");
const aiRoutes = require("./routes/ai");
const leaderboardRoutes = require("./routes/leaderboard");
const dashboardRoutes = require("./routes/dashboard");
const errorHandler = require("./middleware/errorHandler");
const auth = require("./middleware/auth");
const dataStore = require("./services/dataStore");
const { createChatRouter } = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "SpendWise backend is running.",
    storage: dataStore.getStorageMode(),
    backend: `http://localhost:${env.port}`,
    frontend: "http://localhost:3000"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/ai-insights", aiRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/dashboard", dashboardRoutes);

const chatRouter = createChatRouter({
  requireAuth: auth,
  getUserTransactions: dataStore.listTransactionsByUser,
  getUserGoals: dataStore.listGoalsByUser,
  openAiApiKey: env.openAiApiKey,
  openAiModel: env.openAiModel
});

app.use("/chat", chatRouter);
app.use("/api/chat", chatRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`SpendWise backend listening on http://localhost:${env.port}`);
});
