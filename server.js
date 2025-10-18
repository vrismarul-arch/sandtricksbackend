// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// ✅ CORS Config
const corsOptions = {
  origin: [
    "http://localhost:5173",             // React dev
    "https://svj-security.netlify.app", // Production
    "http://svjsmartsolutions.shop",    // Production
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // PATCH included
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ✅ Apply CORS globally
app.use(cors(corsOptions));

// ✅ JSON parsing middleware
app.use(express.json());

// ✅ Debug logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ✅ Routes
const entryRoutes = require("./routes/entryRoutes");
app.use("/api/entries", entryRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const leadsRoutes = require("./routes/leadsRoutes");
app.use("/api/leads", leadsRoutes);

// ✅ Database connection
const connectDB = require("./config/db");
connectDB();

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
