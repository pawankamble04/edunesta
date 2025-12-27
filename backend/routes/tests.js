import express from "express";
import { protect } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";

import {
  createTest,
  getTest,
  publishTest,
  listTests,
  deleteTest,
  listPublishedTests, // ✅ ADD
} from "../controllers/testController.js";

const router = express.Router();

/* TEACHER / ADMIN */
router.post("/", protect, permit("teacher", "admin"), createTest);
router.get("/", protect, listTests);
router.post("/:id/publish", protect, permit("teacher", "admin"), publishTest);
router.delete("/:id", protect, permit("teacher", "admin"), deleteTest);

/* STUDENT */
router.get(
  "/published",
  protect,
  permit("student"),
  listPublishedTests
);

/* KEEP LAST */
router.get("/:id", protect, getTest);

export default router;
