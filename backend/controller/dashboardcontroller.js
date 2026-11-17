const mongoose = require("mongoose");
const Client = require("../model/Client");
const Project = require("../model/Project");
const Task = require("../model/Task");
const Payment = require("../model/Payment");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalClients,
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      revenueAggregation,
      pendingPaymentsAggregation,
      recentProjects,
      recentPayments,
      projectStatusAggregation,
      taskStatusAggregation
    ] = await Promise.all([
      Client.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "in-progress" }),
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Payment.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]),
      Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("client", "name email company"),
      Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("project", "title")
        .populate("client", "name email"),
      Project.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Task.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;
    const pendingPayments = {
      amount: pendingPaymentsAggregation.length > 0 ? pendingPaymentsAggregation[0].total : 0,
      count: pendingPaymentsAggregation.length > 0 ? pendingPaymentsAggregation[0].count : 0
    };

    // Format project status stats to ensure all standard statuses have counts
    const projectStatusMap = { pending: 0, "in-progress": 0, completed: 0, cancelled: 0 };
    projectStatusAggregation.forEach((item) => {
      if (item._id && projectStatusMap.hasOwnProperty(item._id)) {
        projectStatusMap[item._id] = item.count;
      }
    });

    // Format task status stats
    const taskStatusMap = { pending: 0, "in-progress": 0, completed: 0 };
    taskStatusAggregation.forEach((item) => {
      if (item._id && taskStatusMap.hasOwnProperty(item._id)) {
        taskStatusMap[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      stats: {
        totalClients,
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        totalRevenue,
        pendingPayments,
        projectStatusStats: projectStatusMap,
        taskStatusStats: taskStatusMap,
        recentProjects,
        recentPayments
      }
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
  getDashboardStats
};

