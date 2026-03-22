const { sanitizeChatInput } = require("../utils/sanitize");
const { buildFinancialSnapshot } = require("../services/financialSnapshotService");
const { getFinanceAssistantReply } = require("../services/openaiChatService");

function createChatController({ getUserTransactions, getUserGoals, openAiApiKey, openAiModel }) {
  return async function chatController(req, res) {
    try {
      const { message, history } = sanitizeChatInput(req.body);

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required."
        });
      }

      const snapshot = buildFinancialSnapshot({
        user: req.user,
        transactions: getUserTransactions(req.user.id),
        goals: getUserGoals(req.user.id)
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
      return res.status(500).json({
        success: false,
        message: "Unable to process chat right now."
      });
    }
  };
}

module.exports = {
  createChatController
};
