const express = require("express");
const router = express.Router();
const {
  createDeliverable,
  getAllDeliverables,
  getDeliverableById,
  updateDeliverable,
  deleteDeliverable
} = require("../controller/deliverablecontroller");

router.post("/deliverables", createDeliverable);
router.get("/deliverables", getAllDeliverables);
router.get("/deliverables/:id", getDeliverableById);
router.patch("/deliverables/:id", updateDeliverable);
router.delete("/deliverables/:id", deleteDeliverable);

module.exports = router;

