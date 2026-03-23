const {
  addGoal,
  addSavingsEntry,
  findGoalById,
  listGoalsByUser,
  updateGoalAmount
} = require("../services/dataStore");

async function listGoals(req, res, next) {
  try {
    const goals = await listGoalsByUser(req.user.id);
    res.json({ success: true, goals });
  } catch (error) {
    next(error);
  }
}

async function createGoal(req, res, next) {
  try {
    const { name, targetAmount, deadline, linkedAutoSave = false } = req.body || {};
    const numericTarget = Number(targetAmount);

    if (!name || !numericTarget || !deadline) {
      return res.status(400).json({ success: false, message: "Name, targetAmount, and deadline are required." });
    }

    const goal = await addGoal({
      userId: req.user.id,
      name: String(name).trim(),
      targetAmount: numericTarget,
      currentAmount: 0,
      deadline,
      linkedAutoSave: Boolean(linkedAutoSave)
    });

    return res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
}

async function contributeToGoal(req, res, next) {
  try {
    const goal = await findGoalById(req.params.goalId);
    const amount = Number(req.body?.amount || 0);

    if (!goal || goal.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    if (!amount) {
      return res.status(400).json({ success: false, message: "Contribution amount is required." });
    }

    const updatedGoal = await updateGoalAmount(
      goal.id,
      Math.min(goal.targetAmount, goal.currentAmount + amount)
    );

    const result = await addSavingsEntry(
      req.user.id,
      {
        source: "manual-goal",
        amount,
        note: `Added to ${goal.name}`
      },
      { skipLinkedGoal: true }
    );
    req.user = result.user;

    return res.json({ success: true, goal: updatedGoal });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listGoals,
  createGoal,
  contributeToGoal
};
