const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  units: { type: Number, required: true },
  fixedCharges: { type: Number, required: true },
  taxPercentage: { type: Number, required: true },
  energyCharge: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  totalBill: { type: Number, required: true },
  calculationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", billSchema);
