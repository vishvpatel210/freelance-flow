const mongoose = require("mongoose");

const ProjectSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client",
        required:true,
    },
    budget:{
        type:Number,
        required:true,
        min: [0, "Budget cannot be negative"]
    },
    status:{
        type:String,
        enum: ["pending", "in-progress", "completed", "cancelled"],
        required:true,
    },
    startDate:{
        type:Date,
        required:true
    },
    deadline:{
        type:Date,
        required:true,
    }

},{timestamps:true})

module.exports = mongoose.model("Project",ProjectSchema);