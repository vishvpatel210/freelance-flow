const mongoose = require("mongoose");
const Project = require("../model/Project");
const Client = require("../model/Client");

const createproject = async (req, res) => {
    try {
        const {
            title,
            description,
            client,
            budget,
            status,
            startDate,
            deadline
        } = req.body;

        if (!title || !description || !client ||
            budget === undefined || budget === null ||
            !status || !startDate || !deadline) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(client)) {
            return res.status(400).json({
                message: "Invalid client ID"
            });
        }

        const existingClient = await Client.findById(client);

        if (!existingClient) {
            return res.status(404).json({
                message: "Client not found"
            });
        }

        const project = await Project.create({
            title,
            description,
            client,
            budget,
            status,
            startDate,
            deadline
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




const getAllProjects = async (req, res) => {
    try {
        const allProjects = await Project.find()
            .populate("client", "name email phone");

        return res.status(200).json({
            success: true,
            message: "All projects fetched successfully",
            totalProjects: allProjects.length,
            projects: allProjects
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate project ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        // Find project and populate client details
        const project = await Project.findById(id)
            .populate("client", "name email phone");

        // Check if project exists
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            project
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};





const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "client",
            "budget",
            "status",
            "startDate",
            "deadline"
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

        // Validate client if client ID is being updated
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
                    message: "Client not found"
                });
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate("client", "name email phone");

        if (!updatedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project: updatedProject
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate project ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        // Find and delete project
        const deletedProject = await Project.findByIdAndDelete(id);

        // Check if project exists
        if (!deletedProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            project: deletedProject
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { createproject,getAllProjects,getProjectById,updateProject,deleteProject };