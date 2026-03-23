const { buildWeeklyLeaderboard } = require("./leaderboardService");
const { getDailyExpenseTotal, computeDailyLimitStatus } = require("./savingsService");

function getDashboard({ user, transactions, goals, friends, savingsLedger }) {
  const totalSpending = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const todayExpense = getDailyExpenseTotal(transactions, new Date().toISOString());

  return {
    totalIncome,
    totalSpending,
    totalSavings: user.totalSavings,
    weeklySavings: user.weeklySavings,
    availableBalance: totalIncome - totalSpending - user.totalSavings,
    dailyStatus: computeDailyLimitStatus(todayExpense, user.savingsSettings.dailySpendingLimit),
    savingsSettings: user.savingsSettings,
    goals: goals
      .slice()
      .sort((left, right) => new Date(left.deadline) - new Date(right.deadline))
      .map((goal) => ({
        ...goal,
        progressPercentage: goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
      })),
    leaderboard: buildWeeklyLeaderboard(user, friends, savingsLedger)
  };
}

module.exports = {
  getDashboard
};
