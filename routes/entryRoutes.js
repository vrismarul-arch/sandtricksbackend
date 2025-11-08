import express from "express";
import { addEntry, getAllEntries } from "../controllers/entries.js";

const router = express.Router();

// --- POST route ---
router.post("/add", addEntry);

// --- GET: fetch all entries ---
router.get("/all", getAllEntries);

// --- Preflight (optional) ---
router.options("/add", (req, res) => res.sendStatus(200));

export default router;
