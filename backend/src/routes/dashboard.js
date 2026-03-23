const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", auth, controller.getDashboardSummary);

module.exports = router;
