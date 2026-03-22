const express = require("express");

const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const { getAIInsights } = require("../services/aiService");

const router = express.Router();

router.post(["/", "/insights"], auth, async (req, res, next) => {
  try {
    const dbTransactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    const transactions = req.body.transactions?.length ? req.body.transactions : dbTransactions;

    const insights = await getAIInsights(
      transactions.map((transaction) => ({
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
        description: transaction.description
      }))
    );

    res.json({
      success: true,
      promptUsed: "Analyze this user's spending and give actionable financial advice in simple language.",
      insights
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
