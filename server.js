import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import entryRoutes from "./routes/entryRoutes.js";

dotenv.config();
const app = express();

// --- CORS ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://enquiry-from.netlify.app",
  "https://your-live-frontend.com", // replace with your live domain
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS policy: This origin is not allowed"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Logging ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl}`);
  next();
});

// --- Ensure uploads folder exists ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// --- Serve uploads ---
app.use("/uploads", express.static(uploadDir));

// --- Routes ---
app.use("/api/entries", entryRoutes);

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Connect MongoDB ---
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
