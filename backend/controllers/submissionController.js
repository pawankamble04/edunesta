import Submission from "../models/Submission.js";
import Question from "../models/Question.js";
import ExcelJS from "exceljs";

/* ================================
   STUDENT SUBMITS TEST (FIXED ONLY HERE)
================================ */
export const submitTest = async (req, res) => {
  const { testId, answers } = req.body;

  if (!testId || !answers) {
    return res.status(400).json({ message: "Test ID and answers are required" });
  }

  // ✅ Fetch questions in stable order
  const questions = await Question.find({ test: testId }).sort({ _id: 1 });

  let score = 0;
  const normalizedAnswers = [];

  questions.forEach((q, index) => {
    // Frontend sends index-based answers
    const selected = answers[index];

    if (selected === undefined) return;

    const isCorrect = selected === q.correctAnswer;

    if (isCorrect) {
      score += q.marks;
    }

    normalizedAnswers.push({
      question: q._id,   // ✅ ObjectId (FIX)
      selected,
      isCorrect,
    });
  });

  await Submission.create({
    student: req.user.id,
    test: testId,
    answers: normalizedAnswers,
    score,
  });

  res.json({ score });
};

/* ================================
   TEACHER – VIEW SUBMISSIONS
   (UNCHANGED)
================================ */
export const getSubmissionsForTest = async (req, res) => {
  const submissions = await Submission.find({ test: req.params.testId })
    .populate("student", "name email")
    .populate("test", "title totalMarks");

  res.json(submissions);
};

/* ================================
   STUDENT – VIEW OWN RESULTS
   (UNCHANGED)
================================ */
export const getMyResults = async (req, res) => {
  const results = await Submission.find({ student: req.user.id })
    .populate("test", "title durationMinutes");

  res.json(results);
};

/* ================================
   TEACHER – EXPORT EXCEL
   (UNCHANGED)
================================ */
export const exportSubmissionsExcel = async (req, res) => {
  try {
    const { testId } = req.params;

    const submissions = await Submission.find({ test: testId })
      .populate("student", "name email")
      .populate("test", "title totalMarks");

    if (!submissions.length) {
      return res.status(404).json({ message: "No submissions found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test Submissions");

    worksheet.columns = [
      { header: "Student Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Test Name", key: "test", width: 25 },
      { header: "Score", key: "score", width: 10 },
      { header: "Total Marks", key: "total", width: 15 },
      { header: "Percentage", key: "percentage", width: 15 },
      { header: "Submitted At", key: "submittedAt", width: 25 },
    ];

    submissions.forEach((s) => {
      worksheet.addRow({
        name: s.student?.name,
        email: s.student?.email,
        test: s.test?.title,
        score: s.score,
        total: s.test?.totalMarks || "-",
        percentage: s.test?.totalMarks
          ? ((s.score / s.test.totalMarks) * 100).toFixed(2) + "%"
          : "-",
        submittedAt: new Date(s.submittedAt).toLocaleString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=test-${testId}-submissions.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Excel export failed" });
  }
};
