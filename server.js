import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js";
import entryRoutes from "./routes/entries.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

app.use("/api/entries", entryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
