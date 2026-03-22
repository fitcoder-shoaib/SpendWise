const OpenAI = require("openai");

function buildFallbackInsights(transactions = []) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const income = transactions.filter((item) => item.type === "income");

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const topCategories = Object.entries(
    expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const suggestions = [];
  if (topCategories[0]) {
    suggestions.push(`Your top expense category is ${topCategories[0][0]}. Try cutting it by 10% this week.`);
  }
  if (totalExpense > totalIncome && totalIncome > 0) {
    suggestions.push("You are spending more than you earn in this snapshot. Pause non-essential spending for a few days.");
  }
  suggestions.push("Use round-off savings on every expense to build a low-friction saving habit.");

  return {
    summary: `You spent ${totalExpense} and earned ${totalIncome} in the shared transaction history.`,
    spendingPatterns: topCategories.map(([category, amount]) => ({
      category,
      amount
    })),
    suggestions,
    source: "fallback"
  };
}

async function getAIInsights(transactions = []) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackInsights(transactions);
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const prompt = [
    "Analyze this user's spending and give actionable financial advice in simple language.",
    "Return JSON with keys: summary, spendingPatterns, suggestions.",
    "Transactions:",
    JSON.stringify(transactions)
  ].join("\n");

  const response = await client.responses.create({
    model,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "financial_insights",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary: { type: "string" },
            spendingPatterns: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  category: { type: "string" },
                  amount: { type: "number" }
                },
                required: ["category", "amount"]
              }
            },
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["summary", "spendingPatterns", "suggestions"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.output_text);
  return {
    ...parsed,
    source: "openai"
  };
}

module.exports = {
  getAIInsights
};
