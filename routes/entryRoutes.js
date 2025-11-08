import express from "express";
import multer from "multer";
import { addEntry } from "../controllers/entries.js";

const router = express.Router();

// --- Multer storage for image uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // ensure 'uploads/' folder exists
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Max 5 images
const upload = multer({ storage });

// --- POST /api/entries/add ---
// Accept multiple files under field name 'images'
router.post("/add", upload.array("images", 5), addEntry);

// --- OPTIONS preflight for CORS ---
router.options("/add", (req, res) => res.sendStatus(200));

export default router;
