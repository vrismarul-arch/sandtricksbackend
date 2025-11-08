import dotenv from "dotenv";
dotenv.config(); // must come first

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import entryRoutes from "./routes/entries.js";

const app = express();

app.use(cors({
origin: ["https://enquiry-from.netlify.app", "http://localhost:5173"],    methods: ["GET","POST","OPTIONS"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/entries", entryRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
