const express = require("express");

const Goal = require("../models/Goal");
const auth = require("../middleware/auth");
const { addSavingsEntry } = require("../services/savingsEngine");

const router = express.Router();

router.post("/", auth, async (req, res, next) => {
  try {
    const goal = await Goal.create({
      user: req.user._id,
      name: req.body.name,
      targetAmount: req.body.targetAmount,
      deadline: req.body.deadline,
      notes: req.body.notes,
      linkedAutoSave: req.body.linkedAutoSave !== false
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
});

router.get("/", auth, async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ deadline: 1 });
    const goalsWithProgress = goals.map((goal) => ({
      ...goal.toObject(),
      progressPercentage: Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    }));

    res.json({ success: true, goals: goalsWithProgress });
  } catch (error) {
    next(error);
  }
});

router.post("/:goalId/contribute", auth, async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.goalId, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    const amount = Number(req.body.amount || 0);
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Contribution amount must be greater than 0." });
    }

    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
    await goal.save();

    await addSavingsEntry(req.user, {
      source: "manual",
      amount,
      note: `Goal contribution for ${goal.name}`,
      targetGoal: goal,
      skipGoalAllocation: true
    });

    res.json({
      success: true,
      goal: {
        ...goal.toObject(),
        progressPercentage: Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
