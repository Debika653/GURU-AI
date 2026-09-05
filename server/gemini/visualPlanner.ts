import { getGemini, generateGeminiContent, parseJsonFromText } from "./client";

export interface VisualPlanRequest {
  topic: string;
  concept: string;
  visualType?: string;
  learnerLevel?: string;
  language?: string;
}

export interface VisualSpecOutput {
  title: string;
  type: string;
  elements: Array<{
    label: string;
    value?: string;
    state?: string;
    highlight?: boolean;
    color?: string;
  }>;
  formula?: string;
  keyTakeaway?: string;
  description?: string;
}

export async function planVisual(req: VisualPlanRequest): Promise<VisualSpecOutput> {
  const { topic, concept, visualType = "physics-force", learnerLevel = "Beginner", language = "English" } = req;
  const ai = getGemini();

  const fallback: VisualSpecOutput = {
    title: `${concept} Dynamics`,
    type: visualType,
    elements: [
      { label: "Normal Force (Fn)", value: "+98 N", state: "balanced", highlight: true, color: "#38bdf8" },
      { label: "Gravity Force (Fg)", value: "-98 N", state: "balanced", highlight: true, color: "#f87171" },
      { label: "Net Force (ΣF)", value: "0 N", state: "equilibrium", highlight: false, color: "#10b981" },
    ],
    formula: "ΣF = 0 ⟹ a = 0",
    keyTakeaway: "Zero net unbalanced force means no change in velocity.",
    description: "Vector balance diagram demonstrating equilibrium.",
  };

  if (!ai) return fallback;

  const systemPrompt = `You are an educational visual designer and chalkboard diagram specialist.
Plan a clean, high-impact SVG diagram specification for teaching:
Concept: "${concept}" in Topic: "${topic}"
Level: "${learnerLevel}"
Language: "${language}"

Visual type options:
- "physics-force" (free body force balance diagram)
- "formula-graph" (interactive hyperbolic / linear curve)
- "vector-diagram" (action-reaction interaction pair)
- "biology-process" (biochemical or cellular cycle diagram)
- "code-execution" (memory snapshot or call stack)
- "timeline-sequence" (chronological causal progression)
- "concept-breakdown" (structured interactive component cards)

Output STRICT JSON:
{
  "title": string,
  "type": string,
  "elements": [
    { "label": string, "value": string, "state": string, "highlight": boolean, "color": string }
  ],
  "formula": string (optional),
  "keyTakeaway": string,
  "description": string
}`;

  try {
    const response = await generateGeminiContent({
      preferredModel: "gemini-3.8-flash",
      contents: `Plan the visual diagram for "${concept}".`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    if (!response || !response.text) {
      return fallback;
    }

    return parseJsonFromText<VisualSpecOutput>(response.text, fallback);
  } catch (err) {
    console.warn("Visual planner caught error, using fallback:", err);
    return fallback;
  }
}
