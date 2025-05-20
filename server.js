require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const userRoutes = require("./routes/userRoutes");
const remarkRoutes = require("./routes/remarkRoutes");

// Use Routes
app.use("/api/users", userRoutes);
app.use("/api/remarks", remarkRoutes);

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// Base route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
