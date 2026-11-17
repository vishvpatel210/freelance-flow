const mongoose = require("mongoose");

const deliverableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Deliverable title is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"]
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },
    fileUrl: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "submitted", "approved", "rejected"],
        message: "Status must be pending, submitted, approved, or rejected"
      },
      default: "pending"
    },
    submittedAt: {
      type: Date
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deliverable", deliverableSchema);

