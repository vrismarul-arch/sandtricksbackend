import express from "express";
import { addEntry, testEmail } from "../controllers/entryController.js";

const router = express.Router();

router.post("/add", addEntry);
router.get("/test-email", testEmail);

export default router;
