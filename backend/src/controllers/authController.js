const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { addUser, findUserByEmail } = require("../services/dataStore");
const { hashPassword, verifyPassword } = require("../utils/password");

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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    if (await findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    const user = await addUser({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password)
    });

    return res.status(201).json({
      success: true,
      token: signToken(user.id),
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await findUserByEmail(email || "");

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    return res.json({
      success: true,
      token: signToken(user.id),
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
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
