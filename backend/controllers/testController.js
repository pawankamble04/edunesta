import Test from "../models/Test.js";
import Question from "../models/Question.js";
import Submission from "../models/Submission.js";

export const createTest = async (req, res) => {
  const test = await Test.create({
    ...req.body,
    createdBy: req.user.id,
  });
  res.json(test);
};

export const getTest = async (req, res) => {
  const test = await Test.findById(req.params.id).populate("questions");
  res.json(test);
};

export const publishTest = async (req, res) => {
  const test = await Test.findById(req.params.id);
  test.isPublished = true;
  await test.save();
  res.json(test);
};

/* =========================
   ✅ FIXED: ONLY OWN TESTS
========================= */
export const listTests = async (req, res) => {
  const tests = await Test.find({ createdBy: req.user.id });
  res.json(tests);
};

/* =========================
   ✅ DELETE OWN TEST ONLY
========================= */
export const deleteTest = async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    return res.status(404).json({ message: "Test not found" });
  }

  // 🔐 Ownership check (STRICT)
  if (test.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to delete this test" });
  }

  // 🧹 Cascade delete
  await Question.deleteMany({ test: test._id });
  await Submission.deleteMany({ test: test._id });

  await test.deleteOne();

  res.json({ message: "Test deleted successfully" });
};
// ✅ STUDENT: list only published tests
export const listPublishedTests = async (req, res) => {
  const tests = await Test.find({ isPublished: true });
  res.json(tests);
};
