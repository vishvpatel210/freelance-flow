const express = require("express");
const router = express.Router();

const { createproject,getAllProjects,getProjectById,updateProject,deleteProject } = require("../controller/projectcontroller")

router.post("/projects", createproject);
router.get("/projects",getAllProjects);
router.get("/projects/:id", getProjectById);
router.patch("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

module.exports = router;