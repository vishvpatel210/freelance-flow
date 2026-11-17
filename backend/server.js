require("dotenv").config()
const app = require("./app");
const DB = require("./config/db");

DB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server is running successfully on PORT", PORT);
});