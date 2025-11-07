import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import entryRoutes from "./routes/entries.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Middleware ---
app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json());

// --- Static uploads folder ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API routes ---
app.use("/api/entries", entryRoutes);

// --- Health check ---
app.get("/", (req, res) => res.send("✅ Sand Art Backend Running"));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
