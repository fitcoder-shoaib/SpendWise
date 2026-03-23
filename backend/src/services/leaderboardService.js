function buildWeeklyLeaderboard(currentUser, friends = [], savingsLedger = []) {
  return [
    {
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      weeklySavings: currentUser.weeklySavings,
      streak: savingsLedger.length
    },
    ...friends
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
