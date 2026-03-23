const { addSavingsEntry, addTransaction, listTransactionsByUser } = require("../services/dataStore");
const { autoCategorizeTransaction } = require("../utils/categoryRules");
const {
  buildAutoSavingsEntries,
  computeDailyLimitStatus,
  getDailyExpenseTotal
} = require("../services/savingsService");

async function listTransactions(req, res, next) {
  try {
    const transactions = await listTransactionsByUser(req.user.id);
    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const { amount, category, type, description = "", date = new Date().toISOString() } = req.body || {};
    const numericAmount = Number(amount);

    if (!numericAmount || !type) {
      return res.status(400).json({ success: false, message: "Amount and type are required." });
    }

    const transaction = await addTransaction({
      userId: req.user.id,
      amount: numericAmount,
      category: autoCategorizeTransaction({ category, description, type }),
      type,
      description: String(description).trim().slice(0, 120),
      date: new Date(date).toISOString()
    });

    const transactions = await listTransactionsByUser(req.user.id);
    const dailySpent = getDailyExpenseTotal(transactions, transaction.date);
    const autoSavingsPayloads = buildAutoSavingsEntries(req.user, transaction, dailySpent);
    const autoSavings = [];

    for (const payload of autoSavingsPayloads) {
      const result = await addSavingsEntry(req.user.id, payload);
      req.user = result.user;
      autoSavings.push(result.entry);
    }

    return res.status(201).json({
      success: true,
      transaction,
      autoSavings,
      dailyStatus: computeDailyLimitStatus(dailySpent, req.user.savingsSettings.dailySpendingLimit)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTransactions,
  createTransaction
};
