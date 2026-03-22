module.exports = {
  users: [
    {
      name: "Aisha",
      email: "aisha@example.com",
      password: "Password123!",
      savingsGoalsSummary: "Trip to Goa and emergency buffer",
      savingsSettings: {
        fixedMonthlySavings: 3000,
        dailySpendingLimit: 1500,
        autoRoundOff: true,
        dailyAutoSaveThreshold: 1000,
        dailyAutoSaveAmount: 100,
        leaderboardShowPercentage: true
      }
    },
    {
      name: "Rahul",
      email: "rahul@example.com",
      password: "Password123!",
      savingsGoalsSummary: "Bike down payment",
      savingsSettings: {
        fixedMonthlySavings: 2500,
        dailySpendingLimit: 1800,
        autoRoundOff: true,
        dailyAutoSaveThreshold: 1200,
        dailyAutoSaveAmount: 100,
        leaderboardShowPercentage: false
      }
    },
    {
      name: "Neha",
      email: "neha@example.com",
      password: "Password123!",
      savingsGoalsSummary: "Laptop upgrade",
      savingsSettings: {
        fixedMonthlySavings: 4000,
        dailySpendingLimit: 2000,
        autoRoundOff: true,
        dailyAutoSaveThreshold: 1000,
        dailyAutoSaveAmount: 150,
        leaderboardShowPercentage: true
      }
    }
  ],
  goals: [
    {
      email: "aisha@example.com",
      name: "Goa Trip",
      targetAmount: 25000,
      currentAmount: 5000,
      deadline: "2026-07-01"
    },
    {
      email: "rahul@example.com",
      name: "Bike Down Payment",
      targetAmount: 40000,
      currentAmount: 6000,
      deadline: "2026-09-15"
    },
    {
      email: "neha@example.com",
      name: "Laptop Upgrade",
      targetAmount: 70000,
      currentAmount: 12000,
      deadline: "2026-08-20"
    }
  ],
  transactions: [
    {
      email: "aisha@example.com",
      amount: 487,
      category: "",
      description: "Zomato dinner order",
      date: "2026-03-20T19:30:00.000Z",
      type: "expense"
    },
    {
      email: "aisha@example.com",
      amount: 1200,
      category: "salary",
      description: "Freelance salary",
      date: "2026-03-20T09:30:00.000Z",
      type: "income"
    },
    {
      email: "rahul@example.com",
      amount: 980,
      category: "",
      description: "Amazon shopping",
      date: "2026-03-21T14:00:00.000Z",
      type: "expense"
    },
    {
      email: "rahul@example.com",
      amount: 450,
      category: "",
      description: "Uber ride",
      date: "2026-03-21T20:00:00.000Z",
      type: "expense"
    },
    {
      email: "neha@example.com",
      amount: 2200,
      category: "salary",
      description: "Monthly salary credit",
      date: "2026-03-19T08:00:00.000Z",
      type: "income"
    },
    {
      email: "neha@example.com",
      amount: 645,
      category: "",
      description: "Swiggy lunch order",
      date: "2026-03-19T13:00:00.000Z",
      type: "expense"
    }
  ]
};
