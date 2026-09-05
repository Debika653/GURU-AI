import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface StudentQuestionRequest {
  userQuestion: string;
  currentConcept: string;
  topic: string;
  lessonProgress?: string;
  learnerProfile?: {
    educationalLevel?: string;
    preferredLanguage?: string;
    preferredTeachingStyle?: string;
  };
  language?: string;
}

export interface StudentQuestionResponse {
  answer: string;
  keyPoint: string;
  resumePrompt: string;
}

export async function answerStudentQuestion(req: StudentQuestionRequest): Promise<StudentQuestionResponse> {
  const { userQuestion, currentConcept, topic, learnerProfile, language = "English" } = req;
  const ai = getGemini();

  const fallbackResponse: StudentQuestionResponse = {
    answer: `Great question! In ${currentConcept || topic}, forces never cause motion by themselves—unbalanced net forces cause changes in motion (acceleration). If opposing forces cancel out, velocity stays constant!`,
    keyPoint: "Net unbalanced force causes acceleration; zero net force means constant velocity.",
    resumePrompt: "Ready to return to the interactive checkpoint question?",
  };

  if (!ai) {
    return fallbackResponse;
  }

  const systemPrompt = `You are Guru AI, a patient, encouraging AI educator answering a student's spontaneous question during a lesson.
Lesson Topic: "${topic}"
Current Concept Being Taught: "${currentConcept}"
Learner Level: "${learnerProfile?.educationalLevel || "Class 8 / Beginner"}"
Language: "${language}" (Answer naturally and fluently in this language).

CRITICAL INSTRUCTIONS:
1. "answer": Directly answer the student's question clearly, conversationally, and pedagogically in 2-3 sentences.
2. "keyPoint": Provide a 1-sentence memorable summary rule.
3. "resumePrompt": Provide a polite, seamless bridge prompt inviting the student to continue the lesson.
Output STRICT JSON:
{
  "answer": string,
  "keyPoint": string,
  "resumePrompt": string
}`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Student asked: "${userQuestion}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    if (!response || !response.text) {
      return fallbackResponse;
    }

    const parsed = parseJsonFromText<StudentQuestionResponse>(response.text, fallbackResponse);
    return parsed;
  } catch (err) {
    console.warn("Gemini question engine caught error, using fallback:", err);
    return fallbackResponse;
  }
}
