const OpenAI = require("openai");

function isGreeting(message) {
  return /^(hi|hello|hey|yo|hola|good morning|good afternoon|good evening)\b/i.test(
    String(message || "").trim()
  );
}

function buildGreetingResponse(source) {
  return {
    reply: "Hi! I can help with budgeting, savings, overspending, or goal planning. Ask me a money question and I’ll keep it short and practical.",
    summary: {},
    alerts: [],
    recommendedActions: [],
    followUpPrompts: [],
    focusArea: "general-guidance",
    source
  };
}

function buildFallbackChat({ message, snapshot }) {
  if (isGreeting(message)) {
    return buildGreetingResponse("fallback");
  }

  const topCategory = snapshot.topCategories[0];
  const actions = [];
  const alerts = snapshot.flags.map((flag) => flag.message);
  const focusArea = topCategory ? topCategory.category : "saving-rate";

  if (snapshot.flags.some((flag) => flag.type === "overspending-food")) {
    actions.push("Set a weekly cap for food delivery and shift one meal to home cooking.");
  }
  if (snapshot.flags.some((flag) => flag.type === "low-savings-rate")) {
    actions.push("Raise your savings rate by moving at least 10% of the next income into auto-save.");
  }
  if (topCategory) {
    actions.push(`Watch your ${topCategory.category} category first because it is your biggest expense bucket.`);
  }

  if (!actions.length) {
    actions.push("You are on a decent track. Keep your daily cap active and add one manual savings top-up this week.");
  }

  return {
    reply: `Based on your current finances, focus on ${topCategory ? topCategory.category : "your top spending area"} and protect your savings rate.`,
    summary: {
      totalExpense: snapshot.totals.totalExpense,
      totalIncome: snapshot.totals.totalIncome,
      totalSavings: snapshot.totals.totalSavings
    },
    alerts,
    recommendedActions: actions,
    followUpPrompts: [
      "What category should I cut first this week?",
      "How much should I save from my next income?",
      "Give me a 3-step recovery plan for overspending."
    ],
    focusArea,
    source: "fallback",
    contextMessage: message
  };
}

function buildPrompt({ message, history, snapshot }) {
  // We pass both computed finance signals and the raw user question so GPT can stay personalized.
  return [
    {
      role: "system",
      content: [
        "You are SpendWise, a personal finance assistant.",
        "Keep answers short, practical, personalized, and safe.",
        "If the user sends only a greeting like hi or hello, respond with a short welcome only.",
        "For greetings, do not include alerts, action lists, summaries, or follow-up prompts unless the user asks for advice.",
        "Return valid JSON with keys: reply, summary, alerts, recommendedActions, followUpPrompts, focusArea.",
        "reply must be 2-4 sentences.",
        "summary must be an object with short keys and values.",
        "alerts must be a short string array.",
        "recommendedActions must be a short string array with practical next steps.",
        "followUpPrompts must contain exactly 3 short suggested next questions.",
        "focusArea must be one short phrase."
      ].join(" ")
    },
    ...history.map((item) => ({
      role: item.role,
      content: item.content
    })),
    {
      role: "user",
      content: [
        `User question: ${message}`,
        `Financial snapshot: ${JSON.stringify(snapshot)}`
      ].join("\n")
    }
  ];
}

async function getFinanceAssistantReply({
  apiKey,
  model,
  message,
  history,
  snapshot
}) {
  if (isGreeting(message)) {
    return buildGreetingResponse(apiKey ? "openai" : "fallback");
  }

  if (!apiKey) {
    return buildFallbackChat({ message, snapshot });
  }

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model: model || "gpt-5-mini",
      input: buildPrompt({ message, history, snapshot }),
      text: {
        format: {
          type: "json_schema",
          name: "finance_chat_response",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              reply: { type: "string" },
              summary: {
                type: "object",
                additionalProperties: {
                  type: ["string", "number", "boolean"]
                }
              },
              alerts: {
                type: "array",
                items: { type: "string" }
              },
              recommendedActions: {
                type: "array",
                items: { type: "string" }
              },
              followUpPrompts: {
                type: "array",
                items: { type: "string" }
              },
              focusArea: {
                type: "string"
              }
            },
            required: ["reply", "summary", "alerts", "recommendedActions", "followUpPrompts", "focusArea"]
          }
        }
      }
    });

    return {
      ...JSON.parse(response.output_text),
      source: "openai"
    };
  } catch (error) {
    return buildFallbackChat({ message, snapshot });
  }
}

module.exports = {
  getFinanceAssistantReply
};
