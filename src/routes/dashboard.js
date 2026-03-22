const express = require("express");

const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const { buildWeeklyLeaderboard } = require("../services/leaderboardService");
const { getDailyExpenseTotal, computeDailyLimitStatus } = require("../services/savingsEngine");

const router = express.Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).lean();
    const goals = await Goal.find({ user: req.user._id }).lean();
    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const totalBalance = totalIncome - totalExpense - req.user.totalSavings;
    const totalSpentToday = await getDailyExpenseTotal(req.user._id, new Date());
    const dailyStatus = computeDailyLimitStatus(
      totalSpentToday,
      req.user.savingsSettings.dailySpendingLimit
    );
    const leaderboard = await buildWeeklyLeaderboard(req.user, {
      showPercentage: req.user.savingsSettings.leaderboardShowPercentage
    });

    res.json({
      success: true,
      dashboard: {
        totalBalance,
        totalSavings: req.user.totalSavings,
        dailySpendingStatus: dailyStatus,
        goalProgress: goals.map((goal) => ({
          id: goal._id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          progressPercentage: Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)),
          deadline: goal.deadline
        })),
        leaderboard,
        weeklyFinancialScore: req.user.weeklyFinancialScore,
        badges: req.user.badges
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
