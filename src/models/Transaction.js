const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ["expense", "income"], required: true },
    autoCategorized: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
