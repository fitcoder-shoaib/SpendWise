const {
  addSavingsEntry,
  applyFixedMonthlySaving,
  getDailyExpenseTotal,
  computeDailyLimitStatus
} = require("../services/savingsService");

function updateSettings(req, res) {
  req.user.savingsSettings = {
    ...req.user.savingsSettings,
    ...req.body
  };

  res.json({
    success: true,
    savingsSettings: req.user.savingsSettings
  });
}

function triggerFixedMonthly(req, res) {
  const entry = applyFixedMonthlySaving(req.user, req.body.amount);
  res.status(201).json({ success: true, entry });
}

function addManualSaving(req, res) {
  const { amount, note = "Manual savings top-up" } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required." });
  }

  const entry = addSavingsEntry(req.user, {
    source: "manual",
    amount: Number(amount),
    note
  });

  return res.status(201).json({ success: true, entry });
}

function getSummary(req, res) {
  const dailySpent = getDailyExpenseTotal(req.user.id, new Date().toISOString());

  res.json({
    success: true,
    totalSavings: req.user.totalSavings,
    weeklySavings: req.user.weeklySavings,
    savingsSettings: req.user.savingsSettings,
    savingsLedger: req.user.savingsLedger,
    dailyStatus: computeDailyLimitStatus(dailySpent, req.user.savingsSettings.dailySpendingLimit)
  });
}

module.exports = {
  updateSettings,
  triggerFixedMonthly,
  addManualSaving,
  getSummary
};
