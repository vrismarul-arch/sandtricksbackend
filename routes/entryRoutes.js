import express from "express";
import multer from "multer";
import { addEntry } from "../controllers/entries.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// Preflight
router.options("/add", (req, res) => res.sendStatus(200));

// POST route for adding entry
router.post("/add", upload.array("images", 5), addEntry);

export default router;
