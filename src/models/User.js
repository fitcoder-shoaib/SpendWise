const mongoose = require("mongoose");

const savingsSettingsSchema = new mongoose.Schema(
  {
    fixedMonthlySavings: { type: Number, default: 0 },
    dailySpendingLimit: { type: Number, default: 2000 },
    autoRoundOff: { type: Boolean, default: true },
    dailyAutoSaveThreshold: { type: Number, default: 1000 },
    dailyAutoSaveAmount: { type: Number, default: 100 },
    leaderboardShowPercentage: { type: Boolean, default: true }
  },
  { _id: false }
);

const savingsLedgerSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["round-off", "rule-based", "fixed-monthly", "manual"],
      required: true
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", default: null },
    note: { type: String, default: "" }
  },
  { _id: false }
);

const friendSchema = new mongoose.Schema(
  {
    friend: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    alias: { type: String, default: "" }
  },
  { _id: false }
);

const badgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    savingsGoalsSummary: { type: String, default: "" },
    savingsSettings: { type: savingsSettingsSchema, default: () => ({}) },
    savingsLedger: { type: [savingsLedgerSchema], default: [] },
    totalSavings: { type: Number, default: 0 },
    weeklyFinancialScore: { type: Number, default: 50 },
    savingsStreak: { type: Number, default: 0 },
    badges: { type: [badgeSchema], default: [] },
    friends: { type: [friendSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
