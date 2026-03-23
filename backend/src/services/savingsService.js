const { createId } = require("../utils/id");
const { isSameDay } = require("../utils/date");
const { getTransactions, getGoals } = require("./dataStore");

function getNextRoundNumber(amount) {
  return Math.ceil(amount / 100) * 100;
}

function calculateRoundOffSaving(amount) {
  return Math.max(0, getNextRoundNumber(amount) - amount);
}

function getDailyExpenseTotal(userId, targetDate) {
  return getTransactions()
    .filter((transaction) => transaction.userId === userId)
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

function getPrimaryGoal(userId) {
  return getGoals()
    .filter((goal) => goal.userId === userId)
    .filter((goal) => goal.linkedAutoSave)
    .sort((left, right) => new Date(left.deadline) - new Date(right.deadline))[0];
}

function addSavingsEntry(user, entry) {
  const nextEntry = {
    id: createId("save"),
    date: entry.date || new Date().toISOString(),
    note: "",
    ...entry
  };

  user.savingsLedger.push(nextEntry);
  user.totalSavings += nextEntry.amount;
  user.weeklySavings += nextEntry.amount;

  const linkedGoal = getPrimaryGoal(user.id);
  if (linkedGoal && nextEntry.source !== "manual-goal") {
    linkedGoal.currentAmount = Math.min(linkedGoal.targetAmount, linkedGoal.currentAmount + nextEntry.amount);
  }

  return nextEntry;
}

function applyFixedMonthlySaving(user, amount) {
  const fixedAmount = Number(amount || user.savingsSettings.fixedMonthlySavings || 0);
  if (!fixedAmount) {
    return null;
  }

  return addSavingsEntry(user, {
    source: "fixed-monthly",
    amount: fixedAmount,
    note: "Monthly savings triggered from SpendWise"
  });
}

function applyTransactionSavings(user, transaction) {
  const entries = [];

  if (transaction.type === "expense" && user.savingsSettings.autoRoundOff) {
    const roundOffAmount = calculateRoundOffSaving(Number(transaction.amount));
    if (roundOffAmount > 0) {
      entries.push(
        addSavingsEntry(user, {
          source: "round-off",
          amount: roundOffAmount,
          date: transaction.date,
          note: `Rounded ${transaction.amount} up to ${getNextRoundNumber(transaction.amount)}`
        })
      );
    }
  }

  if (transaction.type === "expense") {
    const dailyTotal = getDailyExpenseTotal(user.id, transaction.date);
    if (dailyTotal >= Number(user.savingsSettings.dailyAutoSaveThreshold || 0)) {
      entries.push(
        addSavingsEntry(user, {
          source: "rule-based",
          amount: Number(user.savingsSettings.dailyAutoSaveAmount || 0),
          date: transaction.date,
          note: "Rule-based savings triggered after crossing the daily threshold"
        })
      );
    }
  }

  return entries.filter(Boolean);
}

module.exports = {
  calculateRoundOffSaving,
  getDailyExpenseTotal,
  computeDailyLimitStatus,
  addSavingsEntry,
  applyFixedMonthlySaving,
  applyTransactionSavings
};
