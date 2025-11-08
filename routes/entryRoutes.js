import express from "express";
import { addEntry, getAllEntries } from "../controllers/entries.js";

const router = express.Router();

// POST (No multer, JSON only)
router.post("/add", addEntry);

// GET
router.get("/all", getAllEntries);

export default router;
