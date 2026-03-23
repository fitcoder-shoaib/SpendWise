const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/goalsController");

const router = express.Router();

router.get("/", auth, controller.listGoals);
router.post("/", auth, controller.createGoal);
router.post("/:goalId/contribute", auth, controller.contributeToGoal);

module.exports = router;
