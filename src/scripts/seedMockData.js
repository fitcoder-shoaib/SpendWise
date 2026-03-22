require("dotenv").config();
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");
const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");
const mockData = require("../data/mockData");
const { autoCategorizeTransaction } = require("../utils/categoryRules");
const { applySavingsRulesForTransaction, addSavingsEntry } = require("../services/savingsEngine");

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Goal.deleteMany({}), Transaction.deleteMany({})]);

  const usersByEmail = {};
  for (const userInput of mockData.users) {
    const user = await User.create({
      ...userInput,
      password: await bcrypt.hash(userInput.password, 10)
    });
    usersByEmail[user.email] = user;
  }

  for (const goalInput of mockData.goals) {
    await Goal.create({
      user: usersByEmail[goalInput.email]._id,
      name: goalInput.name,
      targetAmount: goalInput.targetAmount,
      currentAmount: goalInput.currentAmount,
      deadline: goalInput.deadline
    });
  }

  for (const txInput of mockData.transactions) {
    const user = usersByEmail[txInput.email];
    const categorized = autoCategorizeTransaction(txInput);
    const transaction = await Transaction.create({
      user: user._id,
      amount: txInput.amount,
      category: categorized.category,
      autoCategorized: categorized.autoCategorized,
      description: txInput.description,
      date: txInput.date,
      type: txInput.type
    });
    await applySavingsRulesForTransaction(user, transaction);
  }

  await addSavingsEntry(usersByEmail["aisha@example.com"], {
    source: "fixed-monthly",
    amount: 3000,
    note: "Seeded fixed monthly saving"
  });
  await addSavingsEntry(usersByEmail["rahul@example.com"], {
    source: "manual",
    amount: 800,
    note: "Seeded manual saving"
  });
  await addSavingsEntry(usersByEmail["neha@example.com"], {
    source: "manual",
    amount: 1200,
    note: "Seeded manual saving"
  });

  usersByEmail["aisha@example.com"].friends = [
    { friend: usersByEmail["rahul@example.com"]._id, alias: "Rahul" },
    { friend: usersByEmail["neha@example.com"]._id, alias: "Neha" }
  ];
  usersByEmail["rahul@example.com"].friends = [
    { friend: usersByEmail["aisha@example.com"]._id, alias: "Aisha" },
    { friend: usersByEmail["neha@example.com"]._id, alias: "Neha" }
  ];
  usersByEmail["neha@example.com"].friends = [
    { friend: usersByEmail["aisha@example.com"]._id, alias: "Aisha" },
    { friend: usersByEmail["rahul@example.com"]._id, alias: "Rahul" }
  ];

  await Promise.all(Object.values(usersByEmail).map((user) => user.save()));
  console.log("Mock data seeded successfully.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
