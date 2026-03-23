const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/aiController");

const router = express.Router();

router.post("/", auth, controller.getInsights);

module.exports = router;
