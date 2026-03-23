const { getTransactions, getGoals } = require("./dataStore");
const { buildWeeklyLeaderboard } = require("./leaderboardService");
const { getDailyExpenseTotal, computeDailyLimitStatus } = require("./savingsService");

function getDashboard(user) {
  const userTransactions = getTransactions().filter((transaction) => transaction.userId === user.id);
  const goals = getGoals().filter((goal) => goal.userId === user.id);

  const totalSpending = userTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalIncome = userTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const todayExpense = getDailyExpenseTotal(user.id, new Date().toISOString());

  return {
    totalIncome,
    totalSpending,
    totalSavings: user.totalSavings,
    availableBalance: totalIncome - totalSpending - user.totalSavings,
    dailyStatus: computeDailyLimitStatus(todayExpense, user.savingsSettings.dailySpendingLimit),
    goals: goals.map((goal) => ({
      ...goal,
      progressPercentage: Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    })),
    leaderboard: buildWeeklyLeaderboard(user)
  };
}

module.exports = {
  getDashboard
};
