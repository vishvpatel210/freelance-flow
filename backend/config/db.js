require("dotenv").config()
const mongoose = require("mongoose");
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
async function DB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database connected successfully");
  } catch (err) {
    console.log("Database connection failed:", err.message);
  }
}

module.exports = DB;
