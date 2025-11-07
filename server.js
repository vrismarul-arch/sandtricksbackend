// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes & DB
import entryRoutes from "./routes/entryRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

// --- CORS ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://enquiry-from.netlify.app", // Your live frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked CORS for origin:", origin);
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  credentials: true,
}));

// --- JSON & URL-encoded ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Logging ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
  next();
});

// --- Serve uploads ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/api/entries", entryRoutes);

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- DB connection ---
connectDB();

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  if (err.message.includes("CORS")) return res.status(403).json({ status: "error", message: err.message });
  res.status(500).json({ status: "error", message: err.message || "Internal Server Error" });
});