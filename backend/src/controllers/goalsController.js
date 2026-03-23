const { addGoal, findGoalById, getGoals } = require("../services/dataStore");
const { addSavingsEntry } = require("../services/savingsService");

function listGoals(req, res) {
  const goals = getGoals().filter((goal) => goal.userId === req.user.id);
  res.json({ success: true, goals });
}

function createGoal(req, res) {
  const { name, targetAmount, deadline, linkedAutoSave = false } = req.body;

  if (!name || !targetAmount || !deadline) {
    return res.status(400).json({ success: false, message: "Name, targetAmount, and deadline are required." });
  }

  const goal = addGoal({
    userId: req.user.id,
    name,
    targetAmount: Number(targetAmount),
    currentAmount: 0,
    deadline,
    linkedAutoSave
  });

  return res.status(201).json({ success: true, goal });
}

function contributeToGoal(req, res) {
  const goal = findGoalById(req.params.goalId);
  const amount = Number(req.body.amount || 0);

  if (!goal || goal.userId !== req.user.id) {
    return res.status(404).json({ success: false, message: "Goal not found." });
  }

  if (!amount) {
    return res.status(400).json({ success: false, message: "Contribution amount is required." });
  }

  goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
  addSavingsEntry(req.user, {
    source: "manual-goal",
    amount,
    note: `Added to ${goal.name}`
  });

  return res.json({ success: true, goal });
}

module.exports = {
  listGoals,
  createGoal,
  contributeToGoal
};
