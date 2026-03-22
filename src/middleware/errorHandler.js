module.exports = function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid auth token." });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Auth token expired." });
  }

  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: "A record with this value already exists." });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error."
  });
};
