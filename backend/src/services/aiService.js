const OpenAI = require("openai");
const env = require("../config/env");

function buildFallbackInsights(transactions = []) {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const income = transactions.filter((transaction) => transaction.type === "income");

  const totalSpending = expenses.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalIncome = income.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const categorySpend = expenses.reduce((accumulator, transaction) => {
    accumulator[transaction.category] = (accumulator[transaction.category] || 0) + Number(transaction.amount);
    return accumulator;
  }, {});

  const spendingPatterns = Object.entries(categorySpend)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([category, amount]) => ({ category, amount }));

  return {
    source: "fallback",
    summary: `You spent ${totalSpending} and saved steadily this week. Keep the savings engine active on daily expenses.`,
    spendingPatterns,
    suggestions: [
      spendingPatterns[0]
        ? `Your largest expense area is ${spendingPatterns[0].category}. Set a mini cap here for the next 7 days.`
        : "Track at least three expenses this week so SpendWise can personalize recommendations.",
      totalIncome > 0 && totalSpending > totalIncome * 0.6
        ? "More than 60% of your visible income is going to expenses. Pause one non-essential category this week."
        : "Your spending pace looks manageable. Push any extra buffer into a goal-linked auto-save.",
      "Round-off savings is the easiest habit win. Keep it enabled for every expense transaction."
    ]
  };
}

async function getAIInsights(transactions = []) {
  if (!env.openAiApiKey) {
    return buildFallbackInsights(transactions);
  }

  try {
    const client = new OpenAI({ apiKey: env.openAiApiKey });
    const prompt = [
      "You are a fintech coach inside SpendWise.",
      "Analyze these transactions and respond with JSON only.",
      "Schema: { summary: string, spendingPatterns: [{ category: string, amount: number }], suggestions: string[] }",
      JSON.stringify(transactions)
    ].join("\n");

    const response = await client.responses.create({
      model: env.openAiModel,
      input: prompt
    });

    return {
      ...JSON.parse(response.output_text),
      source: "openai"
    };
  } catch (error) {
    return buildFallbackInsights(transactions);
  }
}

module.exports = {
  getAIInsights
};
