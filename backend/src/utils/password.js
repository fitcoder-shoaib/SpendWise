const { randomBytes, scryptSync, timingSafeEqual } = require("crypto");

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  if (!String(storedHash).includes(":")) {
    return String(password) === String(storedHash);
  }

  const [salt, hash] = String(storedHash).split(":");
  const candidate = scryptSync(String(password), salt, 64);
  const original = Buffer.from(hash, "hex");

  if (candidate.length !== original.length) {
    return false;
  }

  return timingSafeEqual(candidate, original);
}

module.exports = {
  hashPassword,
  verifyPassword
};
