const categoryKeywords = {
  food: ["zomato", "swiggy", "restaurant", "cafe", "food", "lunch", "dinner"],
  transport: ["uber", "ola", "fuel", "petrol", "metro", "bus", "taxi"],
  shopping: ["amazon", "flipkart", "myntra", "shopping", "mall"],
  bills: ["electricity", "rent", "internet", "water", "bill", "recharge"],
  entertainment: ["movie", "netflix", "spotify", "game", "concert"],
  salary: ["salary", "payroll", "bonus", "freelance"],
  health: ["hospital", "pharmacy", "doctor", "medic", "gym"]
};

function autoCategorizeTransaction({ category, description = "", type }) {
  if (category && category.trim()) {
    return {
      category: category.trim().toLowerCase(),
      autoCategorized: false
    };
  }

  const haystack = description.toLowerCase();
  for (const [mappedCategory, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      return { category: mappedCategory, autoCategorized: true };
    }
  }

  return {
    category: type === "income" ? "income" : "misc",
    autoCategorized: true
  };
}

module.exports = {
  autoCategorizeTransaction
};
