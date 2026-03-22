const express = require("express");

const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
const { autoCategorizeTransaction } = require("../utils/categoryRules");
const {
  applySavingsRulesForTransaction,
  computeDailyLimitStatus,
  getDailyExpenseTotal
} = require("../services/savingsEngine");

const router = express.Router();

router.post("/", auth, async (req, res, next) => {
  try {
    const { amount, category, date, type, description } = req.body;

    if (!amount || !type || !date) {
      return res.status(400).json({ success: false, message: "Amount, type and date are required." });
    }

    const categorized = autoCategorizeTransaction({ category, description, type });

    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      category: categorized.category,
      autoCategorized: categorized.autoCategorized,
      date,
      type,
      description
    });

    const autoSavings = await applySavingsRulesForTransaction(req.user, transaction);
    const totalSpentToday = await getDailyExpenseTotal(req.user._id, date);
    const dailyStatus = computeDailyLimitStatus(
      totalSpentToday,
      req.user.savingsSettings.dailySpendingLimit
    );

    res.status(201).json({
      success: true,
      transaction,
      autoSavings,
      dailyStatus
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", auth, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
