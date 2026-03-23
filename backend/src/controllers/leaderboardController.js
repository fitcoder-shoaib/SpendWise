const { buildWeeklyLeaderboard } = require("../services/leaderboardService");

function getWeeklyLeaderboard(req, res) {
  res.json({
    success: true,
    leaderboard: buildWeeklyLeaderboard(req.user)
  });
}

module.exports = {
  getWeeklyLeaderboard
};
