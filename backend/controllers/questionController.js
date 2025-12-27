import Question from "../models/Question.js";

export const addQuestion = async (req, res) => {
  const { testId, text, options, correctAnswers, marks, topic } = req.body;

  if (!testId) {
    return res.status(400).json({ message: "Test ID is required" });
  }

  if (!text || !options || options.length < 2) {
    return res.status(400).json({ message: "Invalid question data" });
  }

  if (!correctAnswers || correctAnswers.length !== 1) {
    return res
      .status(400)
      .json({ message: "Exactly one correct answer is required" });
  }

  const question = await Question.create({
    test: testId,
    text,
    topic,
    options,
    correctAnswer: Number(correctAnswers[0]), // ✅ frontend checkbox index
    marks: Number(marks) || 1,
  });

  res.json(question);
};

export const getQuestionsByTest = async (req, res) => {
  const questions = await Question.find({ test: req.params.testId });
  res.json(questions);
};
