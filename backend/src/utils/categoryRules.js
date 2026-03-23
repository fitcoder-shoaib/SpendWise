const rules = [
  { keywords: ["swiggy", "zomato", "dinner", "lunch", "coffee", "food"], category: "food" },
  { keywords: ["uber", "ola", "cab", "metro", "fuel"], category: "transport" },
  { keywords: ["salary", "freelance", "invoice"], category: "income" },
  { keywords: ["amazon", "shopping", "order"], category: "shopping" },
  { keywords: ["movie", "netflix", "spotify"], category: "entertainment" }
];

function autoCategorizeTransaction({ category, description = "", type }) {
  if (category) {
    return category;
  }

  const normalized = description.toLowerCase();
  const match = rules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));

  if (match) {
    return match.category;
  }

  return type === "income" ? "income" : "misc";
}

module.exports = {
  autoCategorizeTransaction
};
