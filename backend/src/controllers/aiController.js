const { getTransactions } = require("../services/dataStore");
const { getAIInsights } = require("../services/aiService");

async function getInsights(req, res, next) {
  try {
    const transactions = getTransactions()
      .filter((transaction) => transaction.userId === req.user.id)
      .sort((left, right) => new Date(right.date) - new Date(left.date));

    const insights = await getAIInsights(transactions);

    res.json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInsights
};
