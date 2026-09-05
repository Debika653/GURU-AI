import { LessonPlan, LearnerProfile, LearningPath, VisualSpec, Assessment, AppSettings } from '../types';

export interface DemoSubject {
  id: string;
  name: string;
  subject: string;
  category: 'physics' | 'mathematics' | 'programming' | 'biology' | 'history';
  shortDesc: string;
  defaultProfile: LearnerProfile;
  plan: LessonPlan;
  visualSpecs: Record<string, VisualSpec>;
  assessment?: Assessment;
  sampleDocument?: {
    name: string;
    chapter: string;
    content: string;
  };
}

export const DEFAULT_LEARNER_PROFILE: LearnerProfile = {
  name: "Learner",
  educationalLevel: "Beginner",
  existingKnowledge: "Basic understanding",
  learningObjective: "Understand concept",
  preferredLanguage: "English",
  preferredTeachingStyle: "Example-driven",
  availableTime: "20 minutes",
  desiredDepth: "Standard",
  naturalLanguageInstruction: "Teach me step by step using physical intuition, diagrams, and ask me questions along the way.",
};

export const DEFAULT_SETTINGS: AppSettings = {
  preferredVoice: "Kore",
  speechRate: 1.0,
  autoPlayVoice: true,
  showSubtitles: true,
  avatarStyle: "avatar-female",
  theme: "dark",
  visualDensity: "comfortable",
};

export const DEMO_SUBJECTS: DemoSubject[] = [
  {
    id: 'physics-newton',
    name: "Newton's Laws of Motion",
    subject: "Physics",
    category: "physics",
    shortDesc: "Foundations of classical mechanics: Inertia, F=ma, and action-reaction pairs.",
    defaultProfile: {
      name: "Alex",
      educationalLevel: "Beginner",
      existingKnowledge: "Basic understanding",
      learningObjective: "Understand concept",
      preferredLanguage: "English",
      preferredTeachingStyle: "Example-driven",
      availableTime: "20 minutes",
      desiredDepth: "Standard",
      naturalLanguageInstruction: "Teach me from the beginning using clear real-life examples and ask questions."
    },
    sampleDocument: {
      name: "Halliday_Resnick_Physics_Ch5.pdf",
      chapter: "Chapter 5: Force and Motion",
      content: "Newton's laws of motion are three basic laws of classical mechanics that describe the relationship between the motion of an object and the forces acting on it. First Law: If net force is zero, velocity is constant. Second Law: F_net = m * a. Third Law: For every action, there is an equal and opposite reaction."
    },
    plan: {
      topic: "Newton's Laws of Motion",
      learnerLevel: "Beginner",
      objective: "Understand concept",
      language: "English",
      duration: "20 minutes",
      difficulty: 2,
      sourceContext: {
        documentName: "Halliday_Resnick_Physics_Ch5.pdf",
        chapter: "Chapter 5: Force and Motion",
        section: "Section 5.2 - The First Law",
        grounded: true
      },
      sections: [
        {
          id: "sec-1",
          concept: "Inertia & The First Law",
          strategy: "Everyday inertia analogies (seatbelt, skateboard stops abruptly)",
          example: "Why you lurch forward when a bus suddenly hits the brakes",
          visualType: "physics-force",
          expectedOutcome: "Understand that an object at rest stays at rest unless acted on by an unbalanced net force",
          checkpointQuestion: "Imagine an astronaut in deep space throws a wrench. There is no friction and no gravity nearby. What will happen to the wrench after leaving their hand?",
          estimatedDuration: "5 mins"
        },
        {
          id: "sec-2",
          concept: "Force, Mass & Acceleration (F = ma)",
          strategy: "Proportional cause and effect with shopping carts",
          example: "Pushing an empty shopping cart vs pushing one filled with 50kg of weights",
          visualType: "formula-graph",
          expectedOutcome: "Comprehend that acceleration depends directly on net force and inversely on mass",
          checkpointQuestion: "If you double the net pushing force on a cart, but also double its mass, what happens to its acceleration?",
          estimatedDuration: "7 mins"
        },
        {
          id: "sec-3",
          concept: "Action & Reaction (The Third Law)",
          strategy: "Interacting pairs demonstration with boat and dock",
          example: "Stepping off a small rowboat onto the dock and watching the boat drift backward",
          visualType: "vector-diagram",
          expectedOutcome: "Recognize that forces always occur in equal and opposite pairs acting on different bodies",
          checkpointQuestion: "When a bird flaps its wings against the air to fly upward, what is the action and what is the reaction?",
          estimatedDuration: "6 mins"
        }
      ],
      teachingOrder: ["sec-1", "sec-2", "sec-3"],
      assessmentPlan: "3 conceptual checkpoint questions with adaptive misconception diagnostics followed by 4 application exam problems",
      preGeneratedSegments: {
        "sec-1": {
          conceptTitle: "Inertia & The First Law",
          introduction: "Welcome Alex! Today we are exploring the very foundation of classical mechanics: Newton's First Law of Motion.",
          explanation: "In physics, an object naturally tends to preserve its current state of motion. If it is resting on a table, it stays resting. If it is gliding through space at sixty miles an hour, it will continue moving forever in a straight line at that exact speed unless an unbalanced net force acts on it. Notice something profound here: forces do not cause motion. Rather, forces cause changes in motion, which we call acceleration.",
          analogy: "To build an intuition, imagine a polished hockey puck sliding across a perfectly smooth sheet of frictionless ice. Once given an initial gentle tap, you don't need to keep pushing it. It coasts forward indefinitely because there is no friction or air resistance acting to slow it down.",
          example: "You experience this every day when riding inside a bus. When the bus is moving and the driver suddenly slams the brakes, your upper body lunges forward. That isn't a mysterious force shoving you forward—it is simply your body's mass attempting to maintain its constant forward velocity while the bus floor halts beneath you.",
          keyTakeaway: "Inertia is the natural tendency of mass to resist changes in its state of motion. Zero net force always guarantees constant velocity.",
          checkpointIntro: "Now let's see if you've understood this concept with a quick checkpoint question.",
          currentSpeechScript: "Welcome Alex! Today we are exploring the very foundation of classical mechanics: Newton's First Law of Motion.\n\nIn physics, an object naturally tends to preserve its current state of motion. If it is resting on a table, it stays resting. If it is gliding through space at sixty miles an hour, it will continue moving forever in a straight line at that exact speed unless an unbalanced net force acts on it. Notice something profound here: forces do not cause motion. Rather, forces cause changes in motion, which we call acceleration.\n\nTo build an intuition, imagine a polished hockey puck sliding across a perfectly smooth sheet of frictionless ice. Once given an initial gentle tap, you don't need to keep pushing it. It coasts forward indefinitely because there is no friction or air resistance acting to slow it down.\n\nYou experience this every day when riding inside a bus. When the bus is moving and the driver suddenly slams the brakes, your upper body lunges forward. That isn't a mysterious force shoving you forward—it is simply your body's mass attempting to maintain its constant forward velocity while the bus floor halts beneath you.\n\nSo the essential takeaway to remember is inertia: the natural tendency of mass to resist changes in its state of motion. Zero net force always guarantees constant velocity.\n\nNow let's see if you've understood this concept with a quick checkpoint question.",
          teacherSpeech: "Welcome Alex! Today we are exploring the very foundation of classical mechanics: Newton's First Law of Motion.\n\nIn physics, an object naturally tends to preserve its current state of motion. If it is resting on a table, it stays resting. If it is gliding through space at sixty miles an hour, it will continue moving forever in a straight line at that exact speed unless an unbalanced net force acts on it. Notice something profound here: forces do not cause motion. Rather, forces cause changes in motion, which we call acceleration.\n\nTo build an intuition, imagine a polished hockey puck sliding across a perfectly smooth sheet of frictionless ice. Once given an initial gentle tap, you don't need to keep pushing it. It coasts forward indefinitely because there is no friction or air resistance acting to slow it down.\n\nYou experience this every day when riding inside a bus. When the bus is moving and the driver suddenly slams the brakes, your upper body lunges forward. That isn't a mysterious force shoving you forward—it is simply your body's mass attempting to maintain its constant forward velocity while the bus floor halts beneath you.\n\nSo the essential takeaway to remember is inertia: the natural tendency of mass to resist changes in its state of motion. Zero net force always guarantees constant velocity.\n\nNow let's see if you've understood this concept with a quick checkpoint question.",
          subtitles: "Inertia is the natural tendency of mass to resist changes in its state of motion. Zero net force guarantees constant velocity.",
          teacherTone: "encouraging",
          visualSpec: {
            title: "Newton's First Law: Zero Net Force State",
            type: "physics-force",
            description: "Equilibrium balance: Object remains in uniform motion unless unbalanced force acts.",
            formula: "ΣF = 0 ⟹ a = 0 (v = constant)",
            elements: [
              { label: "Normal Force (Fn)", value: "+98 N", state: "balanced", color: "#38bdf8" },
              { label: "Gravitational Force (Fg)", value: "-98 N", state: "balanced", color: "#f87171" },
              { label: "Applied External Force", value: "0 N", state: "neutral", color: "#a855f7" },
              { label: "Net Unbalanced Force (Fnet)", value: "0 N", state: "constant velocity", highlight: true, color: "#10b981" }
            ],
            keyTakeaway: "Forces do not cause motion; forces cause CHANGES in motion (acceleration)."
          },
          question: {
            id: "demo-q1",
            text: "Imagine an astronaut in deep space throws a wrench. There is no air resistance and no gravity nearby. What will happen to the wrench after leaving their hand?",
            type: "MCQ",
            options: [
              "It will gradually slow down and come to a stop.",
              "It will continue moving forever at constant velocity in a straight line.",
              "It will immediately drop downward.",
              "It will speed up because space has no friction."
            ],
            correctIndex: 1,
            conceptTested: "Newton's First Law & Inertia",
            hint: "Think about whether any unbalanced external force exists in deep space."
          }
        },
        "sec-2": {
          conceptTitle: "Force, Mass & Acceleration (F = ma)",
          introduction: "Now let's examine the mathematical and physical core of classical mechanics: Newton's Second Law of Motion.",
          explanation: "While the First Law told us what happens when forces are zero, the Second Law answers what happens when an unbalanced net force DOES act. It states that the acceleration of an object is directly proportional to the net force applied, and inversely proportional to the object's mass. Mathematically, we express this as F equals m times a.",
          analogy: "To build an intuitive picture, think about pushing an empty shopping cart at a supermarket versus pushing a cart filled to the brim with fifty kilograms of heavy books. If you push the heavy cart with the same force you used for the empty one, it barely crawls forward. Because it has vastly more mass, its acceleration is heavily resisted.",
          example: "To achieve the exact same rapid acceleration on the loaded cart, you must apply a proportionally greater net force. If you double the force while keeping mass constant, acceleration doubles. But if you double the mass while keeping force constant, the acceleration is cut right in half.",
          keyTakeaway: "Force causes acceleration, while mass resists it. Acceleration equals net force divided by mass: a = F / m.",
          checkpointIntro: "Now let's test your understanding of this relationship with a quick scenario.",
          currentSpeechScript: "Now let's examine the mathematical and physical core of classical mechanics: Newton's Second Law of Motion.\n\nWhile the First Law told us what happens when forces are zero, the Second Law answers what happens when an unbalanced net force DOES act. It states that the acceleration of an object is directly proportional to the net force applied, and inversely proportional to the object's mass. Mathematically, we express this as F equals m times a.\n\nTo build an intuitive picture, think about pushing an empty shopping cart at a supermarket versus pushing a cart filled to the brim with fifty kilograms of heavy books. If you push the heavy cart with the same force you used for the empty one, it barely crawls forward. Because it has vastly more mass, its acceleration is heavily resisted.\n\nTo achieve the exact same rapid acceleration on the loaded cart, you must apply a proportionally greater net force. If you double the force while keeping mass constant, acceleration doubles. But if you double the mass while keeping force constant, the acceleration is cut right in half.\n\nSo the key takeaway to remember is this: force causes acceleration, while mass resists it. The heavier an object, the more force it demands to alter its motion.\n\nNow let's test your understanding of this relationship with a quick scenario.",
          teacherSpeech: "Now let's examine the mathematical and physical core of classical mechanics: Newton's Second Law of Motion.\n\nWhile the First Law told us what happens when forces are zero, the Second Law answers what happens when an unbalanced net force DOES act. It states that the acceleration of an object is directly proportional to the net force applied, and inversely proportional to the object's mass. Mathematically, we express this as F equals m times a.\n\nTo build an intuitive picture, think about pushing an empty shopping cart at a supermarket versus pushing a cart filled to the brim with fifty kilograms of heavy books. If you push the heavy cart with the same force you used for the empty one, it barely crawls forward. Because it has vastly more mass, its acceleration is heavily resisted.\n\nTo achieve the exact same rapid acceleration on the loaded cart, you must apply a proportionally greater net force. If you double the force while keeping mass constant, acceleration doubles. But if you double the mass while keeping force constant, the acceleration is cut right in half.\n\nSo the key takeaway to remember is this: force causes acceleration, while mass resists it. The heavier an object, the more force it demands to alter its motion.\n\nNow let's test your understanding of this relationship with a quick scenario.",
          subtitles: "Acceleration is directly proportional to net force and inversely proportional to mass: a = F / m.",
          teacherTone: "focused",
          visualSpec: {
            title: "Newton's Second Law: Proportional Dynamics",
            type: "formula-graph",
            description: "Acceleration scales directly with net force and inversely with mass.",
            formula: "a = F_net / m",
            elements: [
              { label: "Case 1: Light Mass (m = 2 kg)", value: "F = 20 N ⟹ a = 10 m/s²", state: "rapid acceleration", color: "#10b981" },
              { label: "Case 2: Heavy Mass (m = 20 kg)", value: "F = 20 N ⟹ a = 1 m/s²", state: "sluggish acceleration", color: "#f59e0b" },
              { label: "Proportionality Rule", value: "a ∝ F and a ∝ 1/m", highlight: true, color: "#6366f1" }
            ],
            keyTakeaway: "Heavier objects require proportionally greater force to achieve the exact same acceleration."
          },
          question: {
            id: "demo-q2",
            text: "If you double the net pushing force on a cart, but also double its total mass, what happens to its acceleration?",
            type: "MCQ",
            options: [
              "Acceleration doubles (2x)",
              "Acceleration quadruples (4x)",
              "Acceleration remains exactly the same (1x)",
              "Acceleration is cut in half (0.5x)"
            ],
            correctIndex: 2,
            conceptTested: "Newton's Second Law (F = ma)",
            hint: "Use the formula a = F / m. What is (2F) / (2m)?"
          }
        },
        "sec-3": {
          conceptTitle: "Action & Reaction (The Third Law)",
          introduction: "Finally, let's master one of the most famous principles in all of science: Newton's Third Law of Motion.",
          explanation: "Newton observed that forces never occur in isolation in our universe—they only occur in mutual interactions between two bodies. Whenever one object exerts a force on a second object, the second object simultaneously exerts a force back on the first object with the exact same magnitude, but in the opposite direction.",
          analogy: "To build intuition, picture stepping off a small rowboat floating on water onto a sturdy dock. As your foot pushes backward against the floor of the boat to propel your body forward onto the dock, the boat suddenly shoots backward through the water. You pushed the boat, and the boat pushed you!",
          example: "Now, students often ask: if the two forces are equal and opposite, why don't they simply cancel each other out to zero? The crucial insight is that the two forces act on DIFFERENT objects! The forward force acts on your body, while the backward force acts on the boat. Because they act on different bodies, each body accelerates independently according to its own mass.",
          keyTakeaway: "Every action force has a simultaneous, equal, and opposite reaction force acting on a different body. F_A = -F_B.",
          checkpointIntro: "Now let's see if you can identify the interacting pair in this final checkpoint question.",
          currentSpeechScript: "Finally, let's master one of the most famous principles in all of science: Newton's Third Law of Motion.\n\nNewton observed that forces never occur in isolation in our universe—they only occur in mutual interactions between two bodies. Whenever one object exerts a force on a second object, the second object simultaneously exerts a force back on the first object with the exact same magnitude, but in the opposite direction.\n\nTo build intuition, picture stepping off a small rowboat floating on water onto a sturdy dock. As your foot pushes backward against the floor of the boat to propel your body forward onto the dock, the boat suddenly shoots backward through the water. You pushed the boat, and the boat pushed you!\n\nNow, students often ask: if the two forces are equal and opposite, why don't they simply cancel each other out to zero? The crucial insight is that the two forces act on DIFFERENT objects! The forward force acts on your body, while the backward force acts on the boat. Because they act on different bodies, each body accelerates independently according to its own mass.\n\nSo the essential takeaway is this: you cannot touch something without it touching you back with equal intensity. Every action force has a simultaneous, equal, and opposite reaction force.\n\nNow let's see if you can identify the interacting pair in this final checkpoint question.",
          teacherSpeech: "Finally, let's master one of the most famous principles in all of science: Newton's Third Law of Motion.\n\nNewton observed that forces never occur in isolation in our universe—they only occur in mutual interactions between two bodies. Whenever one object exerts a force on a second object, the second object simultaneously exerts a force back on the first object with the exact same magnitude, but in the opposite direction.\n\nTo build intuition, picture stepping off a small rowboat floating on water onto a sturdy dock. As your foot pushes backward against the floor of the boat to propel your body forward onto the dock, the boat suddenly shoots backward through the water. You pushed the boat, and the boat pushed you!\n\nNow, students often ask: if the two forces are equal and opposite, why don't they simply cancel each other out to zero? The crucial insight is that the two forces act on DIFFERENT objects! The forward force acts on your body, while the backward force acts on the boat. Because they act on different bodies, each body accelerates independently according to its own mass.\n\nSo the essential takeaway is this: you cannot touch something without it touching you back with equal intensity. Every action force has a simultaneous, equal, and opposite reaction force.\n\nNow let's see if you can identify the interacting pair in this final checkpoint question.",
          subtitles: "Forces always occur in matched pairs acting on two different bodies simultaneously: F_A = -F_B.",
          teacherTone: "supportive",
          visualSpec: {
            title: "Newton's Third Law: Action-Reaction Pairs",
            type: "vector-diagram",
            description: "Simultaneous equal and opposite forces acting on TWO different objects.",
            formula: "F_(A on B) = - F_(B on A)",
            elements: [
              { label: "Action: Foot pushes Boat backward", value: "F_1 = -150 N (on boat)", state: "reaction body", color: "#ec4899" },
              { label: "Reaction: Boat pushes Foot forward", value: "F_2 = +150 N (on person)", state: "propulsion", color: "#06b6d4" },
              { label: "Key Insight", value: "Forces never cancel out because they act on different bodies!", highlight: true, color: "#8b5cf6" }
            ],
            keyTakeaway: "You cannot push something without it pushing back on you with the exact same magnitude."
          },
          question: {
            id: "demo-q3",
            text: "When a bird flaps its wings against the air to fly upward, what is the action and what is the reaction?",
            type: "MCQ",
            options: [
              "Action: wings push air down; Reaction: air pushes wings up with equal force.",
              "Action: bird's weight pushes down; Reaction: gravity pulls down.",
              "Action: bird gains speed; Reaction: air becomes warm.",
              "Forces cannot apply to air because air is a gas."
            ],
            correctIndex: 0,
            conceptTested: "Newton's Third Law (Action-Reaction Pairs)",
            hint: "Identify the two physical bodies interacting: the bird's wings and the surrounding air."
          }
        }
      }
    },
    visualSpecs: {
      "sec-1": {
        title: "Newton's First Law: Zero Net Force State",
        type: "physics-force",
        description: "Equilibrium balance: Object remains in uniform motion unless unbalanced force acts.",
        formula: "ΣF = 0 ⟹ a = 0 (v = constant)",
        elements: [
          { label: "Normal Force (Fn)", value: "+98 N", state: "balanced", color: "#38bdf8" },
          { label: "Gravitational Force (Fg)", value: "-98 N", state: "balanced", color: "#f87171" },
          { label: "Applied External Force", value: "0 N", state: "neutral", color: "#a855f7" },
          { label: "Net Unbalanced Force (Fnet)", value: "0 N", state: "constant velocity", highlight: true, color: "#10b981" }
        ],
        keyTakeaway: "Forces do not cause motion; forces cause CHANGES in motion (acceleration)."
      },
      "sec-2": {
        title: "Newton's Second Law: Proportional Dynamics",
        type: "formula-graph",
        description: "Acceleration scales directly with net force and inversely with mass.",
        formula: "a = F_net / m",
        elements: [
          { label: "Case 1: Light Mass (m = 2 kg)", value: "F = 20 N ⟹ a = 10 m/s²", state: "rapid acceleration", color: "#10b981" },
          { label: "Case 2: Heavy Mass (m = 20 kg)", value: "F = 20 N ⟹ a = 1 m/s²", state: "sluggish acceleration", color: "#f59e0b" },
          { label: "Proportionality Rule", value: "a ∝ F and a ∝ 1/m", highlight: true, color: "#6366f1" }
        ],
        keyTakeaway: "Heavier objects require proportionally greater force to achieve the exact same acceleration."
      },
      "sec-3": {
        title: "Newton's Third Law: Action-Reaction Pairs",
        type: "vector-diagram",
        description: "Simultaneous equal and opposite forces acting on TWO different objects.",
        formula: "F_(A on B) = - F_(B on A)",
        elements: [
          { label: "Action: Foot pushes Boat backward", value: "F_1 = -150 N (on boat)", state: "reaction body", color: "#ec4899" },
          { label: "Reaction: Boat pushes Foot forward", value: "F_2 = +150 N (on person)", state: "propulsion", color: "#06b6d4" },
          { label: "Key Insight", value: "Forces never cancel out because they act on different bodies!", highlight: true, color: "#8b5cf6" }
        ],
        keyTakeaway: "You cannot push something without it pushing back on you with the exact same magnitude."
      }
    },
    assessment: {
      title: "Newton's Laws Mastery Assessment",
      topic: "Newton's Laws of Motion",
      totalQuestions: 4,
      questions: [
        {
          id: "q1",
          concept: "Newton's First Law (Inertia)",
          questionText: "A hockey puck slides across frictionless deep space at 12 m/s. What net external force is required to keep it moving indefinitely at this speed?",
          type: "MCQ",
          options: [
            "A constant forward force proportional to its mass",
            "Zero net force (inertia maintains velocity without continuous pushing)",
            "A force equal to its gravitational weight",
            "A periodic pulsing force"
          ],
          correctIndex: 1,
          explanation: "Newton's First Law dictates that an object in motion stays in motion at constant velocity unless acted upon by an unbalanced external force."
        },
        {
          id: "q2",
          concept: "Newton's Second Law (F = ma)",
          questionText: "If the net force on an accelerating shopping cart is doubled while its total mass is cut in half, what happens to the acceleration?",
          type: "MCQ",
          options: [
            "It remains exactly the same",
            "It doubles (2x)",
            "It quadruples (4x)",
            "It is halved (0.5x)"
          ],
          correctIndex: 2,
          explanation: "a = F/m. If F -> 2F and m -> m/2, then a' = (2F)/(m/2) = 4 * (F/m) = 4a."
        },
        {
          id: "q3",
          concept: "Newton's Third Law (Action-Reaction)",
          questionText: "A mosquito collides with the windshield of a speeding highway truck. How does the magnitude of the force exerted by the mosquito on the truck compare to the force exerted by the truck on the mosquito?",
          type: "MCQ",
          options: [
            "The truck exerts a vastly larger force because of its enormous mass",
            "The mosquito exerts a larger force due to its rapid deceleration",
            "Both forces are equal in magnitude according to Newton's Third Law",
            "Forces only apply to the stationary object"
          ],
          correctIndex: 2,
          explanation: "Newton's Third Law states that interaction forces between two bodies are ALWAYS equal in magnitude and opposite in direction. The mosquito experiences much greater acceleration because its mass is microscopic compared to the truck (a = F/m)."
        },
        {
          id: "q4",
          concept: "Application & Synthesis",
          questionText: "Explain in your own words why passengers lurch forward when a bus suddenly brakes hard, and which law of motion explains this phenomenon.",
          type: "conceptual",
          explanation: "Inertia (Newton's First Law): The passengers' bodies were moving at the bus's cruising speed. When brakes decelerate the bus chassis, the passengers continue moving forward until an external force (seatbelt, friction, seat back) acts on them."
        }
      ]
    }
  },
  {
    id: 'math-quadratics',
    name: "Quadratic Equations & Parabolic Roots",
    subject: "Mathematics",
    category: "mathematics",
    shortDesc: "Standard form, factoring, vertex geometry, and the Quadratic Formula.",
    defaultProfile: {
      name: "Jordan",
      educationalLevel: "Intermediate",
      existingKnowledge: "Basic understanding",
      learningObjective: "Exam preparation",
      preferredLanguage: "English",
      preferredTeachingStyle: "Step-by-step",
      availableTime: "20 minutes",
      desiredDepth: "Standard"
    },
    plan: {
      topic: "Quadratic Equations & Roots",
      learnerLevel: "Intermediate",
      objective: "Exam preparation",
      language: "English",
      duration: "20 minutes",
      difficulty: 3,
      sections: [
        {
          id: "sec-q1",
          concept: "Standard Form & Parabola Geometry",
          strategy: "Visualizing the trajectory of a thrown ball",
          example: "Height of a basketball shot modeled by h(t) = -5t² + 10t + 2",
          visualType: "formula-graph",
          expectedOutcome: "Recognize ax² + bx + c = 0 and vertex coordinates",
          checkpointQuestion: "If 'a' is positive in ax² + bx + c, which way does the parabola open?",
          estimatedDuration: "6 mins"
        },
        {
          id: "sec-q2",
          concept: "The Discriminant (b² - 4ac)",
          strategy: "Root nature decision tree",
          example: "Determining whether a rocket reaches orbit without solving the full equation",
          visualType: "comparison-table",
          expectedOutcome: "Understand how the discriminant determines 2 real, 1 repeated, or 2 complex roots",
          checkpointQuestion: "What does Δ = b² - 4ac < 0 tell you about the graph's x-intercepts?",
          estimatedDuration: "6 mins"
        }
      ],
      teachingOrder: ["sec-q1", "sec-q2"],
      assessmentPlan: "Discriminant calculation and vertex derivation exercises"
    },
    visualSpecs: {
      "sec-q1": {
        title: "Quadratic Parabola: Geometry & Vertex",
        type: "formula-graph",
        formula: "f(x) = ax² + bx + c",
        elements: [
          { label: "Vertex (Turning Point)", value: "(-b/2a, f(-b/2a))", color: "#f59e0b" },
          { label: "Roots / x-intercepts", value: "x = (-b ± √(b² - 4ac)) / 2a", highlight: true, color: "#10b981" },
          { label: "Axis of Symmetry", value: "x = -b / 2a", color: "#38bdf8" }
        ],
        keyTakeaway: "The sign of 'a' controls whether the parabola holds water (opens upward) or sheds water (opens downward)."
      },
      "sec-q2": {
        title: "The Discriminant Radar",
        type: "comparison-table",
        formula: "Δ = b² - 4ac",
        elements: [
          { label: "Δ > 0", value: "Two distinct real roots (intersects x-axis twice)", color: "#10b981" },
          { label: "Δ = 0", value: "One real repeated root (tangent to x-axis at vertex)", color: "#f59e0b" },
          { label: "Δ < 0", value: "No real roots (floating parabola, complex conjugate roots)", color: "#ef4444" }
        ],
        keyTakeaway: "The discriminant acts as a diagnostic tool before you spend time calculating roots."
      }
    }
  },
  {
    id: 'prog-react',
    name: "React State & Component Lifecycle",
    subject: "Programming",
    category: "programming",
    shortDesc: "Unidirectional data flow, useState internals, virtual DOM, and clean effects.",
    defaultProfile: {
      name: "Dev",
      educationalLevel: "Intermediate",
      existingKnowledge: "Basic understanding",
      learningObjective: "Practical application",
      preferredLanguage: "English",
      preferredTeachingStyle: "Technical",
      availableTime: "20 minutes",
      desiredDepth: "Detailed"
    },
    plan: {
      topic: "React State & Component Lifecycle",
      learnerLevel: "Intermediate",
      objective: "Practical application",
      language: "English",
      duration: "20 minutes",
      difficulty: 3,
      sections: [
        {
          id: "sec-r1",
          concept: "State as a Snapshot & Reconciliation",
          strategy: "Comparing React state to photographic frames in animation",
          example: "Why logging state immediately after calling setState prints the old value",
          visualType: "code-execution",
          expectedOutcome: "Understand immutable state updates and fiber queue batches",
          checkpointQuestion: "If you call setCount(count + 1) three times in the same click handler, what will the count increment by?",
          estimatedDuration: "8 mins"
        }
      ],
      teachingOrder: ["sec-r1"],
      assessmentPlan: "Closure quiz and useEffect dependency management"
    },
    visualSpecs: {
      "sec-r1": {
        title: "React State Render Cycle: Fiber Snapshot",
        type: "code-execution",
        formula: "UI = f(state, props)",
        elements: [
          { label: "Trigger", value: "User clicks button ➔ dispatchAction()", color: "#38bdf8" },
          { label: "Render Phase", value: "Component re-executes with new snapshot", color: "#a855f7" },
          { label: "Commit Phase", value: "Diff calculated ➔ DOM mutated minimally", highlight: true, color: "#10b981" }
        ],
        keyTakeaway: "State does not mutate in place; React re-runs your component with a fresh immutable state snapshot."
      }
    }
  },
  {
    id: 'bio-photosynthesis',
    name: "Photosynthesis & Cellular Energy",
    subject: "Biology",
    category: "biology",
    shortDesc: "Light-dependent thylakoid reactions, Calvin cycle, ATP synthase, and glucose synthesis.",
    defaultProfile: {
      name: "Maya",
      educationalLevel: "Beginner",
      existingKnowledge: "Basic understanding",
      learningObjective: "Understand concept",
      preferredLanguage: "English",
      preferredTeachingStyle: "Visual",
      availableTime: "20 minutes",
      desiredDepth: "Standard"
    },
    plan: {
      topic: "Photosynthesis & Cellular Energy",
      learnerLevel: "Beginner",
      objective: "Understand concept",
      language: "English",
      duration: "20 minutes",
      difficulty: 2,
      sections: [
        {
          id: "sec-b1",
          concept: "Light Reactions & Electron Transport",
          strategy: "Solar panel and chemical battery analogy",
          example: "Photons splitting water molecules to release oxygen into the atmosphere",
          visualType: "biology-process",
          expectedOutcome: "Understand how chlorophyll traps photons to produce ATP and NADPH",
          checkpointQuestion: "Where does the oxygen gas released during photosynthesis actually originate from?",
          estimatedDuration: "7 mins"
        }
      ],
      teachingOrder: ["sec-b1"],
      assessmentPlan: "Thylakoid vs Stroma biochemical mapping"
    },
    visualSpecs: {
      "sec-b1": {
        title: "Chloroplast Architecture: Solar Chemical Conversion",
        type: "biology-process",
        formula: "6CO₂ + 6H₂O + Light ➔ C₆H₁₂O₆ + 6O₂",
        elements: [
          { label: "Thylakoid Membrane", value: "Photolysis of H₂O ➔ O₂ released + ATP created", color: "#10b981" },
          { label: "Stroma Fluid", value: "Calvin Cycle: CO₂ fixed into Glucose using ATP", color: "#f59e0b" },
          { label: "Energy Currency", value: "NADPH + ATP transfer solar energy into chemical bonds", highlight: true, color: "#06b6d4" }
        ],
        keyTakeaway: "Oxygen is a byproduct of water photolysis; the true evolutionary goal is high-energy glucose bonds."
      }
    }
  },
  {
    id: 'hist-freedom',
    name: "Indian Freedom Movement (1857-1947)",
    subject: "History",
    category: "history",
    shortDesc: "Key milestones from the 1857 revolt, Non-Cooperation, Dandi March to Independence.",
    defaultProfile: {
      name: "Rohan",
      educationalLevel: "Intermediate",
      existingKnowledge: "Moderate understanding",
      learningObjective: "Exam preparation",
      preferredLanguage: "Hinglish",
      preferredTeachingStyle: "Step-by-step",
      availableTime: "20 minutes",
      desiredDepth: "Standard"
    },
    plan: {
      topic: "Indian Freedom Movement (1857-1947)",
      learnerLevel: "Intermediate",
      objective: "Exam preparation",
      language: "Hinglish",
      duration: "20 minutes",
      difficulty: 2,
      sections: [
        {
          id: "sec-h1",
          concept: "From 1857 Revolt to Mass Satyagraha",
          strategy: "Chronological cause-and-effect timeline",
          example: "How the Salt March mobilized rural populations across colonial India",
          visualType: "timeline-sequence",
          expectedOutcome: "Identify pivotal turning points in the anti-colonial struggle",
          checkpointQuestion: "What was the significance of the 1930 Dandi Salt March in shifting international public opinion?",
          estimatedDuration: "6 mins"
        }
      ],
      teachingOrder: ["sec-h1"],
      assessmentPlan: "Chronological milestone ordering and policy analysis"
    },
    visualSpecs: {
      "sec-h1": {
        title: "Chronological Arc: Road to Independence",
        type: "timeline-sequence",
        elements: [
          { label: "1857", value: "First War of Independence (Sepoy Mutiny)", color: "#f87171" },
          { label: "1919", value: "Jallianwala Bagh & Rowlatt Act opposition", color: "#fb923c" },
          { label: "1930", value: "Dandi Salt March & Civil Disobedience", highlight: true, color: "#38bdf8" },
          { label: "1942", value: "Quit India Resolution ('Do or Die')", color: "#a855f7" },
          { label: "1947", value: "Transfer of Power & Independence", color: "#10b981" }
        ],
        keyTakeaway: "The movement transitioned from elite petitions to nationwide grassroots civil resistance."
      }
    }
  }
];

export const DEFAULT_LEARNING_PATH: LearningPath = {
  mainTopic: "Classical Mechanics & Dynamics",
  modules: [
    { id: "m1", title: "Kinematics: Velocity & Acceleration", status: "completed", duration: "15m", description: "Displacement vectors, instantaneous velocity, and rate of change." },
    { id: "m2", title: "Newton's First Law (Inertia)", status: "current", duration: "20m", description: "Zero net force, mass inertia, and reference frames." },
    { id: "m3", title: "Newton's Second Law (F = ma)", status: "unlocked", duration: "25m", description: "Force-mass ratios, free-body diagrams, and vector resolution." },
    { id: "m4", title: "Newton's Third Law (Action-Reaction)", status: "unlocked", duration: "20m", description: "Mutual interaction pairs and normal contact forces." },
    { id: "m5", title: "Friction & Air Resistance", status: "locked", duration: "30m", description: "Static vs kinetic friction and terminal velocity." },
    { id: "m6", title: "Work, Energy & Conservation", status: "locked", duration: "40m", description: "Work-energy theorem, kinetic vs potential energy." }
  ]
};
