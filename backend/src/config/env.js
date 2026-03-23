const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  port: Number(process.env.PORT || 5050),
  jwtSecret: process.env.JWT_SECRET || "spendwise-demo-secret",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-5-mini",
  sqlitePath: process.env.SQLITE_PATH || path.resolve(__dirname, "../../data/spendwise.sqlite")
};
