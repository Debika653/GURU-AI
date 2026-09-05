import { LessonPlan, TeachingSegment, Assessment, VisualSpec, AnswerEvaluation } from '../types';

interface CacheKeyParams {
  topic: string;
  learnerLevel?: string;
  language?: string;
  concept?: string;
  teachingStyle?: string;
  extra?: string;
}

class MemoryCacheService {
  private lessonPlans = new Map<string, LessonPlan>();
  private teachingSegments = new Map<string, TeachingSegment>();
  private assessments = new Map<string, Assessment>();
  private visuals = new Map<string, VisualSpec>();
  private evaluations = new Map<string, AnswerEvaluation>();
  private audioBlobs = new Map<string, string>(); // base64 / blob url

  private buildKey(params: CacheKeyParams): string {
    const {
      topic = '',
      learnerLevel = 'Beginner',
      language = 'English',
      concept = '',
      teachingStyle = 'Example-driven',
      extra = '',
    } = params;

    return `${topic.trim().toLowerCase()}|${learnerLevel.toLowerCase()}|${language.toLowerCase()}|${concept.trim().toLowerCase()}|${teachingStyle.toLowerCase()}|${extra.toLowerCase()}`;
  }

  // Lesson Plan
  public getLessonPlan(params: CacheKeyParams): LessonPlan | null {
    const key = this.buildKey(params);
    return this.lessonPlans.get(key) || null;
  }

  public setLessonPlan(params: CacheKeyParams, plan: LessonPlan): void {
    const key = this.buildKey(params);
    this.lessonPlans.set(key, plan);
  }

  // Teaching Segment
  public getTeachingSegment(params: CacheKeyParams): TeachingSegment | null {
    const key = this.buildKey(params);
    return this.teachingSegments.get(key) || null;
  }

  public setTeachingSegment(params: CacheKeyParams, segment: TeachingSegment): void {
    const key = this.buildKey(params);
    this.teachingSegments.set(key, segment);
  }

  // Visual Spec
  public getVisualSpec(concept: string, topic: string): VisualSpec | null {
    const key = `${topic.toLowerCase()}:${concept.toLowerCase()}`;
    return this.visuals.get(key) || null;
  }

  public setVisualSpec(concept: string, topic: string, spec: VisualSpec): void {
    const key = `${topic.toLowerCase()}:${concept.toLowerCase()}`;
    this.visuals.set(key, spec);
  }

  // Assessment
  public getAssessment(topic: string, language: string = 'English'): Assessment | null {
    const key = `${topic.toLowerCase()}:${language.toLowerCase()}`;
    return this.assessments.get(key) || null;
  }

  public setAssessment(topic: string, language: string, assessment: Assessment): void {
    const key = `${topic.toLowerCase()}:${language.toLowerCase()}`;
    this.assessments.set(key, assessment);
  }

  // Audio Cache
  public getAudio(text: string, voice: string = 'Kore'): string | null {
    const key = `${voice}:${text.trim().slice(0, 150)}`;
    return this.audioBlobs.get(key) || null;
  }

  public setAudio(text: string, voice: string, audioUrl: string): void {
    const key = `${voice}:${text.trim().slice(0, 150)}`;
    this.audioBlobs.set(key, audioUrl);
  }

  // Clear Session
  public clearSession(): void {
    this.lessonPlans.clear();
    this.teachingSegments.clear();
    this.assessments.clear();
    this.visuals.clear();
    this.evaluations.clear();
    this.audioBlobs.clear();
  }
}

export const memoryCache = new MemoryCacheService();
