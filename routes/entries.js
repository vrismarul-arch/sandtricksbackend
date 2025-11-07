import express from "express";
import multer from "multer";
import { addEntry } from "../controllers/entries.js";

const router = express.Router();

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// --- POST route ---
router.post("/add", upload.array("images", 5), addEntry);

export default router;
