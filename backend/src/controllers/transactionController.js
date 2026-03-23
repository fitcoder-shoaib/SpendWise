const { addTransaction, getTransactions } = require("../services/dataStore");
const { autoCategorizeTransaction } = require("../utils/categoryRules");
const {
  applyTransactionSavings,
  getDailyExpenseTotal,
  computeDailyLimitStatus
} = require("../services/savingsService");

function listTransactions(req, res) {
  const transactions = getTransactions()
    .filter((transaction) => transaction.userId === req.user.id)
    .sort((left, right) => new Date(right.date) - new Date(left.date));

  res.json({ success: true, transactions });
}

function createTransaction(req, res) {
  const { amount, category, type, description = "", date = new Date().toISOString() } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ success: false, message: "Amount and type are required." });
  }

  const transaction = addTransaction({
    userId: req.user.id,
    amount: Number(amount),
    category: autoCategorizeTransaction({ category, description, type }),
    type,
    description,
    date
  });

  const autoSavings = applyTransactionSavings(req.user, transaction);
  const dailySpent = getDailyExpenseTotal(req.user.id, transaction.date);

  return res.status(201).json({
    success: true,
    transaction,
    autoSavings,
    dailyStatus: computeDailyLimitStatus(dailySpent, req.user.savingsSettings.dailySpendingLimit)
  });
}

module.exports = {
  listTransactions,
  createTransaction
};
