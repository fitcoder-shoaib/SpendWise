const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { findUserById } = require("../services/dataStore");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication token is required." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "User session is invalid." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = auth;
