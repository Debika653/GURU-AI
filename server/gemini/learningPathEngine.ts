import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface LearningPathRequest {
  topic: string;
  learnerProfile?: {
    educationalLevel?: string;
    learningObjective?: string;
    availableTime?: string;
    preferredLanguage?: string;
  };
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: "locked" | "current" | "completed";
  prerequisites: string[];
  keyOutcomes: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface GeneratedLearningPath {
  mainTopic: string;
  overview: string;
  estimatedTotalHours: string;
  nodes: LearningPathNode[];
}

export async function generateLearningPath(req: LearningPathRequest): Promise<GeneratedLearningPath> {
  const { topic, learnerProfile } = req;
  const level = learnerProfile?.educationalLevel || "Class 8 / Beginner";
  const objective = learnerProfile?.learningObjective || "Master conceptual principles";
  const ai = getGemini();

  const fallback: GeneratedLearningPath = {
    mainTopic: topic || "Physics: Classical Mechanics",
    overview: `A progressive, foundational roadmap engineered to take a learner from foundational motion to advanced Newtonian dynamics.`,
    estimatedTotalHours: "4.5 hours",
    nodes: [
      {
        id: "path-1",
        title: "Kinematics: Displacement, Velocity & Acceleration",
        description: "Master motion parameters in one and two dimensions with position-time graphs.",
        estimatedMinutes: 25,
        status: "completed",
        prerequisites: [],
        keyOutcomes: ["Differentiate speed vs velocity", "Interpret graphical slopes as rates of change"],
        difficulty: "Beginner",
      },
      {
        id: "path-2",
        title: "Newton's First & Second Laws (Inertia & F=ma)",
        description: "Unravel why objects maintain motion and how unbalanced net forces induce acceleration.",
        estimatedMinutes: 30,
        status: "current",
        prerequisites: ["path-1"],
        keyOutcomes: ["Calculate net forces", "Apply F = ma to free-body diagrams"],
        difficulty: "Beginner",
      },
      {
        id: "path-3",
        title: "Newton's Third Law & Momentum Conservation",
        description: "Explore interaction action-reaction pairs, impulse collisions, and isolated system momentum.",
        estimatedMinutes: 35,
        status: "locked",
        prerequisites: ["path-2"],
        keyOutcomes: ["Identify interaction pairs on distinct bodies", "Solve elastic and inelastic collisions"],
        difficulty: "Intermediate",
      },
      {
        id: "path-4",
        title: "Work, Energy & Conservative Force Fields",
        description: "Connect mechanical work to kinetic and potential energy transfers.",
        estimatedMinutes: 40,
        status: "locked",
        prerequisites: ["path-3"],
        keyOutcomes: ["Work-Energy Theorem", "Conservation of Total Mechanical Energy"],
        difficulty: "Intermediate",
      },
      {
        id: "path-5",
        title: "Rotational Dynamics & Torque",
        description: "Translate linear Newtonian mechanics into rotational angular momentum and torque.",
        estimatedMinutes: 45,
        status: "locked",
        prerequisites: ["path-4"],
        keyOutcomes: ["Rotational inertia calculation", "Angular momentum conservation in orbits"],
        difficulty: "Advanced",
      },
    ],
  };

  if (!ai) return fallback;

  const systemPrompt = `You are a learning path and curriculum engineer.
Design an adaptive, step-by-step learning progression roadmap for:
Subject/Topic: "${topic}"
Learner Level: "${level}"
Goal: "${objective}"

CRITICAL INSTRUCTIONS:
1. Create 4 to 6 sequentially ordered learning milestones (nodes).
2. Set the first node or current topic as "current", completed prerequisites as "completed", and future milestones as "locked".
3. Output STRICT JSON:
{
  "mainTopic": string,
  "overview": string,
  "estimatedTotalHours": string,
  "nodes": [
    {
      "id": string,
      "title": string,
      "description": string,
      "estimatedMinutes": number,
      "status": "completed" | "current" | "locked",
      "prerequisites": [string],
      "keyOutcomes": [string],
      "difficulty": "Beginner" | "Intermediate" | "Advanced"
    }
  ]
}`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Generate the learning path roadmap for "${topic}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    if (!response || !response.text) {
      return fallback;
    }

    return parseJsonFromText<GeneratedLearningPath>(response.text, fallback);
  } catch (err) {
    console.warn("Learning path generation caught error, using fallback:", err);
    return fallback;
  }
}
