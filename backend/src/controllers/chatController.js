const { sanitizeChatInput } = require("../utils/sanitize");
const { buildFinancialSnapshot } = require("../services/financialSnapshotService");
const { getFinanceAssistantReply } = require("../services/openaiChatService");

function createChatController({ getUserTransactions, getUserGoals, openAiApiKey, openAiModel }) {
  return async function chatController(req, res, next) {
    try {
      const { message, history } = sanitizeChatInput(req.body);

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required."
        });
      }

      const [transactions, goals] = await Promise.all([
        getUserTransactions(req.user.id),
        getUserGoals(req.user.id)
      ]);

      const snapshot = buildFinancialSnapshot({
        user: req.user,
        transactions,
        goals
      });

      const chat = await getFinanceAssistantReply({
        apiKey: openAiApiKey,
        model: openAiModel,
        message,
        history,
        snapshot
      });

      return res.json({
        success: true,
        chat: {
          ...chat,
          financialSummary: snapshot.totals,
          logicInsights: snapshot.flags,
          topCategories: snapshot.topCategories
        }
      });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  createChatController
};
