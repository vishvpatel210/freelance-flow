
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    company: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
