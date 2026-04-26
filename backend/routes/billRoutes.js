const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const auth = require("../middleware/auth");

router.post("/calculate", auth, billController.calculateBill);
router.get("/history", auth, billController.getHistory);

module.exports = router;
