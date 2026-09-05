import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface TeachingSegmentRequest {
  topic: string;
  currentSection: {
    id?: string;
    concept: string;
    strategy?: string;
    example?: string;
    visualType?: string;
    expectedOutcome?: string;
    checkpointQuestion?: string;
  };
  learnerProfile?: {
    educationalLevel?: string;
    preferredTeachingStyle?: string;
    existingKnowledge?: string;
    learningObjective?: string;
  };
  cycleStep?: string;
  adaptationReason?: string | null;
  difficultyLevel?: number;
  previousExplanation?: string;
  language?: string;
  sourceContext?: any;
}

export interface GeneratedTeachingSegment {
  teacherSpeech: string;
  currentSpeechScript?: string;
  conceptTitle?: string;
  introduction?: string;
  explanation?: string;
  analogy?: string;
  example?: string;
  keyTakeaway?: string;
  checkpointIntro?: string;
  subtitles: string;
  teacherTone: "calm" | "encouraging" | "inquisitive" | "supportive" | "focused";
  keyPoint?: string;
  visualSpec: {
    title: string;
    type: string;
    elements: Array<{
      label: string;
      value?: string;
      state?: string;
      highlight?: boolean;
    }>;
    formula?: string;
    keyTakeaway?: string;
    description?: string;
  };
  question: {
    text: string;
    type: "MCQ" | "conceptual";
    options?: string[];
    correctIndex?: number;
    conceptTested: string;
    hint?: string;
  };
}

export async function generateTeachingSegment(req: TeachingSegmentRequest): Promise<GeneratedTeachingSegment> {
  const {
    topic,
    currentSection,
    learnerProfile,
    cycleStep = "EXPLAIN",
    adaptationReason,
    difficultyLevel = 2,
    previousExplanation,
    language = "English",
  } = req;

  const concept = currentSection?.concept || topic;
  const visualType = currentSection?.visualType || "physics-force";
  const isAdaptiveCorrection = cycleStep === "REEXPLAIN" || Boolean(adaptationReason);

  const fallbackIntroduction = `Welcome! Today we are exploring the foundational principles of ${concept}.`;
  const fallbackExplanation = `In physics, an object naturally tends to preserve its current state of motion. If it is resting, it remains at rest; if it is moving with a certain speed in a straight line, it continues gliding along that path forever unless an unbalanced external net force acts upon it. Crucially, forces do not cause velocity; forces cause acceleration, which is a change in velocity.`;
  const fallbackAnalogy = `To build an intuition, imagine a polished hockey puck sliding across a perfectly smooth, frictionless lake of ice. Once given an initial gentle push, you do not need to keep pushing it. It glides forward endlessly at constant speed because there is no friction or external force to slow it down.`;
  const fallbackExample = `You experience this every day when riding inside a bus or metro train. When the bus is moving at fifty kilometers per hour and suddenly hits the brakes, your upper body lunges forward. That is not an invisible force pulling you forward; it is simply your body's inertia attempting to maintain its constant forward velocity while the bus floor halts beneath you.`;
  const fallbackKeyTakeaway = `In physics, mass naturally resists any change to its state of motion, a fundamental property known as inertia. Zero net force always means zero acceleration.`;
  const fallbackCheckpointIntro = `Now let's see if you've understood the core physics with a quick checkpoint question.`;

  const fallbackSpeechScript = [
    fallbackIntroduction,
    fallbackExplanation,
    fallbackAnalogy,
    fallbackExample,
    `So the key idea is: ${fallbackKeyTakeaway}`,
    fallbackCheckpointIntro,
  ].join("\n\n");

  const fallbackSegment: GeneratedTeachingSegment = {
    conceptTitle: concept,
    introduction: fallbackIntroduction,
    explanation: fallbackExplanation,
    analogy: fallbackAnalogy,
    example: fallbackExample,
    keyTakeaway: fallbackKeyTakeaway,
    checkpointIntro: fallbackCheckpointIntro,
    currentSpeechScript: fallbackSpeechScript,
    teacherSpeech: fallbackSpeechScript,
    subtitles: fallbackKeyTakeaway,
    teacherTone: "encouraging",
    keyPoint: fallbackKeyTakeaway,
    visualSpec: {
      title: `${concept} Dynamics`,
      type: visualType,
      elements: [
        { label: "Normal Force (Fn)", value: "+98 N", state: "balanced", highlight: true },
        { label: "Gravity Force (Fg)", value: "-98 N", state: "balanced", highlight: true },
        { label: "Net Unbalanced Force", value: "ΣF = 0", state: "constant velocity", highlight: false },
      ],
      formula: "ΣF = 0 ⟹ a = 0",
      keyTakeaway: "Zero net force means constant velocity (or remaining at rest).",
      description: "Free-body force diagram showing vertical equilibrium.",
    },
    question: {
      text: "Imagine an astronaut in deep space throws a wrench. There is no air resistance and no nearby gravity. What will happen to the wrench after leaving their hand?",
      type: "MCQ",
      options: [
        "It will gradually slow down and come to a stop.",
        "It will continue moving forever at constant velocity in a straight line.",
        "It will fall downward immediately.",
        "It will speed up because there is no friction to hold it back.",
      ],
      correctIndex: 1,
      conceptTested: "Newton's First Law (Inertia in Zero Gravity)",
      hint: "Consider whether any external net force acts on the wrench once it is released.",
    },
  };

  const ai = getGemini();
  if (!ai) {
    return fallbackSegment;
  }

  const durationGuidance = isAdaptiveCorrection
    ? `TARGET DURATION FOR ADAPTIVE CORRECTION:
- Misconception detected: "${adaptationReason}".
- Provide a targeted, shorter 20–45 second spoken re-explanation (approx 70–110 spoken words).
- DO NOT repeat the entire lesson. Directly dismantle the misconception using a fresh everyday intuition, followed by a brief verification transition.`
    : `TARGET DURATION FOR NORMAL LESSON:
- Teach this concept as a real teacher would teach a student.
- DO NOT answer in one or two sentences.
- Generate approximately 45–90 seconds of spoken teaching content (approx 170–240 spoken words across the structured sections).
- Do not artificially pad with repetitive filler; provide genuine pedagogical depth: clear explanation, intuition/analogy, real-world example, key takeaway, and checkpoint transition.`;

  const systemPrompt = `You are Guru AI, an elite, warm, articulate, and human-like educator.
You are teaching the concept: "${concept}" within topic "${topic}".
Learner Profile:
- Educational Level: "${learnerProfile?.educationalLevel || "Class 8 / Beginner"}"
- Preferred Style: "${learnerProfile?.preferredTeachingStyle || "Example-driven"}"
- Language: "${language}". Deliver natural, fluent teaching in this language.
- Current Difficulty Level (1-5): ${difficultyLevel}
- Pedagogical Step: "${cycleStep}"

${durationGuidance}

SUBJECT-SPECIFIC PEDAGOGICAL STRUCTURE:
- Physics: Concept breakdown ➔ Physical intuition ➔ Everyday real-world example ➔ Core takeaway ➔ Checkpoint question.
- Mathematics: Concept explanation ➔ Intuitive mental model ➔ Step-by-step worked scenario ➔ Core takeaway ➔ Checkpoint question.
- Programming / Computer Science: Concept breakdown ➔ Execution mental model ➔ Concrete code scenario/output ➔ Core takeaway ➔ Checkpoint question.
- Biology: Biological mechanism ➔ Structural analogy ➔ Living organism real-world example ➔ Core takeaway ➔ Checkpoint question.
- History / General: Context and principle ➔ Memorable analogy ➔ Concrete historical event/cause-effect ➔ Core takeaway ➔ Checkpoint question.

OUTPUT SCHEMA (STRICT JSON):
{
  "conceptTitle": "${concept}",
  "introduction": "Warm introduction to the concept (1-2 sentences)",
  "explanation": "Simple, clear, and comprehensive breakdown explaining the core principle and how it works (3-5 spoken sentences).",
  "analogy": "Intuitive physical, everyday, or mental metaphor that makes the abstract concept immediately click (2-3 spoken sentences).",
  "example": "Vivid concrete real-world application or scenario illustrating the principle in action (2-3 spoken sentences).",
  "keyTakeaway": "Crisp, memorable summary of the single most essential rule or insight (1-2 spoken sentences).",
  "checkpointIntro": "Natural verbal transition to the checkpoint question, e.g. 'Now let's check your understanding with a quick checkpoint question.'",
  "teacherTone": "encouraging",
  "visualSpec": {
    "title": "${concept} Dynamics",
    "type": "${visualType}",
    "elements": [
      { "label": "string", "value": "string", "state": "string", "highlight": true }
    ],
    "formula": "optional formula string",
    "keyTakeaway": "core visual insight",
    "description": "brief description of diagram"
  },
  "question": {
    "text": "Targeted conceptual multiple choice question prompt",
    "type": "MCQ",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "conceptTested": "${concept}",
    "hint": "Pedagogical guiding clue"
  }
}`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Generate the full interactive teaching segment for "${concept}" in ${language}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.35,
      },
    });

    if (!response || !response.text) {
      return fallbackSegment;
    }

    const parsed = parseJsonFromText<any>(response.text, fallbackSegment);

    // Combine structured sections locally into one coherent currentSpeechScript
    const scriptParts: string[] = [
      parsed.introduction || `Let's understand ${parsed.conceptTitle || concept}.`,
      parsed.explanation || "",
      parsed.analogy || "",
      parsed.example || "",
      parsed.keyTakeaway ? `So the essential takeaway is: ${parsed.keyTakeaway}` : "",
      parsed.checkpointIntro || "Now let's check your understanding with a quick question.",
    ].filter(Boolean);

    const currentSpeechScript = scriptParts.join("\n\n");

    const completeSegment: GeneratedTeachingSegment = {
      conceptTitle: parsed.conceptTitle || concept,
      introduction: parsed.introduction || fallbackIntroduction,
      explanation: parsed.explanation || fallbackExplanation,
      analogy: parsed.analogy || fallbackAnalogy,
      example: parsed.example || fallbackExample,
      keyTakeaway: parsed.keyTakeaway || fallbackKeyTakeaway,
      checkpointIntro: parsed.checkpointIntro || fallbackCheckpointIntro,
      currentSpeechScript,
      teacherSpeech: currentSpeechScript,
      subtitles: parsed.keyTakeaway || fallbackKeyTakeaway,
      teacherTone: parsed.teacherTone || "encouraging",
      keyPoint: parsed.keyTakeaway || fallbackKeyTakeaway,
      visualSpec: parsed.visualSpec || fallbackSegment.visualSpec,
      question: parsed.question || fallbackSegment.question,
    };

    return completeSegment;
  } catch (err) {
    console.warn("Gemini teaching engine caught error, using fallback segment:", err);
    return fallbackSegment;
  }
}
