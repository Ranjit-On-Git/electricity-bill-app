const Bill = require("../models/Bill");

exports.calculateBill = async (req, res) => {
  try {
    let { units, fixedCharges, taxPercentage } = req.body;
    units = parseFloat(units);
    fixedCharges = parseFloat(fixedCharges);
    taxPercentage = parseFloat(taxPercentage);

    // Slab Logic
    // 0-100: ₹5/unit | 101-200: ₹7/unit | >200: ₹10/unit
    let energyCharge = 0;
    if (units <= 100) {
      energyCharge = units * 5;
    } else if (units <= 200) {
      energyCharge = 100 * 5 + (units - 100) * 7;
    } else {
      energyCharge = 100 * 5 + 100 * 7 + (units - 200) * 10;
    }

    const baseAmount = energyCharge + fixedCharges;
    const taxAmount = (baseAmount * taxPercentage) / 100;
    const totalBill = baseAmount + taxAmount;

    const newBill = new Bill({
      userId: req.user.id,
      units,
      fixedCharges,
      taxPercentage,
      energyCharge,
      taxAmount,
      totalBill,
    });

    await newBill.save();

    res.status(200).json({
      message: "Bill calculated successfully",
      data: newBill,
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating bill" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user.id }).sort({
      calculationDate: -1,
    });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
};
