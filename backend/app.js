const express = require("express");
const cors = require("cors");
const app = express();

const clientRoute = require("./routes/clientRoutes");
const projectRoute = require("./routes/projectRoutes");
const taskRoute = require("./routes/taskRoutes");
const deliverableRoute = require("./routes/deliverableRoutes");
const paymentRoute = require("./routes/paymentRoutes");
const dashboardRoute = require("./routes/dashboardRoutes");

app.use(cors());
app.use(express.json());

app.use("/api", clientRoute);
app.use("/api", projectRoute);
app.use("/api", taskRoute);
app.use("/api", deliverableRoute);
app.use("/api", paymentRoute);
app.use("/api", dashboardRoute);

// 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

module.exports = app;
