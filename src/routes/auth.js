const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, savingsGoalsSummary, savingsSettings } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      savingsGoalsSummary: savingsGoalsSummary || "",
      savingsSettings: savingsSettings || {}
    });

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        savingsGoalsSummary: user.savingsGoalsSummary,
        savingsSettings: user.savingsSettings
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    res.json({
      success: true,
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        savingsGoalsSummary: user.savingsGoalsSummary,
        savingsSettings: user.savingsSettings,
        totalSavings: user.totalSavings
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", auth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      savingsGoalsSummary: req.user.savingsGoalsSummary,
      savingsSettings: req.user.savingsSettings,
      totalSavings: req.user.totalSavings,
      weeklyFinancialScore: req.user.weeklyFinancialScore,
      savingsStreak: req.user.savingsStreak,
      badges: req.user.badges
    }
  });
});

module.exports = router;
