const express = require("express");
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} = require("../controller/paymentcontroller");

router.post("/payments", createPayment);
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);
router.patch("/payments/:id", updatePayment);
router.delete("/payments/:id", deletePayment);

module.exports = router;

