function buildFinancialSnapshot({ user, transactions, goals }) {
  const expenses = transactions.filter((item) => item.type === "expense");
  const income = transactions.filter((item) => item.type === "income");

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
  const categoryTotals = expenses.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + Number(item.amount);
    return accumulator;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  const foodSpend = categoryTotals.food || 0;
  const foodSpendRatio = totalExpense > 0 ? foodSpend / totalExpense : 0;
  const savingsRate = totalIncome > 0 ? user.totalSavings / totalIncome : 0;

  const flags = [];
  if (foodSpendRatio > 0.4) {
    flags.push({
      type: "overspending-food",
      message: "Food spending is above 40% of total expenses."
    });
  }
  if (savingsRate < 0.2) {
    flags.push({
      type: "low-savings-rate",
      message: "Savings are below 20% of income."
    });
  }

  return {
    totals: {
      totalExpense,
      totalIncome,
      totalSavings: user.totalSavings,
      weeklySavings: user.weeklySavings,
      savingsRate: Number((savingsRate * 100).toFixed(1)),
      foodSpendRatio: Number((foodSpendRatio * 100).toFixed(1))
    },
    topCategories,
    goals: goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline
    })),
    recentExpenses: expenses.slice(0, 5).map((item) => ({
      description: item.description,
      amount: item.amount,
      category: item.category,
      date: item.date
    })),
    flags
  };
}

module.exports = {
  buildFinancialSnapshot
};
