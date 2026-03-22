const express = require("express");

const auth = require("../middleware/auth");
const User = require("../models/User");
const { buildWeeklyLeaderboard } = require("../services/leaderboardService");

const router = express.Router();

router.post("/friends", auth, async (req, res, next) => {
  try {
    const { friendEmail, alias } = req.body;
    const friend = await User.findOne({ email: friendEmail?.toLowerCase() });

    if (!friend) {
      return res.status(404).json({ success: false, message: "Friend not found." });
    }

    const alreadyAdded = req.user.friends.some((item) => String(item.friend) === String(friend._id));
    if (!alreadyAdded) {
      req.user.friends.push({ friend: friend._id, alias });
      await req.user.save();
    }

    res.status(201).json({ success: true, friends: req.user.friends });
  } catch (error) {
    next(error);
  }
});

router.get("/weekly", auth, async (req, res, next) => {
  try {
    const showPercentage =
      req.query.showPercentage === "true" || req.user.savingsSettings.leaderboardShowPercentage;
    const data = await buildWeeklyLeaderboard(req.user, { showPercentage });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
