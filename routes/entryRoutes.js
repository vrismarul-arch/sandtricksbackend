// routes/entryRoutes.js

import express from "express";
import multer from "multer";
import { addEntry } from "../controllers/entries.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// 🛠️ FIX: Explicit OPTIONS handler for CORS preflight
// This ensures the browser gets the required CORS headers before the POST.
router.options("/add", (req, res) => {
  // The global app.use(cors) middleware handles the headers.
  // We simply respond with a successful status to signal to the browser that
  // the actual POST request is allowed.
  res.sendStatus(200); 
});

// POST /api/entries/add (The actual file upload route)
router.post("/add", upload.array("images", 5), addEntry);

export default router;