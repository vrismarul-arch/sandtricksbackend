import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js"; // MongoDB connection
import entryRoutes from "./routes/entries.js";

dotenv.config();
const app = express();

// --- Global CORS for all origins ---
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// --- Middleware ---
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// --- Routes ---
app.use("/api/entries", entryRoutes);

// --- Root test route ---
app.get("/", (req, res) => res.send("✅ Sand Art Backend is running"));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
