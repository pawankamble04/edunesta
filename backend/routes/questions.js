import express from "express";
import { protect } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";

import {
  addQuestion,
  getQuestionsByTest,
} from "../controllers/questionController.js";

const router = express.Router();

// ✅ FIXED: frontend uses POST /questions
router.post("/", protect, permit("teacher"), addQuestion);

// Fetch questions by test
router.get("/:testId", protect, getQuestionsByTest);

export default router;
