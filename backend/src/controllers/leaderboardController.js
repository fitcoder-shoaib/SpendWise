const { listFriends, listSavingsEntriesByUser } = require("../services/dataStore");
const { buildWeeklyLeaderboard } = require("../services/leaderboardService");

async function getWeeklyLeaderboard(req, res, next) {
  try {
    const [friends, savingsLedger] = await Promise.all([
      listFriends(),
      listSavingsEntriesByUser(req.user.id)
    ]);

    res.json({
      success: true,
      leaderboard: buildWeeklyLeaderboard(req.user, friends, savingsLedger)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWeeklyLeaderboard
};
