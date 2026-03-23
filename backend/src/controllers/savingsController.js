const {
  addSavingsEntry,
  listSavingsEntriesByUser,
  listTransactionsByUser,
  updateUserSettings
} = require("../services/dataStore");
const {
  buildFixedMonthlySaving,
  computeDailyLimitStatus,
  getDailyExpenseTotal
} = require("../services/savingsService");

async function updateSettings(req, res, next) {
  try {
    const savingsSettings = {
      fixedMonthlySavings: Number(req.body.fixedMonthlySaving ?? req.body.fixedMonthlySavings ?? req.user.savingsSettings.fixedMonthlySavings),
      dailySpendingLimit: Number(req.body.dailyLimit ?? req.body.dailySpendingLimit ?? req.user.savingsSettings.dailySpendingLimit),
      autoRoundOff: req.body.autoRoundOff ?? req.user.savingsSettings.autoRoundOff,
      dailyAutoSaveThreshold: Number(req.body.dailyAutoSaveThreshold ?? req.user.savingsSettings.dailyAutoSaveThreshold),
      dailyAutoSaveAmount: Number(req.body.dailyAutoSaveAmount ?? req.user.savingsSettings.dailyAutoSaveAmount),
      leaderboardShowPercentage: req.body.leaderboardShowPercentage ?? req.user.savingsSettings.leaderboardShowPercentage
    };

    const updatedUser = await updateUserSettings(req.user.id, savingsSettings);
    req.user = updatedUser;

    res.json({
      success: true,
      savingsSettings: updatedUser.savingsSettings
    });
  } catch (error) {
    next(error);
  }
}

async function triggerFixedMonthly(req, res, next) {
  try {
    const payload = buildFixedMonthlySaving(req.user, req.body?.amount);
    if (!payload) {
      return res.status(400).json({ success: false, message: "No fixed monthly savings amount is configured." });
    }

    const result = await addSavingsEntry(req.user.id, payload);
    req.user = result.user;

    res.status(201).json({ success: true, entry: result.entry });
  } catch (error) {
    next(error);
  }
}

async function addManualSaving(req, res, next) {
  try {
    const { amount, note = "Manual savings top-up" } = req.body || {};
    const numericAmount = Number(amount);

    if (!numericAmount) {
      return res.status(400).json({ success: false, message: "Amount is required." });
    }

    const result = await addSavingsEntry(req.user.id, {
      source: "manual",
      amount: numericAmount,
      note
    });
    req.user = result.user;

    return res.status(201).json({ success: true, entry: result.entry });
  } catch (error) {
    next(error);
  }
}

async function getSummary(req, res, next) {
  try {
    const [transactions, savingsLedger] = await Promise.all([
      listTransactionsByUser(req.user.id),
      listSavingsEntriesByUser(req.user.id)
    ]);
    const dailySpent = getDailyExpenseTotal(transactions, new Date().toISOString());

    res.json({
      success: true,
      totalSavings: req.user.totalSavings,
      weeklySavings: req.user.weeklySavings,
      savingsSettings: req.user.savingsSettings,
      savingsLedger,
      dailyStatus: computeDailyLimitStatus(dailySpent, req.user.savingsSettings.dailySpendingLimit)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateSettings,
  triggerFixedMonthly,
  addManualSaving,
  getSummary
};
