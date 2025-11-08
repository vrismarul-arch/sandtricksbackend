import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import entryRoutes from "./routes/entryRoutes.js";

const app = express();

// ✅ CORS for Local + Live
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://enquiry-from.netlify.app"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES
app.use("/api/entries", entryRoutes);

// ✅ CONNECT DB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "sandtricks" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Database Error:", err));

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
