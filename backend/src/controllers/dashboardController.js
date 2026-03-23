const {
  listFriends,
  listGoalsByUser,
  listSavingsEntriesByUser,
  listTransactionsByUser
} = require("../services/dataStore");
const { getDashboard } = require("../services/dashboardService");

async function getDashboardSummary(req, res, next) {
  try {
    const [transactions, goals, friends, savingsLedger] = await Promise.all([
      listTransactionsByUser(req.user.id),
      listGoalsByUser(req.user.id),
      listFriends(),
      listSavingsEntriesByUser(req.user.id)
    ]);

    res.json({
      success: true,
      dashboard: getDashboard({
        user: req.user,
        transactions,
        goals,
        friends,
        savingsLedger
      })
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary
};
