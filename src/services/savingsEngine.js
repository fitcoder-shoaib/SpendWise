const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");
const { startOfDay, endOfDay } = require("../utils/date");

function getNextRoundNumber(amount) {
  return Math.ceil(amount / 100) * 100;
}

function calculateRoundOffSaving(amount) {
  const roundedAmount = getNextRoundNumber(amount);
  return Math.max(0, roundedAmount - amount);
}

async function getDailyExpenseTotal(userId, date = new Date()) {
  const totals = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "expense",
        date: { $gte: startOfDay(date), $lte: endOfDay(date) }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

  return totals[0]?.total || 0;
}

async function allocateSavingsToGoal(user, amount) {
  const activeGoal = await Goal.findOne({
    user: user._id,
    linkedAutoSave: true,
    deadline: { $gte: new Date() },
    $expr: { $lt: ["$currentAmount", "$targetAmount"] }
  }).sort({ deadline: 1 });

  if (!activeGoal) {
    return null;
  }

  activeGoal.currentAmount = Math.min(activeGoal.targetAmount, activeGoal.currentAmount + amount);
  await activeGoal.save();

  return activeGoal;
}

function computeDailyLimitStatus(totalSpent, dailyLimit) {
  const usagePercentage = dailyLimit > 0 ? Math.round((totalSpent / dailyLimit) * 100) : 0;
  let alert = "safe";

  if (usagePercentage >= 100) {
    alert = "limit-exceeded";
  } else if (usagePercentage >= 80) {
    alert = "warning-80-percent";
  }

  return {
    totalSpent,
    dailyLimit,
    usagePercentage,
    alert
  };
}

function recalculateBadgesAndScore(user) {
  const totalSavings = user.totalSavings || 0;
  const savingsDays = new Set(
    user.savingsLedger.map((entry) => new Date(entry.date).toISOString().slice(0, 10))
  );

  const badges = [];
  if (totalSavings >= 1000) {
    badges.push({ key: "starter-saver", label: "Starter Saver" });
  }
  if (totalSavings >= 5000) {
    badges.push({ key: "saving-machine", label: "Saving Machine" });
  }
  if (savingsDays.size >= 5) {
    badges.push({ key: "consistent-week", label: "Consistent Week" });
  }

  user.badges = badges;
  user.savingsStreak = savingsDays.size;

  const score = Math.max(
    0,
    Math.min(
      100,
      45 + Math.round(totalSavings / 150) + user.savingsStreak * 3
    )
  );

  user.weeklyFinancialScore = score;
}

async function addSavingsEntry(
  user,
  { source, amount, date = new Date(), note = "", targetGoal = null, skipGoalAllocation = false }
) {
  if (!amount || amount <= 0) {
    return null;
  }

  let goal = targetGoal;
  if (!skipGoalAllocation && !goal) {
    goal = await allocateSavingsToGoal(user, amount);
  }

  user.savingsLedger.push({
    source,
    amount,
    date,
    note,
    goal: goal?._id || null
  });
  user.totalSavings += amount;
  recalculateBadgesAndScore(user);
  await user.save();

  return {
    amount,
    source,
    goal
  };
}

async function applySavingsRulesForTransaction(user, transaction) {
  const createdEntries = [];

  if (transaction.type === "expense" && user.savingsSettings.autoRoundOff) {
    const roundOffAmount = calculateRoundOffSaving(transaction.amount);
    if (roundOffAmount > 0) {
      const roundOffEntry = await addSavingsEntry(user, {
        source: "round-off",
        amount: roundOffAmount,
        date: transaction.date,
        note: `Rounded ${transaction.amount} to ${getNextRoundNumber(transaction.amount)}`
      });
      if (roundOffEntry) {
        createdEntries.push(roundOffEntry);
      }
    }
  }

  if (transaction.type === "expense") {
    const dailySpent = await getDailyExpenseTotal(user._id, transaction.date);
    if (dailySpent > user.savingsSettings.dailyAutoSaveThreshold) {
      const ruleEntry = await addSavingsEntry(user, {
        source: "rule-based",
        amount: user.savingsSettings.dailyAutoSaveAmount,
        date: transaction.date,
        note: `Daily spending exceeded ${user.savingsSettings.dailyAutoSaveThreshold}`
      });
      if (ruleEntry) {
        createdEntries.push(ruleEntry);
      }
    }
  }

  return createdEntries;
}

async function applyFixedMonthlySaving(user, amountOverride) {
  const amount = amountOverride ?? user.savingsSettings.fixedMonthlySavings;
  return addSavingsEntry(user, {
    source: "fixed-monthly",
    amount,
    note: "Manual monthly savings trigger"
  });
}

module.exports = {
  calculateRoundOffSaving,
  getDailyExpenseTotal,
  computeDailyLimitStatus,
  applySavingsRulesForTransaction,
  applyFixedMonthlySaving,
  addSavingsEntry
};
