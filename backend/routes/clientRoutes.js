const express = require("express")
const router = express.Router();
const {newClient,getAllClients,getClientById,updateClient,deleteClient} = require("../controller/clientcontroller")


router.post("/clients",newClient);
router.get("/clients",getAllClients);
router.get("/clients/:id",getClientById)
router.patch("/clients/:id",updateClient)
router.delete("/clients/:id",deleteClient)


module.exports = router;