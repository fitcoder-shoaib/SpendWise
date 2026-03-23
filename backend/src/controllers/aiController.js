const { listTransactionsByUser } = require("../services/dataStore");
const { getAIInsights } = require("../services/aiService");

async function getInsights(req, res, next) {
  try {
    const transactions = await listTransactionsByUser(req.user.id);
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
