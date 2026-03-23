const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { addUser, findUserByEmail } = require("../services/dataStore");

function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    savingsSettings: user.savingsSettings,
    totalSavings: user.totalSavings,
    weeklySavings: user.weeklySavings
  };
}

function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required." });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ success: false, message: "User already exists." });
  }

  const user = addUser({
    name,
    email: email.toLowerCase(),
    password,
    savingsSettings: {
      fixedMonthlySavings: 3000,
      dailySpendingLimit: 2000,
      autoRoundOff: true,
      dailyAutoSaveThreshold: 1200,
      dailyAutoSaveAmount: 120,
      leaderboardShowPercentage: true
    }
  });

  return res.status(201).json({
    success: true,
    token: signToken(user.id),
    user: sanitizeUser(user)
  });
}

function login(req, res) {
  const { email, password } = req.body;
  const user = findUserByEmail(email || "");

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  return res.json({
    success: true,
    token: signToken(user.id),
    user: sanitizeUser(user)
  });
}

function me(req, res) {
  return res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
}

module.exports = {
  signup,
  login,
  me
};
