const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const savingsRoutes = require("./routes/savings");
const goalRoutes = require("./routes/goals");
const aiRoutes = require("./routes/ai");
const leaderboardRoutes = require("./routes/leaderboard");
const dashboardRoutes = require("./routes/dashboard");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart Spending + Auto-Saving FinTech API is healthy."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai-insights", aiRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

module.exports = app;
