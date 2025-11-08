
import express from "express";
import cors from "cors";
import multer from "multer";
import { addEntry } from "./controllers/entries.js";

const app = express();

// ✅ CORS middleware
app.use(cors({
  origin: ["https://enquiry-from.netlify.app", "http://localhost:5173"],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle preflight OPTIONS globally
app.options("*", (req, res) => res.sendStatus(200));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Multer memory storage for Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Routes
app.post("/api/entries/add", upload.array("images", 5), addEntry);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
