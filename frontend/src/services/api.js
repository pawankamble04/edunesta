import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Global error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* =========================
   AI APIs
========================= */

export const aiQuestionReview = (data) =>
  API.post("/ai/question-review", data);

export const aiWeakTopicSummary = (studentId) =>
  API.post("/ai/weak-topic-summary", { studentId });

export const aiNextSteps = (stats) =>
  API.post("/ai/next-steps", { stats });

/* =========================
   Extra API
========================= */
API.deleteTest = (testId) => API.delete(`/tests/${testId}`);

export default API;
