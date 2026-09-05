import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface LessonPlanRequest {
  topic: string;
  sourceContext?: any;
  learnerProfile?: {
    name?: string;
    educationalLevel?: string;
    existingKnowledge?: string;
    learningObjective?: string;
    preferredLanguage?: string;
    preferredTeachingStyle?: string;
    availableTime?: string;
    desiredDepth?: string;
    naturalLanguageInstruction?: string;
  };
  customInstruction?: string;
  language?: string;
}

export interface GeneratedLessonPlan {
  topic: string;
  learnerLevel: string;
  objective: string;
  language: string;
  duration: string;
  difficulty: number;
  sections: Array<{
    id: string;
    concept: string;
    strategy: string;
    example: string;
    visualType: string;
    expectedOutcome: string;
    checkpointQuestion: string;
    estimatedDuration: string;
    teacherSpeech?: string;
    subtitles?: string;
    teacherTone?: string;
    question?: any;
    visualSpec?: any;
  }>;
  teachingOrder: string[];
  assessmentPlan: string;
  sourceContext?: {
    documentName?: string;
    chapter?: string;
    section?: string;
    grounded?: boolean;
  };
  preGeneratedSegments?: Record<string, any>;
}

// Server-side in-memory cache
const planCache = new Map<string, GeneratedLessonPlan>();

function buildDynamicFallbackPlan(
  topic: string,
  level: string,
  language: string,
  duration: string,
  objective: string,
  sourceContext?: any
): GeneratedLessonPlan {
  const isNewton = /newton|motion|force|inertia/i.test(topic);

  if (isNewton) {
    return {
      topic: topic || "Newton's Laws of Motion",
      learnerLevel: level,
      objective,
      language,
      duration,
      difficulty: 2,
      sourceContext: sourceContext ? {
        documentName: sourceContext.documentName || "Curriculum Notes",
        chapter: sourceContext.selectedChapter || "Core Principles",
        grounded: true,
      } : undefined,
      sections: [
        {
          id: "sec-1",
          concept: "Inertia & The First Law",
          strategy: "Everyday inertia analogies (seatbelt, skateboard stops abruptly)",
          example: "Why you lurch forward when a bus suddenly hits the brakes",
          visualType: "physics-force",
          expectedOutcome: "Understand that an object at rest stays at rest unless acted on by an unbalanced net force",
          checkpointQuestion: "Imagine an astronaut in deep space throws a wrench. There is zero friction and no gravity nearby. What will happen to the wrench after leaving their hand?",
          estimatedDuration: "5 mins",
        },
        {
          id: "sec-2",
          concept: "Force, Mass & Acceleration (F = ma)",
          strategy: "Proportional cause and effect with shopping carts",
          example: "Pushing an empty shopping cart vs pushing one filled with 50kg of weights",
          visualType: "formula-graph",
          expectedOutcome: "Comprehend that acceleration depends directly on net force and inversely on mass",
          checkpointQuestion: "If you double the net pushing force on a cart, but also double its mass, what happens to its acceleration?",
          estimatedDuration: "7 mins",
        },
        {
          id: "sec-3",
          concept: "Action & Reaction (The Third Law)",
          strategy: "Interacting pairs demonstration with boat and dock",
          example: "Stepping off a small rowboat onto the dock and watching the boat drift backward",
          visualType: "vector-diagram",
          expectedOutcome: "Recognize that forces always occur in equal and opposite pairs acting on different bodies",
          checkpointQuestion: "When a bird flaps its wings against the air to fly upward, what is the action and what is the reaction?",
          estimatedDuration: "6 mins",
        },
      ],
      teachingOrder: ["sec-1", "sec-2", "sec-3"],
      assessmentPlan: "3 conceptual checkpoint questions followed by a comprehensive final assessment",
      preGeneratedSegments: {
        "sec-1": {
          teacherSpeech: "Welcome! Today we are mastering Newton's First Law. Picture yourself standing on a bus when the driver suddenly hits the brakes. You lurch forward—not because an invisible hand pushes you, but because your body's mass naturally wants to maintain its constant velocity! In physics, this fundamental tendency to resist changes in motion is called inertia.",
          subtitles: "Inertia is the natural tendency of an object to resist changes in its state of motion.",
          teacherTone: "encouraging",
          visualSpec: {
            title: "Newton's First Law: Zero Net Force State",
            type: "physics-force",
            description: "Equilibrium balance: Object remains in uniform motion unless unbalanced force acts.",
            formula: "ΣF = 0 ⟹ a = 0 (v = constant)",
            elements: [
              { label: "Normal Force (Fn)", value: "+98 N", state: "balanced", highlight: true },
              { label: "Gravity Force (Fg)", value: "-98 N", state: "balanced", highlight: true },
              { label: "Net Unbalanced Force", value: "ΣF = 0", state: "constant velocity", highlight: false },
            ],
            keyTakeaway: "Forces do not cause motion; forces cause changes in motion (acceleration).",
          },
          question: {
            text: "Imagine an astronaut in deep space throws a wrench. There is zero friction and no gravity nearby. What will happen to the wrench after leaving their hand?",
            type: "MCQ",
            options: [
              "It will gradually slow down and come to a stop.",
              "It will continue moving forever at constant velocity in a straight line.",
              "It will fall downward immediately.",
              "It will speed up because space has no friction.",
            ],
            correctIndex: 1,
            conceptTested: "Newton's First Law & Inertia",
            hint: "Think about whether any unbalanced external force exists in deep space.",
          },
        },
        "sec-2": {
          teacherSpeech: "Now let's examine the quantitative core of classical mechanics: Newton's Second Law, F = ma. Think about pushing an empty shopping cart versus one loaded with 50 kilograms of weights. To give both carts the exact same acceleration, the loaded cart requires vastly more force. Acceleration is directly proportional to net force, and inversely proportional to mass!",
          subtitles: "Acceleration is directly proportional to net force and inversely proportional to mass: a = F / m.",
          teacherTone: "focused",
          visualSpec: {
            title: "Newton's Second Law: Proportional Dynamics",
            type: "formula-graph",
            description: "Acceleration scales directly with net force and inversely with mass.",
            formula: "a = F_net / m",
            elements: [
              { label: "Case 1: Light Mass (m = 2 kg)", value: "F = 20 N ⟹ a = 10 m/s²", state: "rapid acceleration", highlight: true },
              { label: "Case 2: Heavy Mass (m = 20 kg)", value: "F = 20 N ⟹ a = 1 m/s²", state: "sluggish acceleration", highlight: false },
              { label: "Proportionality Rule", value: "a ∝ F and a ∝ 1/m", highlight: true },
            ],
            keyTakeaway: "Heavier objects require proportionally greater force to achieve the exact same acceleration.",
          },
          question: {
            text: "If you double the net pushing force on a cart, but also double its mass, what happens to its acceleration?",
            type: "MCQ",
            options: [
              "Acceleration doubles (2x)",
              "Acceleration quadruples (4x)",
              "Acceleration remains exactly the same (1x)",
              "Acceleration is cut in half (0.5x)",
            ],
            correctIndex: 2,
            conceptTested: "Newton's Second Law (F = ma)",
            hint: "Use the formula a = F / m. What is (2F) / (2m)?",
          },
        },
        "sec-3": {
          teacherSpeech: "Finally, let's explore Newton's Third Law: Action and Reaction. Whenever one body exerts a force on a second body, the second body simultaneously exerts a force equal in magnitude and opposite in direction on the first. Crucially: these two forces act on DIFFERENT objects, which is why they never cancel each other out!",
          subtitles: "Forces always occur in matched pairs acting on two different bodies simultaneously: F_A = -F_B.",
          teacherTone: "supportive",
          visualSpec: {
            title: "Newton's Third Law: Action-Reaction Pairs",
            type: "vector-diagram",
            description: "Simultaneous equal and opposite forces acting on TWO different objects.",
            formula: "F_(A on B) = - F_(B on A)",
            elements: [
              { label: "Action: Foot pushes Boat backward", value: "F_1 = -150 N (on boat)", state: "reaction body", highlight: true },
              { label: "Reaction: Boat pushes Foot forward", value: "F_2 = +150 N (on person)", state: "propulsion", highlight: true },
              { label: "Key Insight", value: "Forces never cancel out because they act on different bodies!", highlight: true },
            ],
            keyTakeaway: "You cannot push something without it pushing back on you with the exact same magnitude.",
          },
          question: {
            text: "When a bird flaps its wings against the air to fly upward, what is the action and what is the reaction?",
            type: "MCQ",
            options: [
              "Action: wings push air down; Reaction: air pushes wings up with equal force.",
              "Action: bird's weight pushes down; Reaction: gravity pulls down.",
              "Action: bird gains speed; Reaction: air becomes warm.",
              "Forces cannot apply to air because air is a gas.",
            ],
            correctIndex: 0,
            conceptTested: "Newton's Third Law (Action-Reaction Pairs)",
            hint: "Identify the two physical bodies interacting: the bird's wings and the surrounding air.",
          },
        },
      },
    };
  }

  // Generalized high-quality curriculum fallback for any topic
  return {
    topic: topic || "Core Principles",
    learnerLevel: level,
    objective,
    language,
    duration,
    difficulty: 2,
    sourceContext: sourceContext ? {
      documentName: sourceContext.documentName || "Uploaded Material",
      chapter: sourceContext.selectedChapter || undefined,
      grounded: true,
    } : undefined,
    sections: [
      {
        id: "sec-1",
        concept: `Foundations of ${topic}`,
        strategy: "Intuitive analogies and real-world observation",
        example: `Everyday occurrence illustrating ${topic}`,
        visualType: "concept-breakdown",
        expectedOutcome: `Grasp the foundational definition and significance of ${topic}`,
        checkpointQuestion: `In your own words, what is the single most important rule or principle behind ${topic}?`,
        estimatedDuration: "5 mins",
      },
      {
        id: "sec-2",
        concept: `Core Mechanism & Working Principles of ${topic}`,
        strategy: "Step-by-step breakdown of causes, effects, and relationships",
        example: `Concrete scenario showing how ${topic} behaves in practice`,
        visualType: "formula-graph",
        expectedOutcome: `Understand how the components of ${topic} interact systematically`,
        checkpointQuestion: `If the primary input or condition changes in ${topic}, how does the outcome adjust?`,
        estimatedDuration: "7 mins",
      },
      {
        id: "sec-3",
        concept: `Practical Applications & Edge Cases of ${topic}`,
        strategy: "Problem-solving and common misconception analysis",
        example: `Real-life problem solved using ${topic}`,
        visualType: "vector-diagram",
        expectedOutcome: `Confidently apply ${topic} to novel problems and avoid standard pitfalls`,
        checkpointQuestion: `What is a common trap or misconception people make when analyzing ${topic}?`,
        estimatedDuration: "6 mins",
      },
    ],
    teachingOrder: ["sec-1", "sec-2", "sec-3"],
    assessmentPlan: "Progressive checkpoint inquiry followed by diagnostic mastery evaluation",
    preGeneratedSegments: {
      "sec-1": {
        teacherSpeech: `Welcome to our session on ${topic}! We begin with foundational intuition. Every complex system is built on simple rules that govern how elements interact. Let's build a mental model together.`,
        subtitles: `Core principle: Understanding the fundamental definition of ${topic}.`,
        teacherTone: "encouraging",
        visualSpec: {
          title: `Foundations of ${topic}`,
          type: "concept-breakdown",
          elements: [
            { label: "Primary Concept", value: topic, highlight: true },
            { label: "Core Input", value: "Starting State", highlight: false },
            { label: "Governing Rule", value: "Conservation / Transition", highlight: true },
          ],
          keyTakeaway: `Master the base definition before exploring advanced dynamics.`,
        },
        question: {
          text: `In your own words, what is the single most important rule or principle behind ${topic}?`,
          type: "conceptual",
          conceptTested: `Foundations of ${topic}`,
          hint: "Think about the baseline definition.",
        },
      },
      "sec-2": {
        teacherSpeech: `Now that we have the foundation of ${topic}, let's look at how the mechanism actually functions in dynamic conditions. Notice how changing the primary parameter alters the resulting output.`,
        subtitles: `Working mechanism: Relationship between inputs, state changes, and outputs.`,
        teacherTone: "focused",
        visualSpec: {
          title: `Mechanism of ${topic}`,
          type: "formula-graph",
          elements: [
            { label: "Input Parameter (X)", value: "Variable", highlight: true },
            { label: "Transfer Function", value: "f(X) ⟹ Y", highlight: true },
            { label: "Resulting Output (Y)", value: "Controlled Response", highlight: false },
          ],
          keyTakeaway: `Every action or input change produces a predictable response.`,
        },
        question: {
          text: `If the primary input or condition changes in ${topic}, how does the outcome adjust?`,
          type: "conceptual",
          conceptTested: `Core Mechanism of ${topic}`,
          hint: "Trace the cause and effect directly.",
        },
      },
      "sec-3": {
        teacherSpeech: `Excellent progress! Finally, let's explore practical applications and common pitfalls. Understanding edge cases is what separates basic familiarity from true mastery.`,
        subtitles: `Practical application: Applying ${topic} to novel scenarios.`,
        teacherTone: "supportive",
        visualSpec: {
          title: `Applications of ${topic}`,
          type: "vector-diagram",
          elements: [
            { label: "Real-world Scenario", value: "Application Test", highlight: true },
            { label: "Standard Pitfall", value: "Oversimplification", highlight: false },
            { label: "Mastery Solution", value: "Systematic Analysis", highlight: true },
          ],
          keyTakeaway: `Real mastery means recognizing both standard patterns and subtle edge cases.`,
        },
        question: {
          text: `What is a common trap or misconception people make when analyzing ${topic}?`,
          type: "conceptual",
          conceptTested: `Edge Cases & Applications of ${topic}`,
          hint: "Think about assumptions that often turn out to be false.",
        },
      },
    },
  };
}

export async function generateLessonPlan(req: LessonPlanRequest): Promise<GeneratedLessonPlan> {
  const { topic, sourceContext, learnerProfile, customInstruction } = req;
  const level = learnerProfile?.educationalLevel || "Beginner";
  const language = req.language || learnerProfile?.preferredLanguage || "English";
  const duration = learnerProfile?.availableTime || "20 minutes";
  const style = learnerProfile?.preferredTeachingStyle || "Example-driven";
  const objective = learnerProfile?.learningObjective || "Understand concept";
  const knowledge = learnerProfile?.existingKnowledge || "Basic understanding";
  const depth = learnerProfile?.desiredDepth || "Standard";

  const cacheKey = `${topic.toLowerCase()}:${level.toLowerCase()}:${language.toLowerCase()}:${style.toLowerCase()}`;
  const cached = planCache.get(cacheKey);
  if (cached && !customInstruction) {
    return cached;
  }

  const fallbackPlan = buildDynamicFallbackPlan(topic, level, language, duration, objective, sourceContext);

  const ai = getGemini();
  if (!ai) {
    planCache.set(cacheKey, fallbackPlan);
    return fallbackPlan;
  }

  const systemPrompt = `You are Guru AI, a master curriculum architect and adaptive educator.
Prepare a COMPLETE, compact initial teaching package in ONE response for:
Topic: "${topic}"
Learner Level: "${level}"
Prior Knowledge: "${knowledge}"
Objective: "${objective}"
Language: "${language}"
Duration: "${duration}"
Teaching Style: "${style}"
Depth: "${depth}"
${customInstruction ? `Special Instruction: "${customInstruction}"` : ""}
${sourceContext ? `Grounding Document Context:\n${JSON.stringify(sourceContext).slice(0, 2500)}` : ""}

CRITICAL PERFORMANCE DIRECTIVES:
1. Divide into 2-3 essential pedagogical sections.
2. For EACH section, include the initial teaching segment right inside the section:
   - "teacherSpeech": 3-4 spoken sentences clearly teaching the concept with an analogy or concrete example.
   - "subtitles": 1 concise sentence summarizing the core rule.
   - "teacherTone": "encouraging" | "focused" | "supportive"
   - "visualSpec": {
       "title": string,
       "type": "physics-force" | "formula-graph" | "vector-diagram" | "concept-breakdown",
       "elements": [{ "label": string, "value": string, "highlight": boolean }],
       "formula"?: string,
       "keyTakeaway": string
     }
   - "question": {
       "text": string,
       "type": "MCQ",
       "options": [string, string, string, string],
       "correctIndex": number (0-3),
       "conceptTested": string,
       "hint": string
     }
3. Output STRICT compact JSON matching:
{
  "topic": string,
  "learnerLevel": string,
  "objective": string,
  "language": string,
  "duration": string,
  "difficulty": number,
  "sections": [
    {
      "id": "sec-1",
      "concept": string,
      "strategy": string,
      "example": string,
      "visualType": string,
      "expectedOutcome": string,
      "checkpointQuestion": string,
      "estimatedDuration": string,
      "teacherSpeech": string,
      "subtitles": string,
      "teacherTone": string,
      "visualSpec": { ... },
      "question": { ... }
    }
  ],
  "teachingOrder": ["sec-1", ...],
  "assessmentPlan": string
}`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Generate initial lesson package for "${topic}" in ${language}.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    if (!response || !response.text) {
      planCache.set(cacheKey, fallbackPlan);
      return fallbackPlan;
    }

    const parsed = parseJsonFromText<GeneratedLessonPlan>(response.text, fallbackPlan);
    if (!parsed.sections || parsed.sections.length === 0) {
      planCache.set(cacheKey, fallbackPlan);
      return fallbackPlan;
    }

    // Build preGeneratedSegments map so classroom can access by section ID immediately
    const preGeneratedSegments: Record<string, any> = {};
    for (const sec of parsed.sections) {
      if (sec.teacherSpeech && sec.visualSpec && sec.question) {
        preGeneratedSegments[sec.id] = {
          teacherSpeech: sec.teacherSpeech,
          subtitles: sec.subtitles || sec.teacherSpeech.slice(0, 100),
          teacherTone: sec.teacherTone || "encouraging",
          visualSpec: sec.visualSpec,
          question: sec.question,
        };
      } else {
        // Fallback for this section if missing in parsed
        preGeneratedSegments[sec.id] = fallbackPlan.preGeneratedSegments?.[sec.id] || {
          teacherSpeech: `Let's focus on ${sec.concept}. Think about ${sec.example || 'how it functions in daily life'}.`,
          subtitles: `Key takeaway: ${sec.expectedOutcome || sec.concept}`,
          teacherTone: "encouraging",
          visualSpec: {
            title: sec.concept,
            type: sec.visualType || "concept-breakdown",
            elements: [{ label: sec.concept, highlight: true }],
            keyTakeaway: sec.expectedOutcome || "Understand the core concept",
          },
          question: {
            text: sec.checkpointQuestion || `Explain the core idea of ${sec.concept}.`,
            type: "conceptual",
            conceptTested: sec.concept,
          },
        };
      }
    }
    parsed.preGeneratedSegments = preGeneratedSegments;

    if (sourceContext) {
      parsed.sourceContext = {
        documentName: sourceContext.documentName || "Uploaded Material",
        chapter: sourceContext.selectedChapter || undefined,
        grounded: true,
      };
    }

    planCache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    console.warn("Gemini lesson planner error, falling back gracefully:", error);
    planCache.set(cacheKey, fallbackPlan);
    return fallbackPlan;
  }
}
