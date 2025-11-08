import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import entryRoutes from "./routes/entryRoutes.js";

dotenv.config();
const app = express();

// --- Allowed frontend origins ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://enquiry-from.netlify.app",
];

// --- CORS middleware ---
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS policy: This origin is not allowed"));
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Logging middleware ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [${req.method}] ${req.originalUrl} from ${req.headers.origin}`);
  next();
});

// --- Routes ---
app.use("/api/entries", entryRoutes);

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Connect MongoDB ---
connectDB();

// --- Handle preflight OPTIONS requests manually ---
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", allowedOrigins.join(","));
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(200);
  }
  next();
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  if (err.message.includes("CORS")) {
    return res.status(403).json({ status: "error", message: err.message });
  }
  res.status(500).json({ status: "error", message: err.message || "Internal Server Error" });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
