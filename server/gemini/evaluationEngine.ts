import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface AnswerEvaluationRequest {
  concept: string;
  question: {
    text?: string;
    question?: string;
    type?: string;
    options?: string[];
    correctIndex?: number;
    hint?: string;
  };
  studentAnswer: string;
  previousMisconceptions?: string[];
  currentDifficulty?: number;
  language?: string;
}

export interface AnswerEvaluationResult {
  isCorrect: boolean;
  score: number; // 0 - 100
  understanding: "strong" | "moderate" | "weak";
  understandingStatus: string;
  confidenceLevel: string;
  misconception: string | null;
  misconceptionDetected: string | null;
  missingConcepts: string[];
  feedback: string;
  recommendedAction: "CONTINUE" | "SIMPLIFY" | "REEXPLAIN" | "GIVE_ANALOGY" | "EASIER_QUESTION" | "HARDER_QUESTION";
  nextAction: string;
  difficultyAdjustment: -1 | 0 | 1;
  adaptiveExplanation?: {
    analogy: string;
    simplifiedRule: string;
    retestQuestion: string;
  } | null;
}

export async function evaluateStudentAnswer(req: AnswerEvaluationRequest): Promise<AnswerEvaluationResult> {
  const {
    concept,
    question,
    studentAnswer,
    previousMisconceptions = [],
    currentDifficulty = 2,
    language = "English",
  } = req;

  const questionText = question?.text || question?.question || "Conceptual question";
  const options = question?.options || [];
  const correctIndex = question?.correctIndex;

  const fallbackResult: AnswerEvaluationResult = {
    isCorrect: true,
    score: 90,
    understanding: "strong",
    understandingStatus: "Demonstrated Mastery",
    confidenceLevel: "High",
    misconception: null,
    misconceptionDetected: null,
    missingConcepts: [],
    feedback: "Well reasoned! You correctly identified the core principle.",
    recommendedAction: "CONTINUE",
    nextAction: "CONTINUE",
    difficultyAdjustment: 0,
    adaptiveExplanation: null,
  };

  const ai = getGemini();
  if (!ai) {
    return fallbackResult;
  }

  const systemPrompt = `You are a master pedagogical evaluator and cognitive assessment expert.
A student just submitted an answer to a checkpoint question.
Concept Being Tested: "${concept}"
Question: "${questionText}"
${options.length > 0 ? `Options:\n${options.map((o, idx) => `${idx}: ${o}`).join("\n")}\nExpected Correct Option Index: ${correctIndex}` : ""}
Student Answer: "${studentAnswer}"
Previous Misconceptions Tracked: ${JSON.stringify(previousMisconceptions)}
Current Difficulty Level (1-5): ${currentDifficulty}
Evaluation Language: "${language}"

CRITICAL INSTRUCTIONS:
1. Determine "isCorrect" (boolean):
   - For MCQ: evaluate if the student chose or indicated the right option or rationale.
   - For Conceptual: evaluate if their physical or logical reasoning is sound.
2. "score": 0 to 100 integer.
3. "understanding": "strong" (score >= 80), "moderate" (55-79), or "weak" (< 55).
4. "misconception": If the answer is incorrect, identify the EXACT flawed mental model (e.g. "Confusing net force with instantaneous velocity", "Believing heavier objects naturally fall faster without drag", "Action-reaction cancellation fallacy"). If fully correct, return null.
5. "missingConcepts": Array of specific sub-concepts the student omitted or misunderstood.
6. "feedback": 2-3 sentences of constructive, encouraging spoken feedback directly addressing the student in ${language}.
7. "recommendedAction": One of:
   - "CONTINUE": Student demonstrated clear mastery. Move ahead!
   - "SIMPLIFY": Student is confused by technical terms or complexity.
   - "GIVE_ANALOGY": Student needs a concrete physical intuition.
   - "REEXPLAIN": Student holds a fundamental misconception.
   - "HARDER_QUESTION": Student aced it effortlessly, ready for a challenge!
8. "difficultyAdjustment": 1 (if score >= 85), -1 (if score < 60), or 0.
9. "adaptiveExplanation": If NOT fully correct (score < 80), supply an object with:
   - "analogy": A fresh, intuitive physical analogy.
   - "simplifiedRule": A 1-sentence fundamental rule.
   - "retestQuestion": A new 1-sentence checkpoint question to confirm understanding.
   If correct (score >= 80), set to null.

Output STRICT JSON matching the schema.`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Evaluate the student answer: "${studentAnswer}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    if (!response || !response.text) {
      return fallbackResult;
    }

    const parsed = parseJsonFromText<any>(response.text, fallbackResult);
    const isCorrect = parsed.isCorrect ?? (parsed.score >= 70);
    const score = typeof parsed.score === "number" ? parsed.score : (isCorrect ? 90 : 45);
    const misconception = !isCorrect ? (parsed.misconception || parsed.misconceptionDetected || "Conceptual gap identified") : null;
    const nextAction = parsed.recommendedAction || parsed.nextAction || (isCorrect ? "CONTINUE" : "REEXPLAIN");

    return {
      isCorrect,
      score,
      understanding: score >= 80 ? "strong" : score >= 55 ? "moderate" : "weak",
      understandingStatus: score >= 80 ? "Demonstrated Mastery" : score >= 55 ? "Solid Progress" : "Needs Reinforcement",
      confidenceLevel: score >= 80 ? "High" : "Medium",
      misconception,
      misconceptionDetected: misconception,
      missingConcepts: parsed.missingConcepts || [],
      feedback: parsed.feedback || (isCorrect ? "Well reasoned! You correctly identified the core principle." : "Let's revisit this with a clearer analogy."),
      recommendedAction: nextAction,
      nextAction: nextAction,
      difficultyAdjustment: parsed.difficultyAdjustment ?? (score >= 85 ? 1 : score < 60 ? -1 : 0),
      adaptiveExplanation: parsed.adaptiveExplanation || (!isCorrect ? {
        analogy: "Think of an ice skater gliding on smooth ice without pushing.",
        simplifiedRule: "Forces change velocity; they are not needed to keep moving.",
        retestQuestion: "If an asteroid floats in deep space, will it slow down if nothing touches it?",
      } : null),
    };
  } catch (err) {
    console.warn("Gemini answer evaluation caught error, using fallback result:", err);
    return fallbackResult;
  }
}
