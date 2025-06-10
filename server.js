const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");
const organInventoryRoutes = require('./routes/organInventoryRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middlewares
app.use(express.json());  // For parsing application/json

// Enable CORS from your React frontend URL
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// HTTP request logger for development
app.use(morgan("dev"));

// Simple logger for every request (debugging)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// API routes
app.use("/api/v1/test", require("./routes/testRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/inventory", require("./routes/inventoryRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use('/api/v1/organ-inventory', organInventoryRoutes);
app.use('/api/v1/users', userRoutes);

// Quick test route for organ inventory API
app.get('/api/v1/organ-inventory/test', (req, res) => {
  res.json({ success: true, message: "Organ Inventory API working!" });
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (fallback)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `Node Server Running In ${process.env.DEV_MODE || 'development'} Mode On Port ${PORT}`.bgBlue.white
  );
});
