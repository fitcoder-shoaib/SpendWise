const User = require("../models/User");
const { startOfWeek, endOfWeek } = require("../utils/date");

function sumSavingsForRange(ledger, fromDate, toDate) {
  return ledger
    .filter((entry) => {
      const date = new Date(entry.date);
      return date >= fromDate && date <= toDate;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);
}

async function buildWeeklyLeaderboard(currentUser, { showPercentage }) {
  const friendIds = currentUser.friends.map((item) => item.friend);
  const users = await User.find({ _id: { $in: [currentUser._id, ...friendIds] } })
    .select("name totalSavings savingsLedger weeklyFinancialScore")
    .lean();

  const currentWeekStart = startOfWeek(new Date());
  const currentWeekEnd = endOfWeek(new Date());

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(currentWeekEnd);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

  const rows = users.map((user) => {
    const weekSavings = sumSavingsForRange(user.savingsLedger || [], currentWeekStart, currentWeekEnd);
    const previousWeekSavings = sumSavingsForRange(
      user.savingsLedger || [],
      previousWeekStart,
      previousWeekEnd
    );
    const improvement = weekSavings - previousWeekSavings;

    return {
      userId: user._id,
      name: user.name,
      weekSavings,
      previousWeekSavings,
      improvement,
      weeklyFinancialScore: user.weeklyFinancialScore || 0
    };
  });

  const ranked = rows
    .sort((a, b) => {
      if (b.weekSavings !== a.weekSavings) {
        return b.weekSavings - a.weekSavings;
      }
      return b.improvement - a.improvement;
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      displaySavings: showPercentage
        ? `${Math.min(100, Math.round((row.weekSavings / Math.max(row.weekSavings + 500, 1)) * 100))}%`
        : row.weekSavings
    }));

  const topSaver = ranked[0]?.name || null;
  const mostImproved =
    [...ranked].sort((a, b) => b.improvement - a.improvement)[0]?.name || null;

  return {
    topSaver,
    mostImproved,
    leaderboard: ranked
  };
}

module.exports = {
  buildWeeklyLeaderboard
};
