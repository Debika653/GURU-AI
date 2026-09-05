export type EducationalLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ExistingKnowledge =
  | 'I know nothing'
  | 'Basic understanding'
  | 'Moderate understanding'
  | 'Strong understanding';

export type LearningObjective =
  | 'Understand concept'
  | 'Exam preparation'
  | 'Interview preparation'
  | 'Practical application'
  | 'Revision'
  | 'Deep learning';

export type PreferredLanguage =
  | 'English'
  | 'Hindi'
  | 'Hinglish'
  | 'Bengali'
  | 'Tamil'
  | 'Telugu'
  | 'Marathi'
  | 'Gujarati'
  | 'Kannada'
  | 'Malayalam'
  | 'Punjabi'
  | 'Spanish'
  | 'French';

export type TeachingStyle =
  | 'Simple & conversational'
  | 'Visual'
  | 'Example-driven'
  | 'Socratic/question-based'
  | 'Technical'
  | 'Step-by-step';

export type AvailableTime =
  | '5 minutes'
  | '10 minutes'
  | '20 minutes'
  | '30 minutes'
  | '60 minutes'
  | '7-day learning plan';

export type DesiredDepth =
  | 'Quick overview'
  | 'Standard'
  | 'Detailed'
  | 'Deep technical';

export interface LearnerProfile {
  name?: string;
  educationalLevel: EducationalLevel;
  existingKnowledge: ExistingKnowledge;
  learningObjective: LearningObjective;
  preferredLanguage: PreferredLanguage;
  preferredTeachingStyle: TeachingStyle;
  availableTime: AvailableTime;
  desiredDepth: DesiredDepth;
  naturalLanguageInstruction?: string;
}

export type SubjectCategory =
  | 'physics'
  | 'mathematics'
  | 'biology'
  | 'programming'
  | 'history'
  | 'chemistry'
  | 'general';

export interface VisualSpecElement {
  label: string;
  value?: string;
  state?: string;
  highlight?: boolean;
  color?: string;
}

export interface VisualSpec {
  title: string;
  type: string; // 'physics-force' | 'formula-graph' | 'vector-diagram' | 'biology-process' | 'code-execution' | 'timeline-sequence' | 'molecular-diagram' | 'comparison-table'
  description?: string;
  elements: VisualSpecElement[];
  formula?: string;
  keyTakeaway: string;
  diagramData?: any;
}

export interface CheckpointQuestion {
  id?: string;
  text: string;
  type: 'MCQ' | 'conceptual' | 'short answer' | 'application';
  options?: string[];
  correctIndex?: number;
  conceptTested: string;
  hint?: string;
}

export interface LessonSection {
  id: string;
  concept: string;
  strategy: string;
  example: string;
  visualType: string;
  expectedOutcome: string;
  checkpointQuestion: string;
  estimatedDuration: string;
}

export interface LessonPlan {
  topic: string;
  learnerLevel: EducationalLevel;
  objective: LearningObjective;
  language: PreferredLanguage;
  duration: AvailableTime;
  difficulty: number;
  sections: LessonSection[];
  teachingOrder: string[];
  assessmentPlan: string;
  sourceContext?: {
    documentName: string;
    chapter?: string;
    section?: string;
    grounded: boolean;
  };
  preGeneratedSegments?: Record<string, TeachingSegment>;
}

export type TeachingAction =
  | 'CONTINUE'
  | 'SIMPLIFY'
  | 'REEXPLAIN'
  | 'GIVE_ANALOGY'
  | 'GIVE_EXAMPLE'
  | 'INCREASE_DIFFICULTY'
  | 'ASK_FOLLOWUP'
  | 'PRACTICE'
  | 'MOVE_TO_NEXT_CONCEPT';

export interface AdaptiveExplanation {
  analogy: string;
  simplifiedRule: string;
  retestQuestion: string;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  score: number;
  feedback: string;
  misconceptionDetected: string | null;
  correctConcept?: string;
  understandingStatus: 'Demonstrated Mastery' | 'Solid Progress' | 'Needs Reinforcement' | 'Critical Gap';
  confidenceLevel: 'High' | 'Medium' | 'Low';
  nextAction: TeachingAction;
  difficultyAdjustment: number;
  adaptiveExplanation?: AdaptiveExplanation | null;
}

export interface TeachingSegment {
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
  teacherTone: 'calm' | 'encouraging' | 'inquisitive' | 'supportive' | 'focused';
  visualSpec: VisualSpec;
  question: CheckpointQuestion;
  adaptationNotice?: string;
}

export interface AssessmentQuestion {
  id: string;
  concept: string;
  type: 'MCQ' | 'conceptual';
  questionText: string;
  options?: string[];
  correctIndex?: number;
  explanation: string;
  sampleAnswer?: string;
  studentAnswer?: string | number;
  isCorrect?: boolean;
}

export interface Assessment {
  title: string;
  totalQuestions: number;
  questions: AssessmentQuestion[];
  topic?: string;
}

export interface LearningReport {
  topic: string;
  overallScore: number;
  letterGrade: string;
  masteryStatus: string;
  strongAreas: { concept: string; score: number; comment: string }[];
  needsImprovement: { concept: string; score: number; comment: string }[];
  detectedMisconceptions: { issue: string; resolution: string }[];
  recommendedRevision: string[];
  nextRecommendedTopics: { title: string; reason: string; estimatedTime: string }[];
}

export interface LearningPathModule {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'unlocked' | 'locked';
  duration: string;
  description: string;
}

export interface LearningPath {
  mainTopic: string;
  modules: LearningPathModule[];
}

export interface DocumentAnalysisResult {
  fileName: string;
  summary: string;
  chapters: {
    id: string;
    title: string;
    sections: string[];
    concepts: string[];
    pageCount?: number;
  }[];
  definitions: { term: string; definition: string }[];
  keyFormulas: string[];
  hasDiagrams: boolean;
  sourceGrounded: boolean;
}

export interface TeacherState {
  currentSectionIndex: number;
  understandingScore: number; // 0-100
  difficultyLevel: number; // 1-5
  detectedMisconceptions: string[];
  currentMisconception: string | null;
  lastAction: TeachingAction;
  adaptationDescription: string | null;
  questionsAttempted: number;
  questionsCorrect: number;
  cycleState:
    | 'INTRODUCING'
    | 'EXPLAINING'
    | 'DEMONSTRATING'
    | 'QUESTIONING'
    | 'AWAITING_ANSWER'
    | 'EVALUATING'
    | 'ADAPTING'
    | 'REEXPLAINING'
    | 'SECTION_COMPLETED';
}

export interface AppSettings {
  preferredVoice: string; // 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'
  voiceMode?: 'fast' | 'enhanced'; // 'fast' = browser SpeechSynthesis (instant), 'enhanced' = Gemini TTS
  speechRate: number; // 0.8 - 1.2
  autoPlayVoice: boolean;
  showSubtitles: boolean;
  avatarStyle: 'avatar-female' | 'avatar-male' | 'avatar-modern';
  theme: 'dark' | 'light';
  visualDensity: 'comfortable' | 'compact';
}
