import express from "express";
import multer from "multer";
import { addEntry } from "../controllers/entryController.js";

const router = express.Router();

// Multer storage for images
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.post("/add", upload.array("images", 5), addEntry);

export default router;
