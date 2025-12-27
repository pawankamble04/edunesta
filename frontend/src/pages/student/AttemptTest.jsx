import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../../services/api";

export default function AttemptTest() {
  const { testId } = useParams();

  // ✅ FETCHED QUESTIONS (instead of hard-coded)
  const [questions, setQuestions] = useState([]);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [submitted, setSubmitted] = useState(false);

  // ✅ LOAD QUESTIONS FOR THIS TEST ONLY
  useEffect(() => {
    API.get(`/questions/${testId}`)
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((err) => {
        console.error("Failed to load questions", err);
      });
  }, [testId]);

  // ⏱ TIMER (UNCHANGED)
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  // ✅ STORE ANSWER BY QUESTION ID (NOT INDEX)
  const handleSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await API.post("/submissions", {
        testId,
        answers,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Test Submitted</h1>
        <p className="mt-4">Your responses have been recorded.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <p className="text-center">Loading questions...</p>;
  }

  const q = questions[current];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between mb-4 text-sm text-gray-600">
        <p>
          Question {current + 1} / {questions.length}
        </p>
        <p>
          Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}
        </p>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">{q.text}</h2>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`block border p-2 rounded cursor-pointer ${
                answers[q._id] === i ? "border-blue-600" : ""
              }`}
            >
              <input
                type="radio"
                name="option"
                className="mr-2"
                checked={answers[q._id] === i}
                onChange={() => handleSelect(q._id, i)}
              />
              {opt}
            </label>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          {current < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
