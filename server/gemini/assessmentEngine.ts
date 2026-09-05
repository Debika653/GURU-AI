import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface GenerateAssessmentRequest {
  topic: string;
  conceptsCovered?: string[];
  learnerLevel?: string;
  language?: string;
}

export interface AssessmentQuestionItem {
  id: string;
  concept: string;
  type: "MCQ" | "conceptual";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  explanation: string;
}

export interface GeneratedAssessment {
  topic: string;
  duration: string;
  questions: AssessmentQuestionItem[];
}

export interface LearningReportOutput {
  topic: string;
  overallScore: number;
  letterGrade: string;
  masteryStatus: string;
  strongAreas: Array<{ concept: string; score: number; comment: string }>;
  needsImprovement: Array<{ concept: string; score: number; comment: string }>;
  detectedMisconceptions: Array<{
    misconception: string;
    explanation: string;
    correctedUnderstanding: string;
  }>;
  recommendedRevision: string[];
  nextRecommendedTopics: Array<{
    title: string;
    reason: string;
    difficulty: string;
  }>;
}

export async function generateFinalAssessment(req: GenerateAssessmentRequest): Promise<GeneratedAssessment> {
  const { topic, conceptsCovered = [], learnerLevel = "Class 8 / Beginner", language = "English" } = req;
  const ai = getGemini();

  const fallback: GeneratedAssessment = {
    topic: topic || "Newton's Laws of Motion",
    duration: "10 minutes",
    questions: [
      {
        id: "q-1",
        concept: conceptsCovered[0] || "Newton's First Law (Inertia)",
        type: "MCQ",
        prompt: "A hockey puck slides across frictionless ice at 5 m/s. If no external horizontal forces act on it, what is its speed after 10 seconds?",
        options: [
          "It slows down to 0 m/s because motion requires force.",
          "Exactly 5 m/s in the same direction.",
          "It accelerates because there is no friction.",
          "It circles around due to inertia.",
        ],
        correctIndex: 1,
        explanation: "By Newton's First Law, an object in motion maintains constant velocity unless acted upon by an unbalanced net force.",
      },
      {
        id: "q-2",
        concept: conceptsCovered[1] || "Newton's Second Law (F = ma)",
        type: "MCQ",
        prompt: "If a constant net force F acts on a cart of mass m producing acceleration a, what happens to acceleration if mass is doubled to 2m with the same force?",
        options: [
          "Acceleration doubles (2a).",
          "Acceleration is cut in half (a / 2).",
          "Acceleration remains unchanged.",
          "Acceleration becomes zero.",
        ],
        correctIndex: 1,
        explanation: "Since a = F / m, doubling the denominator cuts the acceleration in half.",
      },
      {
        id: "q-3",
        concept: conceptsCovered[2] || "Newton's Third Law (Action-Reaction)",
        type: "MCQ",
        prompt: "A massive truck collides head-on with a tiny mosquito. Which experiences the greater magnitude of collision force?",
        options: [
          "The truck experiences more force because of its huge mass.",
          "The mosquito experiences more force because it gets crushed.",
          "Both experience exactly the same magnitude of force.",
          "Neither experiences force; momentum simply transfers.",
        ],
        correctIndex: 2,
        explanation: "By Newton's Third Law, the force exerted by the truck on the mosquito is exactly equal in magnitude and opposite in direction to the force exerted by the mosquito on the truck.",
      },
    ],
  };

  if (!ai) return fallback;

  const systemPrompt = `You are an educational measurement and psychometrics specialist.
Generate a high-quality, comprehensive final assessment covering the concepts taught in:
Topic: "${topic}"
Concepts Covered: ${JSON.stringify(conceptsCovered)}
Learner Level: "${learnerLevel}"
Language: "${language}"

CRITICAL INSTRUCTIONS:
1. Create 3 to 4 discerning questions testing deep conceptual understanding (not just rote memory).
2. Each question should be MCQ with 4 plausible options, targeting common student misconceptions in distractors.
3. Output STRICT JSON:
{
  "topic": string,
  "duration": "10 minutes",
  "questions": [
    {
      "id": string,
      "concept": string,
      "type": "MCQ",
      "prompt": string,
      "options": [string, string, string, string],
      "correctIndex": integer (0 to 3),
      "explanation": string
    }
  ]
}`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Generate the final assessment for "${topic}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.25,
      },
    });

    if (!response || !response.text) {
      return fallback;
    }

    return parseJsonFromText<GeneratedAssessment>(response.text, fallback);
  } catch (err) {
    console.warn("Assessment generation caught error, using fallback:", err);
    return fallback;
  }
}

export async function generateLearningReport(data: {
  topic: string;
  learnerProfile?: any;
  assessmentResults: {
    totalQuestions: number;
    score: number;
    answers: Array<{ questionId: string; answer: string; isCorrect: boolean }>;
  };
  sessionMetrics?: any;
  language?: string;
}): Promise<LearningReportOutput> {
  const { topic, assessmentResults, learnerProfile, language = "English" } = data;
  const score = assessmentResults?.score ?? 85;

  let grade = "B+";
  let status = "Competent Mastery";
  if (score >= 90) { grade = "A+"; status = "Advanced Concept Mastery"; }
  else if (score >= 80) { grade = "A"; status = "Solid Comprehension"; }
  else if (score >= 70) { grade = "B"; status = "Developing Fluency"; }
  else if (score >= 50) { grade = "C"; status = "Foundational Reinforcement Needed"; }
  else { grade = "D"; status = "Critical Remediation Recommended"; }

  const fallback: LearningReportOutput = {
    topic: topic || "Newton's Laws of Motion",
    overallScore: score,
    letterGrade: grade,
    masteryStatus: status,
    strongAreas: [
      {
        concept: "Newton's First Law (Inertia)",
        score: Math.min(score + 10, 100),
        comment: "Excellent physical intuition regarding state preservation without net force.",
      },
      {
        concept: "Action-Reaction Balance",
        score: score,
        comment: "Recognizes equal and opposite interaction pairs across distinct interacting bodies.",
      },
    ],
    needsImprovement: score < 85 ? [
      {
        concept: "Inverse Mass Proportionality in F=ma",
        score: Math.max(score - 15, 40),
        comment: "Review how varying mass scales acceleration inversely under constant force.",
      },
    ] : [],
    detectedMisconceptions: score < 85 ? [
      {
        misconception: "Heavier bodies experience greater contact force during collisions.",
        explanation: "Student confused the visual damage/acceleration with the actual interaction force magnitude.",
        correctedUnderstanding: "Newton's Third Law forces are always strictly identical in magnitude.",
      },
    ] : [],
    recommendedRevision: [
      "Review the mathematical derivation of a = F / m with varying masses.",
      "Practice 2-body collision free body diagrams.",
    ],
    nextRecommendedTopics: [
      {
        title: "Work, Energy, and Conservation Principles",
        reason: "Direct physical extension of force over displacement.",
        difficulty: "Intermediate",
      },
      {
        title: "Friction: Static vs Kinetic Dissipation",
        reason: "Crucial realistic force application to master classical mechanics.",
        difficulty: "Standard",
      },
      {
        title: "Circular Motion & Centripetal Acceleration",
        reason: "Applies F=ma to non-linear curvilinear trajectories.",
        difficulty: "Challenging",
      },
    ],
  };

  const ai = getGemini();
  if (!ai) return fallback;

  const systemPrompt = `You are a pedagogical diagnostics evaluator.
A student completed a lesson and assessment on "${topic}".
Assessment Performance:
- Score: ${score}%
- Total Questions: ${assessmentResults?.totalQuestions || 3}
- Detailed Answers: ${JSON.stringify(assessmentResults?.answers || [])}
- Learner Profile: ${JSON.stringify(learnerProfile || {})}
Language: "${language}"

CRITICAL INSTRUCTIONS:
Generate a rigorous, supportive diagnostic learning report.
Output STRICT JSON:
{
  "topic": string,
  "overallScore": number,
  "letterGrade": string ("A+", "A", "B+", "B", "C", "D"),
  "masteryStatus": string,
  "strongAreas": [
    { "concept": string, "score": number, "comment": string }
  ],
  "needsImprovement": [
    { "concept": string, "score": number, "comment": string }
  ],
  "detectedMisconceptions": [
    { "misconception": string, "explanation": string, "correctedUnderstanding": string }
  ],
  "recommendedRevision": [string],
  "nextRecommendedTopics": [
    { "title": string, "reason": string, "difficulty": string }
  ]
}`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Generate the pedagogical learning report for score ${score}%.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.25,
      },
    });

    if (!response || !response.text) {
      return fallback;
    }

    return parseJsonFromText<LearningReportOutput>(response.text, fallback);
  } catch (err) {
    console.warn("Learning report generation caught error, using fallback:", err);
    return fallback;
  }
}
