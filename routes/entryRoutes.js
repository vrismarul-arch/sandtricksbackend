import express from "express";
import { addEntry, getAllEntries } from "../controllers/entries.js";

const router = express.Router();

// POST /api/entries/add
router.post("/add", addEntry);
router.options("/add", (req, res) => res.sendStatus(200));

// GET /api/entries
router.get("/", getAllEntries);

export default router;
