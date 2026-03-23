const express = require("express");
const auth = require("../middleware/auth");
const controller = require("../controllers/transactionController");

const router = express.Router();

router.get("/", auth, controller.listTransactions);
router.post("/", auth, controller.createTransaction);

module.exports = router;
