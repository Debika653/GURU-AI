import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface MisconceptionDiagnosis {
  misconception: string;
  underlyingCause: string;
  counterAnalogy: string;
  simplifiedRule: string;
  retestQuestion: string;
}

export async function diagnoseMisconception(
  concept: string,
  questionText: string,
  studentAnswer: string,
  language: string = "English"
): Promise<MisconceptionDiagnosis> {
  const fallback: MisconceptionDiagnosis = {
    misconception: "Belief that motion requires a continuous forward pushing force (Aristotelian bias).",
    underlyingCause: "Earthly intuition where friction always stops sliding objects.",
    counterAnalogy: "A curling stone on ultra-smooth ice glides with almost no slowing.",
    simplifiedRule: "Forces change motion; they are NOT required to sustain motion.",
    retestQuestion: "If a spaceship runs out of fuel in deep space, will it stop immediately or continue coasting?",
  };

  const ai = getGemini();
  if (!ai) return fallback;

  const systemPrompt = `You are a cognitive diagnostician in STEM pedagogy.
Analyze a student's incorrect or flawed answer to diagnose their root cognitive misconception.
Concept: "${concept}"
Question: "${questionText}"
Student Answer: "${studentAnswer}"
Language: "${language}"

Identify:
1. "misconception": Precise name and definition of the student's cognitive mistake.
2. "underlyingCause": Why human intuition makes this common mistake.
3. "counterAnalogy": A vivid, intuitive physical analogy that dismantles the misconception.
4. "simplifiedRule": A 1-sentence fundamental law.
5. "retestQuestion": A targeted 1-sentence checkpoint question to confirm they now understand.

Output STRICT JSON matching these 5 keys.`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Diagnose this answer: "${studentAnswer}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    if (!response || !response.text) {
      return fallback;
    }

    return parseJsonFromText<MisconceptionDiagnosis>(response.text, fallback);
  } catch (err) {
    console.warn("Misconception diagnosis caught error, using fallback:", err);
    return fallback;
  }
}

