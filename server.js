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
const allowedOrigins = [
  "http://localhost:5173",             // React dev
     // Production
  "https://enquiry-from.netlify.app/",    // Production
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// --- JSON parsing middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Debug logging middleware ---
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// --- Serve static files (if needed) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/api/entries", entryRoutes);


// --- Health check route ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Connect to database ---
connectDB();

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
