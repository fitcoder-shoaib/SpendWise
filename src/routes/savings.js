const express = require("express");

const auth = require("../middleware/auth");
const {
  applyFixedMonthlySaving,
  computeDailyLimitStatus,
  getDailyExpenseTotal,
  addSavingsEntry
} = require("../services/savingsEngine");

const router = express.Router();

router.put("/settings", auth, async (req, res, next) => {
  try {
    req.user.savingsSettings = {
      ...req.user.savingsSettings.toObject(),
      ...req.body
    };
    await req.user.save();

    res.json({
      success: true,
      savingsSettings: req.user.savingsSettings
    });
  } catch (error) {
    next(error);
  }
});

router.post("/fixed-monthly", auth, async (req, res, next) => {
  try {
    const entry = await applyFixedMonthlySaving(req.user, req.body.amount);
    res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
});

router.post("/manual", auth, async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const entry = await addSavingsEntry(req.user, {
      source: "manual",
      amount,
      note
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
});

router.get("/summary", auth, async (req, res, next) => {
  try {
    const totalSpentToday = await getDailyExpenseTotal(req.user._id, new Date());
    const dailyStatus = computeDailyLimitStatus(
      totalSpentToday,
      req.user.savingsSettings.dailySpendingLimit
    );

    res.json({
      success: true,
      totalSavings: req.user.totalSavings,
      savingsLedger: req.user.savingsLedger,
      savingsSettings: req.user.savingsSettings,
      dailyStatus,
      weeklyFinancialScore: req.user.weeklyFinancialScore,
      badges: req.user.badges,
      savingsStreak: req.user.savingsStreak
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
