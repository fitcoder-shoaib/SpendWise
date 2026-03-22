const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, required: true },
    linkedAutoSave: { type: Boolean, default: true },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
