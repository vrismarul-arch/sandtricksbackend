// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Import routes ---
import entryRoutes from "./routes/entryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import leadsRoutes from "./routes/leadsRoutes.js";

// --- Import DB connection ---
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

// --- CORS Configuration ---
// Whitelist both dev and production frontend URLs
const allowedOrigins = [
  "http://localhost:5173",                   // Local dev
  "https://enquiry-from.netlify.app",       // Production frontend
  "https://your-frontend-domain.com",       // Replace with actual deployed frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow requests with no origin (like Postman)
    } else {
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// --- JSON and URL-encoded middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Debug logging ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
  next();
});

// --- Serve uploaded files ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/api/entries", entryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leads", leadsRoutes);

// --- Health check route ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Connect to MongoDB ---
connectDB();

// --- Start server on dynamic port ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// --- Global error handler for CORS and other errors ---
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  if (err.message.includes("CORS")) {
    return res.status(403).json({ status: "error", message: err.message });
  }
  res.status(500).json({ status: "error", message: err.message || "Internal Server Error" });
});
