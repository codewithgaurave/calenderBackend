require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for profile images or file uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const userRoutes = require("./routes/userRoutes");
const remarkRoutes = require("./routes/remarkRoutes");

// Use Routes
app.use("/api/users", userRoutes);
app.use("/api/remarks", remarkRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
