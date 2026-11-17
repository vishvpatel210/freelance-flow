const mongoose = require("mongoose");
const Task = require("../model/Task");
const Project = require("../model/Project");

const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, status, dueDate } = req.body;

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

    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`
      });
    }

    const validStatuses = ["pending", "in-progress", "completed"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const task = await Task.create({
      title,
      description: description || "",
      project,
      assignedTo: assignedTo || "",
      priority: priority || "medium",
      status: status || "pending",
      dueDate: dueDate || null
    });

    const populatedTask = await Task.findById(task._id).populate("project", "title status budget deadline");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const getAllTasks = async (req, res) => {
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

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const tasks = await Task.find(query)
      .populate("project", "title status client deadline")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      totalTasks: tasks.length,
      tasks
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const task = await Task.findById(id).populate({
      path: "project",
      select: "title description budget status client startDate deadline",
      populate: {
        path: "client",
        select: "name email phone company"
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      task
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const allowedFields = ["title", "description", "project", "assignedTo", "priority", "status", "dueDate"];
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

    if (updates.priority) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(updates.priority)) {
        return res.status(400).json({
          success: false,
          message: `Invalid priority. Must be one of: ${validPriorities.join(", ")}`
        });
      }
    }

    if (updates.status) {
      const validStatuses = ["pending", "in-progress", "completed"];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, returnDocument: "after", runValidators: true }
    ).populate("project", "title status budget deadline");

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      task: deletedTask
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
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
};
