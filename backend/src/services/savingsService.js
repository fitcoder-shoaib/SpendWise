const { isSameDay } = require("../utils/date");

function getNextRoundNumber(amount) {
  return Math.ceil(Number(amount) / 100) * 100;
}

function calculateRoundOffSaving(amount) {
  return Math.max(0, getNextRoundNumber(amount) - Number(amount));
}

function getDailyExpenseTotal(transactions, targetDate) {
  return transactions
    .filter((transaction) => transaction.type === "expense")
    .filter((transaction) => isSameDay(transaction.date, targetDate))
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

function computeDailyLimitStatus(totalSpent, dailyLimit) {
  const usagePercentage = dailyLimit > 0 ? Math.round((totalSpent / dailyLimit) * 100) : 0;
  const alert =
    usagePercentage >= 100 ? "over-limit" : usagePercentage >= 80 ? "warning-80-percent" : "safe";

  return {
    totalSpent,
    dailyLimit,
    usagePercentage,
    alert
  };
}

function buildAutoSavingsEntries(user, transaction, dailyExpenseTotal) {
  const entries = [];

  if (transaction.type === "expense" && user.savingsSettings.autoRoundOff) {
    const roundOffAmount = calculateRoundOffSaving(transaction.amount);
    if (roundOffAmount > 0) {
      entries.push({
        source: "round-off",
        amount: roundOffAmount,
        date: transaction.date,
        note: `Rounded ${transaction.amount} up to ${getNextRoundNumber(transaction.amount)}`
      });
    }
  }

  if (
    transaction.type === "expense" &&
    dailyExpenseTotal >= Number(user.savingsSettings.dailyAutoSaveThreshold || 0) &&
    Number(user.savingsSettings.dailyAutoSaveAmount || 0) > 0
  ) {
    entries.push({
      source: "rule-based",
      amount: Number(user.savingsSettings.dailyAutoSaveAmount || 0),
      date: transaction.date,
      note: "Rule-based savings triggered after crossing the daily threshold"
    });
  }

  return entries;
}

function buildFixedMonthlySaving(user, overrideAmount) {
  const amount = Number(overrideAmount || user.savingsSettings.fixedMonthlySavings || 0);
  if (!amount) {
    return null;
  }

  return {
    source: "fixed-monthly",
    amount,
    note: "Monthly savings triggered from SpendWise",
    date: new Date().toISOString()
  };
}

module.exports = {
  buildAutoSavingsEntries,
  buildFixedMonthlySaving,
  computeDailyLimitStatus,
  getDailyExpenseTotal
};
