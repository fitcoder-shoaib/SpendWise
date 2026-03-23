module.exports = {
  users: [
    {
      id: "user-demo",
      name: "Demo User",
      email: "demo@spendwise.app",
      password: "demo123",
      savingsSettings: {
        fixedMonthlySavings: 5000,
        dailySpendingLimit: 2200,
        autoRoundOff: true,
        dailyAutoSaveThreshold: 1500,
        dailyAutoSaveAmount: 150,
        leaderboardShowPercentage: true
      },
      totalSavings: 8450,
      weeklySavings: 1350,
      savingsLedger: [
        {
          id: "save-1",
          source: "fixed-monthly",
          amount: 5000,
          note: "Monthly auto-save for March",
          date: "2026-03-01T08:00:00.000Z"
        },
        {
          id: "save-2",
          source: "round-off",
          amount: 50,
          note: "Rounded a food delivery order",
          date: "2026-03-18T18:30:00.000Z"
        },
        {
          id: "save-3",
          source: "rule-based",
          amount: 150,
          note: "Daily spending crossed the threshold",
          date: "2026-03-20T21:00:00.000Z"
        }
      ]
    },
    {
      id: "user-aisha",
      name: "Aisha",
      email: "aisha@example.com",
      password: "demo123",
      savingsSettings: {
        fixedMonthlySavings: 4200,
        dailySpendingLimit: 2000,
        autoRoundOff: true,
        dailyAutoSaveThreshold: 1300,
        dailyAutoSaveAmount: 120,
        leaderboardShowPercentage: true
      },
      totalSavings: 9900,
      weeklySavings: 1800,
      savingsLedger: []
    },
    {
      id: "user-rahul",
      name: "Rahul",
      email: "rahul@example.com",
      password: "demo123",
      savingsSettings: {
        fixedMonthlySavings: 3600,
        dailySpendingLimit: 1800,
        autoRoundOff: true,
        dailyAutoSaveThreshold: 1100,
        dailyAutoSaveAmount: 100,
        leaderboardShowPercentage: false
      },
      totalSavings: 7200,
      weeklySavings: 1250,
      savingsLedger: []
    },
    {
      id: "user-neha",
      name: "Neha",
      email: "neha@example.com",
      password: "demo123",
      savingsSettings: {
        fixedMonthlySavings: 4800,
        dailySpendingLimit: 2400,
        autoRoundOff: true,
        dailyAutoSaveThreshold: 1600,
        dailyAutoSaveAmount: 180,
        leaderboardShowPercentage: true
      },
      totalSavings: 11200,
      weeklySavings: 2100,
      savingsLedger: []
    }
  ],
  transactions: [
    {
      id: "txn-1",
      userId: "user-demo",
      amount: 1320,
      category: "food",
      type: "expense",
      description: "Weekend dinner with friends",
      date: "2026-03-22T13:15:00.000Z"
    },
    {
      id: "txn-2",
      userId: "user-demo",
      amount: 48000,
      category: "income",
      type: "income",
      description: "Salary credit",
      date: "2026-03-20T05:30:00.000Z"
    },
    {
      id: "txn-3",
      userId: "user-demo",
      amount: 649,
      category: "shopping",
      type: "expense",
      description: "Online essentials order",
      date: "2026-03-21T11:00:00.000Z"
    },
    {
      id: "txn-4",
      userId: "user-demo",
      amount: 285,
      category: "transport",
      type: "expense",
      description: "Cab to office",
      date: "2026-03-22T08:20:00.000Z"
    }
  ],
  goals: [
    {
      id: "goal-1",
      userId: "user-demo",
      name: "Emergency Fund",
      targetAmount: 50000,
      currentAmount: 18000,
      deadline: "2026-08-31",
      linkedAutoSave: true
    },
    {
      id: "goal-2",
      userId: "user-demo",
      name: "Bali Trip",
      targetAmount: 35000,
      currentAmount: 9000,
      deadline: "2026-10-15",
      linkedAutoSave: false
    }
  ],
  friends: [
    {
      id: "friend-1",
      name: "Aisha",
      weeklySavings: 1800,
      streak: 7
    },
    {
      id: "friend-2",
      name: "Rahul",
      weeklySavings: 1250,
      streak: 5
    },
    {
      id: "friend-3",
      name: "Neha",
      weeklySavings: 2100,
      streak: 8
    }
  ]
};
