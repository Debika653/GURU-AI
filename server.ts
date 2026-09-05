import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import { generateLessonPlan } from "./server/gemini/lessonPlanner";
import { generateTeachingSegment } from "./server/gemini/teachingEngine";
import { answerStudentQuestion } from "./server/gemini/questionEngine";
import { evaluateStudentAnswer } from "./server/gemini/evaluationEngine";
import { diagnoseMisconception } from "./server/gemini/misconceptionEngine";
import { planVisual } from "./server/gemini/visualPlanner";
import { generateFinalAssessment, generateLearningReport } from "./server/gemini/assessmentEngine";
import { generateLearningPath } from "./server/gemini/learningPathEngine";
import { analyzeEducationalMaterial } from "./server/gemini/materialAnalyzer";
import { generateTTSAudio } from "./server/gemini/ttsEngine";

dotenv.config();

const app = express();
const PORT = 3000;

// CORS headers for iframe embedding and cross-origin asset loading
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Payload limit for document ingestion & base64 notes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. Analyze Document/Material
app.post("/api/analyze-material", async (req: Request, res: Response) => {
  try {
    const result = await analyzeEducationalMaterial(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/analyze-material:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Generate Lesson Plan
app.post("/api/generate-lesson-plan", async (req: Request, res: Response) => {
  try {
    const plan = await generateLessonPlan(req.body);
    res.json({ success: true, plan });
  } catch (error: any) {
    console.error("Error in /api/generate-lesson-plan:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Teaching Cycle (Explain, Teach, Adapt, Retest)
app.post("/api/teaching-cycle", async (req: Request, res: Response) => {
  try {
    const segment = await generateTeachingSegment(req.body);
    res.json({ success: true, segment });
  } catch (error: any) {
    console.error("Error in /api/teaching-cycle:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Evaluate Student Answer & Diagnose Misconception
app.post("/api/evaluate-answer", async (req: Request, res: Response) => {
  try {
    const evaluation = await evaluateStudentAnswer(req.body);
    res.json({ success: true, evaluation });
  } catch (error: any) {
    console.error("Error in /api/evaluate-answer:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Ask Student Follow-up Question
app.post("/api/student-question", async (req: Request, res: Response) => {
  try {
    const result = await answerStudentQuestion(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/student-question:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Diagnose Misconception standalone
app.post("/api/diagnose-misconception", async (req: Request, res: Response) => {
  try {
    const { concept, questionText, studentAnswer, language } = req.body;
    const diagnosis = await diagnoseMisconception(concept, questionText, studentAnswer, language);
    res.json({ success: true, diagnosis });
  } catch (error: any) {
    console.error("Error in /api/diagnose-misconception:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Plan Blackboard Visual
app.post("/api/plan-visual", async (req: Request, res: Response) => {
  try {
    const visual = await planVisual(req.body);
    res.json({ success: true, visual });
  } catch (error: any) {
    console.error("Error in /api/plan-visual:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Generate Final Assessment
app.post("/api/generate-assessment", async (req: Request, res: Response) => {
  try {
    const assessment = await generateFinalAssessment(req.body);
    res.json({ success: true, assessment });
  } catch (error: any) {
    console.error("Error in /api/generate-assessment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Generate Diagnostic Learning Report
app.post("/api/generate-report", async (req: Request, res: Response) => {
  try {
    const report = await generateLearningReport(req.body);
    res.json({ success: true, report });
  } catch (error: any) {
    console.error("Error in /api/generate-report:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Generate Learning Path Roadmap
app.post("/api/generate-learning-path", async (req: Request, res: Response) => {
  try {
    const pathResult = await generateLearningPath(req.body);
    res.json({ success: true, path: pathResult });
  } catch (error: any) {
    console.error("Error in /api/generate-learning-path:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Speech TTS Audio Endpoint (Gemini TTS)
app.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body;
    const ttsResult = await generateTTSAudio(text, voiceName);
    if (ttsResult && ttsResult.audioBase64) {
      res.json({
        success: true,
        audioBase64: ttsResult.audioBase64,
        mimeType: ttsResult.mimeType || "audio/wav",
      });
    } else {
      res.json({ success: false, fallback: true });
    }
  } catch (error: any) {
    console.warn("TTS generation note:", error.message);
    res.json({ success: false, fallback: true, error: error.message });
  }
});

// Vite middleware & production static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Teacher Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
