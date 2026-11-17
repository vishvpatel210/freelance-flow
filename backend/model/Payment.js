const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"]
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client reference is required"]
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"]
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "Bank Transfer"
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded"],
        message: "Status must be pending, paid, failed, or refunded"
      },
      default: "pending"
    },
    transactionId: {
      type: String,
      trim: true,
      default: ""
    },
    paymentDate: {
      type: Date
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

