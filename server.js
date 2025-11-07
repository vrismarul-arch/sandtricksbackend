import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js"; // MongoDB connection
import entryRoutes from "./routes/entries.js";

dotenv.config();
const app = express();

app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/entries", entryRoutes);

app.get("/", (req, res) => res.send("✅ Sand Art Backend is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
