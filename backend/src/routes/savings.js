const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/savingsController");

const router = express.Router();

router.put("/settings", auth, controller.updateSettings);
router.post("/fixed-monthly", auth, controller.triggerFixedMonthly);
router.post("/manual", auth, controller.addManualSaving);
router.get("/summary", auth, controller.getSummary);

module.exports = router;
