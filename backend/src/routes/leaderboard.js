const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/leaderboardController");

const router = express.Router();

router.get("/weekly", auth, controller.getWeeklyLeaderboard);

module.exports = router;
