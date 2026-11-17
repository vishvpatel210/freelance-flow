const mongoose = require("mongoose");
const Client = require("../model/Client");

const newClient = async (req,res)=>{
    try{
        const {name,email,phone,company,address,notes} = req.body;
        if(!name || !email || !phone || !address){
            res.status(400).json({message:"all fields are required"})
            return;
        }

        const normalMail = email.trim().toLowerCase();

        const checkMail = await Client.findOne({email: email})

        if(checkMail){
            res.status(409).json({message:"duplicate email is not allowed"})
            return ;
        }

        const data = {
            name : name,
            email : email,
            phone: phone,
            company : company,
            address : address,
            notes : notes,
        }
        
        const client  = await Client.create(data)
        res.status(201).json({success:true, message:"user created succesfully" , client})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:err})
    }
        
}


const getAllClients = async(req,res)=>{
    try{
        const allClients = await Client.find();

        if(!allClients){
            res.status(400).json({message:"No client is exist"})
            return;
        }

        res.status(200).json({success:true,message:"all clients are fetched succesfully",allClients})
    }
    catch(err){
        console.log(err);
    }
}

const getClientById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid client ID"
            });
        }

        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).json({
                message: "Client not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Client fetched successfully",
            client
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};




const updateClient = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid client ID"
            });
        }

        // Fields allowed to update
        const { name, email, phone, company, address, notes } = req.body;

        const updatedClient = await Client.findByIdAndUpdate(
            id,
            {
                name,
                email,
                phone,
                company,
                address,
                notes
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedClient) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Client updated successfully",
            client: updatedClient
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid client ID"
            });
        }

        const deletedClient = await Client.findByIdAndDelete(id);

        if (!deletedClient) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Client deleted successfully",
            client: deletedClient
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {newClient,getAllClients,getClientById,updateClient,deleteClient};