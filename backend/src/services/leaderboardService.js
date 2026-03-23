const { getFriends } = require("./dataStore");

function buildWeeklyLeaderboard(currentUser) {
  return [
    {
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      weeklySavings: currentUser.weeklySavings,
      streak: currentUser.savingsLedger.length
    },
    ...getFriends()
  ]
    .sort((left, right) => right.weeklySavings - left.weeklySavings)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));
}

module.exports = {
  buildWeeklyLeaderboard
};
