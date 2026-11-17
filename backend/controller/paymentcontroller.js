const mongoose = require("mongoose");
const Payment = require("../model/Payment");
const Project = require("../model/Project");
const Client = require("../model/Client");

const createPayment = async (req, res) => {
  try {
    let { project, client, amount, paymentMethod, status, transactionId, paymentDate, dueDate } = req.body;

    if (!project || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Project and amount are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number"
      });
    }

    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Referenced project not found"
      });
    }

    // If client wasn't provided, use the client associated with the project
    if (!client) {
      client = existingProject.client;
    } else {
      if (!mongoose.Types.ObjectId.isValid(client)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID"
        });
      }
      const existingClient = await Client.findById(client);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Referenced client not found"
        });
      }
    }

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const payment = await Payment.create({
      project,
      client,
      amount: numericAmount,
      paymentMethod: paymentMethod || "Bank Transfer",
      status: status || "pending",
      transactionId: transactionId || "",
      paymentDate: paymentDate || (status === "paid" ? new Date() : null),
      dueDate: dueDate || null
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate("project", "title budget status deadline")
      .populate("client", "name email phone company");

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: populatedPayment
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const query = {};

    if (req.query.project) {
      if (!mongoose.Types.ObjectId.isValid(req.query.project)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID in query"
        });
      }
      query.project = req.query.project;
    }

    if (req.query.client) {
      if (!mongoose.Types.ObjectId.isValid(req.query.client)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID in query"
        });
      }
      query.client = req.query.client;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const payments = await Payment.find(query)
      .populate("project", "title budget status deadline")
      .populate("client", "name email phone company")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      totalPayments: payments.length,
      payments
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID"
      });
    }

    const payment = await Payment.findById(id)
      .populate("project", "title budget status deadline client")
      .populate("client", "name email phone company address");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      payment
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID"
      });
    }

    const allowedFields = [
      "project",
      "client",
      "amount",
      "paymentMethod",
      "status",
      "transactionId",
      "paymentDate",
      "dueDate"
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    if (updates.amount !== undefined) {
      const numericAmount = Number(updates.amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a non-negative number"
        });
      }
      updates.amount = numericAmount;
    }

    if (updates.project) {
      if (!mongoose.Types.ObjectId.isValid(updates.project)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID"
        });
      }
      const existingProject = await Project.findById(updates.project);
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: "Referenced project not found"
        });
      }
    }

    if (updates.client) {
      if (!mongoose.Types.ObjectId.isValid(updates.client)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID"
        });
      }
      const existingClient = await Client.findById(updates.client);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Referenced client not found"
        });
      }
    }

    if (updates.status) {
      const validStatuses = ["pending", "paid", "failed", "refunded"];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        });
      }
      if (updates.status === "paid" && !updates.paymentDate) {
        updates.paymentDate = new Date();
      }
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, returnDocument: "after", runValidators: true }
    )
      .populate("project", "title budget status deadline")
      .populate("client", "name email phone company");

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID"
      });
    }

    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      payment: deletedPayment
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment
};
