import express from "express";
import multer from "multer";
import { addEntry } from "../controllers/entries.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.options("/add", (req, res) => res.sendStatus(200)); // preflight
router.post("/add", upload.array("images", 5), addEntry);

export default router;
