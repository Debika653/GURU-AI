import {
  DocumentAnalysisResult,
  LessonPlan,
  LearnerProfile,
  TeachingSegment,
  AnswerEvaluation,
  Assessment,
  LearningReport,
  LearningPath,
  LessonSection,
} from '../types';

export class ApiService {
  private static async post<T>(endpoint: string, payload: any): Promise<T> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Error calling ${endpoint}:`, error);
      throw error;
    }
  }

  // 1. Analyze Document/Material
  static async analyzeMaterial(data: {
    fileName: string;
    fileType: string;
    base64Data?: string;
    textContent?: string;
  }): Promise<DocumentAnalysisResult> {
    const res = await this.post<any>('/api/analyze-material', data);
    return res;
  }

  // 2. Generate Lesson Plan
  static async generateLessonPlan(data: {
    topic: string;
    sourceContext?: any;
    sourceMaterial?: any;
    learnerProfile: LearnerProfile;
    customInstruction?: string;
    language?: string;
  }): Promise<LessonPlan> {
    const payload = {
      topic: data.topic,
      sourceContext: data.sourceContext || data.sourceMaterial,
      learnerProfile: data.learnerProfile,
      customInstruction: data.customInstruction,
      language: data.language || data.learnerProfile?.preferredLanguage,
    };
    const res = await this.post<{ success: boolean; plan: LessonPlan }>('/api/generate-lesson-plan', payload);
    return res.plan;
  }

  // 3. Generate Teaching Cycle Segment
  static async getTeachingSegment(data: {
    topic: string;
    currentSection: LessonSection;
    learnerProfile: LearnerProfile;
    cycleStep: string;
    adaptationReason?: string | null;
    difficultyLevel?: number;
    previousExplanation?: string;
    language?: string;
  }): Promise<TeachingSegment> {
    const res = await this.post<{ success: boolean; segment: TeachingSegment }>('/api/teaching-cycle', data);
    return res.segment;
  }

  // 4. Evaluate Student Answer
  static async evaluateAnswer(data: {
    concept: string;
    question: any;
    studentAnswer: string;
    previousMisconceptions?: string[];
    currentDifficulty?: number;
    language?: string;
  }): Promise<AnswerEvaluation> {
    const res = await this.post<{ success: boolean; evaluation: AnswerEvaluation }>('/api/evaluate-answer', data);
    return res.evaluation;
  }

  // 5. Ask Student Follow-up Question
  static async askStudentQuestion(data: {
    userQuestion: string;
    currentConcept: string;
    topic: string;
    lessonProgress?: string;
    learnerProfile: LearnerProfile;
    language?: string;
  }): Promise<{ answer: string; keyPoint: string; resumePrompt: string }> {
    const res = await this.post<any>('/api/student-question', data);
    return res;
  }

  // 6. Generate Assessment
  static async generateAssessment(data: {
    topic: string;
    conceptsCovered?: string[];
    concepts?: string[];
    learnerLevel?: string;
    learnerProfile?: LearnerProfile;
    language?: string;
  }): Promise<Assessment> {
    const payload = {
      topic: data.topic,
      conceptsCovered: data.conceptsCovered || data.concepts || [],
      learnerLevel: data.learnerLevel || data.learnerProfile?.educationalLevel || 'Beginner',
      language: data.language || data.learnerProfile?.preferredLanguage || 'English',
    };
    const res = await this.post<{ success: boolean; assessment: Assessment }>('/api/generate-assessment', payload);
    return res.assessment;
  }

  // 7. Generate Learning Report
  static async generateReport(data: {
    topic: string;
    learnerProfile: LearnerProfile;
    assessmentResults: any;
    sessionMetrics?: any;
    language?: string;
  }): Promise<LearningReport> {
    const payload = {
      topic: data.topic,
      learnerProfile: data.learnerProfile,
      assessmentResults: data.assessmentResults,
      sessionMetrics: data.sessionMetrics || {
        completionRate: 100,
        averageDifficulty: 2.5,
        misconceptionsEncountered: 1,
      },
    };
    const res = await this.post<{ success: boolean; report: LearningReport }>('/api/generate-report', payload);
    return res.report;
  }

  static async generateLearningReport(data: {
    topic: string;
    assessmentResults: any;
    sessionMetrics?: any;
    learnerProfile: LearnerProfile;
    language?: string;
  }): Promise<LearningReport> {
    return this.generateReport(data);
  }

  // 8. Generate Dynamic Learning Path
  static async generateLearningPath(data: {
    topic?: string;
    mainTopic?: string;
    learnerProfile?: LearnerProfile;
    learnerLevel?: string;
    learnerGoal?: string;
    availableTime?: string;
  }): Promise<LearningPath> {
    const payload = {
      topic: data.mainTopic || data.topic || 'Curriculum',
      learnerProfile: data.learnerProfile || {
        name: 'Learner',
        educationalLevel: data.learnerLevel || 'Beginner',
        existingKnowledge: 'Basic understanding',
        learningObjective: data.learnerGoal || 'Understand concept',
        preferredLanguage: 'English',
        preferredTeachingStyle: 'Example-driven',
        availableTime: data.availableTime || '20 minutes',
        desiredDepth: 'Standard',
      },
    };
    const res = await this.post<{ success: boolean; path: LearningPath }>('/api/generate-learning-path', payload);
    return res.path;
  }

  // 9. Fetch Speech Audio (Gemini TTS)
  static async fetchTTS(text: string, voiceName?: string): Promise<string | null> {
    try {
      const res = await this.post<any>('/api/tts', { text, voiceName });
      if (res.success && res.audioBase64) {
        return `data:audio/wav;base64,${res.audioBase64}`;
      }
      return null;
    } catch {
      return null;
    }
  }
}
