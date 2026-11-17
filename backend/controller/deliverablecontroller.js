const mongoose = require("mongoose");
const Deliverable = require("../model/Deliverable");
const Project = require("../model/Project");
const Task = require("../model/Task");

const createDeliverable = async (req, res) => {
  try {
    const { title, description, project, task, fileUrl, status, submittedAt, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        success: false,
        message: "Title and project are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Referenced project not found"
      });
    }

    let validTask = null;
    if (task) {
      if (!mongoose.Types.ObjectId.isValid(task)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID"
        });
      }
      const existingTask = await Task.findById(task);
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: "Referenced task not found"
        });
      }
      validTask = task;
    }

    const validStatuses = ["pending", "submitted", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const deliverable = await Deliverable.create({
      title,
      description: description || "",
      project,
      task: validTask,
      fileUrl: fileUrl || "",
      status: status || "pending",
      submittedAt: submittedAt || (status === "submitted" ? new Date() : null),
      dueDate: dueDate || null
    });

    const populatedDeliverable = await Deliverable.findById(deliverable._id)
      .populate("project", "title status budget deadline")
      .populate("task", "title status priority");

    return res.status(201).json({
      success: true,
      message: "Deliverable created successfully",
      deliverable: populatedDeliverable
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const getAllDeliverables = async (req, res) => {
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

    if (req.query.task) {
      if (!mongoose.Types.ObjectId.isValid(req.query.task)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID in query"
        });
      }
      query.task = req.query.task;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const deliverables = await Deliverable.find(query)
      .populate("project", "title status deadline client")
      .populate("task", "title status priority")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Deliverables fetched successfully",
      totalDeliverables: deliverables.length,
      deliverables
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const getDeliverableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deliverable ID"
      });
    }

    const deliverable = await Deliverable.findById(id)
      .populate({
        path: "project",
        select: "title description budget status client deadline",
        populate: {
          path: "client",
          select: "name email phone company"
        }
      })
      .populate("task", "title description status priority assignedTo");

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: "Deliverable not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deliverable fetched successfully",
      deliverable
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const updateDeliverable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deliverable ID"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "project",
      "task",
      "fileUrl",
      "status",
      "submittedAt",
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

    if (updates.task) {
      if (!mongoose.Types.ObjectId.isValid(updates.task)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID"
        });
      }
      const existingTask = await Task.findById(updates.task);
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: "Referenced task not found"
        });
      }
    }

    if (updates.status) {
      const validStatuses = ["pending", "submitted", "approved", "rejected"];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        });
      }
      if (updates.status === "submitted" && !updates.submittedAt) {
        updates.submittedAt = new Date();
      }
    }

    const updatedDeliverable = await Deliverable.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, returnDocument: "after", runValidators: true }
    )
      .populate("project", "title status budget deadline")
      .populate("task", "title status priority");

    if (!updatedDeliverable) {
      return res.status(404).json({
        success: false,
        message: "Deliverable not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deliverable updated successfully",
      deliverable: updatedDeliverable
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const deleteDeliverable = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deliverable ID"
      });
    }

    const deletedDeliverable = await Deliverable.findByIdAndDelete(id);

    if (!deletedDeliverable) {
      return res.status(404).json({
        success: false,
        message: "Deliverable not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Deliverable deleted successfully",
      deliverable: deletedDeliverable
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
  createDeliverable,
  getAllDeliverables,
  getDeliverableById,
  updateDeliverable,
  deleteDeliverable
};
