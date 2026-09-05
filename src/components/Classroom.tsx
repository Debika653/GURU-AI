import React, { useState, useEffect } from 'react';
import {
  LessonPlan,
  LearnerProfile,
  TeacherState,
  TeachingSegment,
  AnswerEvaluation,
  PreferredLanguage,
  TeachingAction,
  AppSettings,
} from '../types';
import { ApiService } from '../services/apiService';
import { memoryCache } from '../services/cacheService';
import { TeacherAvatar } from './TeacherAvatar';
import { VisualPanel } from './VisualPanel';
import { TeachingIntelligencePanel } from './TeachingIntelligencePanel';
import { InteractiveQuestionCard } from './InteractiveQuestionCard';
import { FollowUpQuestionModal } from './FollowUpQuestionModal';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Award,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface ClassroomProps {
  plan: LessonPlan;
  learnerProfile: LearnerProfile;
  currentLanguage: PreferredLanguage;
  onCompleteLesson: () => void;
  onOpenProfileModal: () => void;
  avatarStyle: 'avatar-female' | 'avatar-male' | 'avatar-modern';
  appSettings?: AppSettings;
}

type LessonMode = 'Conceptual' | 'Standard' | 'Rigorous';

export const Classroom: React.FC<ClassroomProps> = ({
  plan,
  learnerProfile,
  currentLanguage,
  onCompleteLesson,
  onOpenProfileModal,
  avatarStyle,
  appSettings,
}) => {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentSegment, setCurrentSegment] = useState<TeachingSegment | null>(null);
  const [isLoadingSegment, setIsLoadingSegment] = useState(false);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [lessonMode, setLessonMode] = useState<LessonMode>('Standard');

  // Teacher State Machine for adaptive pedagogical reasoning
  const [teacherState, setTeacherState] = useState<TeacherState>({
    currentSectionIndex: 0,
    understandingScore: 78,
    difficultyLevel: 2,
    detectedMisconceptions: [],
    currentMisconception: null,
    lastAction: 'CONTINUE',
    adaptationDescription: null,
    questionsAttempted: 0,
    questionsCorrect: 0,
    cycleState: 'EXPLAINING',
  });

  const sections = plan.sections || [];
  const currentSection = sections[currentSectionIdx];
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Fetch or retrieve cached teaching segment
  const fetchSegment = async (
    adaptationReason?: string | null,
    action: TeachingAction = 'CONTINUE'
  ) => {
    if (!currentSection) return;

    // 1. Check pre-generated segments in plan first
    if (!adaptationReason && action === 'CONTINUE') {
      const pregen = plan.preGeneratedSegments?.[currentSection.id];
      if (pregen) {
        setCurrentSegment(pregen);
        setIsLoadingSegment(false);
        setTeacherState((prev) => ({
          ...prev,
          cycleState: 'EXPLAINING',
        }));
        return;
      }

      // 2. Check in-memory cache
      const cached = memoryCache.getTeachingSegment({
        topic: plan.topic,
        concept: currentSection.concept,
        language: currentLanguage,
        learnerLevel: learnerProfile?.educationalLevel || 'Beginner',
        teachingStyle: learnerProfile?.preferredTeachingStyle || 'Example-driven',
      });

      if (cached) {
        setCurrentSegment(cached);
        setIsLoadingSegment(false);
        setTeacherState((prev) => ({
          ...prev,
          cycleState: 'EXPLAINING',
        }));
        return;
      }
    }

    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const currentAbort = new AbortController();
    abortControllerRef.current = currentAbort;

    setIsLoadingSegment(true);

    try {
      const segment = await ApiService.getTeachingSegment({
        topic: plan.topic,
        currentSection,
        learnerProfile,
        cycleStep: action === 'REEXPLAIN' ? 'REEXPLAIN' : 'EXPLAIN',
        adaptationReason,
        difficultyLevel: teacherState.difficultyLevel,
        previousExplanation: currentSegment?.teacherSpeech,
        language: currentLanguage,
      });

      if (currentAbort.signal.aborted) return;

      memoryCache.setTeachingSegment(
        {
          topic: plan.topic,
          concept: currentSection.concept,
          language: currentLanguage,
          learnerLevel: learnerProfile?.educationalLevel || 'Beginner',
          teachingStyle: learnerProfile?.preferredTeachingStyle || 'Example-driven',
          extra: adaptationReason || '',
        },
        segment
      );

      setCurrentSegment(segment);
      setTeacherState((prev) => ({
        ...prev,
        cycleState: 'EXPLAINING',
      }));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch teaching segment:', err);
      }
    } finally {
      if (!currentAbort.signal.aborted) {
        setIsLoadingSegment(false);
      }
    }
  };

  useEffect(() => {
    fetchSegment();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentSectionIdx, currentLanguage]);

  // Handle student answer submission
  const handleAnswerSubmit = async (answerText: string): Promise<AnswerEvaluation> => {
    setTeacherState((prev) => ({
      ...prev,
      cycleState: 'EVALUATING',
    }));

    const evalResult = await ApiService.evaluateAnswer({
      concept: currentSection?.concept || plan.topic,
      question: currentSegment?.question || currentSection?.checkpointQuestion,
      studentAnswer: answerText,
      previousMisconceptions: teacherState.detectedMisconceptions,
      currentDifficulty: teacherState.difficultyLevel,
      language: currentLanguage,
    });

    const newMisconceptions = evalResult.misconceptionDetected
      ? [...teacherState.detectedMisconceptions, evalResult.misconceptionDetected]
      : teacherState.detectedMisconceptions;

    const newScore = Math.round(
      (teacherState.understandingScore * teacherState.questionsAttempted + evalResult.score) /
        (teacherState.questionsAttempted + 1)
    );

    const newDifficulty = Math.min(
      Math.max(teacherState.difficultyLevel + (evalResult.difficultyAdjustment || 0), 1),
      5
    );

    setTeacherState((prev) => ({
      ...prev,
      understandingScore: newScore,
      difficultyLevel: newDifficulty,
      detectedMisconceptions: newMisconceptions,
      currentMisconception: evalResult.misconceptionDetected,
      lastAction: evalResult.nextAction,
      adaptationDescription: evalResult.adaptiveExplanation
        ? `Deploying physical analogy: ${evalResult.adaptiveExplanation.simplifiedRule}`
        : null,
      questionsAttempted: prev.questionsAttempted + 1,
      questionsCorrect: prev.questionsCorrect + (evalResult.isCorrect ? 1 : 0),
      cycleState: evalResult.isCorrect ? 'SECTION_COMPLETED' : 'ADAPTING',
    }));

    const adaptiveSpeech =
      evalResult.feedback ||
      (evalResult.adaptiveExplanation
        ? `${evalResult.adaptiveExplanation.simplifiedRule}. ${evalResult.adaptiveExplanation.analogy}`
        : null);

    if (adaptiveSpeech) {
      setCurrentSegment((prev) =>
        prev
          ? {
              ...prev,
              currentSpeechScript: adaptiveSpeech,
              teacherSpeech: adaptiveSpeech,
              subtitles: evalResult.feedback || prev.subtitles,
            }
          : prev
      );
    }

    return evalResult;
  };

  const handleContinueAfterEvaluation = () => {
    setIsQuestionActive(false);
    if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx((prev) => prev + 1);
    } else {
      onCompleteLesson();
    }
  };

  const handleRetest = (retestQuestionText?: string) => {
    if (retestQuestionText && currentSegment) {
      setCurrentSegment({
        ...currentSegment,
        question: {
          text: retestQuestionText,
          type: 'conceptual',
          conceptTested: currentSection?.concept || plan.topic,
          hint: 'Think about zero external friction.',
        },
      });
      setIsQuestionActive(true);
    }
  };

  const handleMakeSimpler = () => {
    setTeacherState((prev) => ({
      ...prev,
      difficultyLevel: Math.max(prev.difficultyLevel - 1, 1),
      lastAction: 'SIMPLIFY',
      adaptationDescription: 'Decomposing technical jargon into conversational metaphors',
    }));
    fetchSegment('Student requested simpler explanation', 'SIMPLIFY');
  };

  const handleGiveAnotherExample = () => {
    setTeacherState((prev) => ({
      ...prev,
      lastAction: 'GIVE_ANALOGY',
      adaptationDescription: 'Introducing fresh real-world scenario analogy',
    }));
    fetchSegment('Student requested additional real-world example', 'GIVE_ANALOGY');
  };

  const personaKey =
    avatarStyle === 'avatar-male' ? 'aryan' : avatarStyle === 'avatar-modern' ? 'elena' : 'sophia';

  // Format document / chapter label for Left column
  const chapterHeader = plan.sourceContext?.chapter || `CHAPTER ${currentSectionIdx + 1}`;
  const docOrTopicHeader = (plan.sourceContext?.documentName || plan.topic).toUpperCase();

  return (
    <div
      id="classroom-view"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 animate-fadeIn text-[var(--text-primary)]"
    >
      {/* Top Classroom Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--primary)]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
              {docOrTopicHeader} • {chapterHeader}
            </div>
            <h2 className="text-base sm:text-lg font-serif font-semibold text-[var(--text-primary)]">
              {currentSection?.concept || plan.topic}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-primary)] transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Ask Teacher</span>
          </button>

          <button
            onClick={onCompleteLesson}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition shadow-xs"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Final Assessment</span>
          </button>
        </div>
      </div>

      {/* 3-COLUMN VIRTUAL CLASSROOM LAYOUT:
          LEFT (20%): LESSON & SYLLABUS
          CENTER (55%): AI TEACHER & VISUAL BOARD
          RIGHT (25%): TEACHING INTELLIGENCE
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN (20% - ~lg:col-span-3 xl:col-span-2 or 3)
            LESSON & SYLLABUS: Clean checklist, no cards inside cards
            ======================================================== */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-panel space-y-4">
            {/* Header: Topic / Document & Chapter */}
            <div className="pb-3 border-b border-[var(--border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono text-[var(--text-muted)] block">
                SYLLABUS
              </span>
              <div className="text-xs font-mono font-bold text-[var(--primary)] truncate">
                {plan.topic.toUpperCase()}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
                {chapterHeader}
              </div>
            </div>

            {/* Clean Concept Checklist Timeline */}
            <div className="space-y-1.5">
              {sections.map((sec, idx) => {
                const isCurrent = idx === currentSectionIdx;
                const isCompleted = idx < currentSectionIdx;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setCurrentSectionIdx(idx);
                      setIsQuestionActive(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-start space-x-2.5 ${
                      isCurrent
                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold border border-[var(--primary)]/30'
                        : isCompleted
                        ? 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                      ) : isCurrent ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-[var(--primary)] flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                        </span>
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      )}
                    </span>
                    <div className="truncate">
                      <div className="truncate font-sans">
                        {idx + 1}. {sec.concept}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono capitalize">
                        {isCurrent ? 'active' : isCompleted ? 'completed' : 'upcoming'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom section: LESSON MODE */}
            <div className="pt-3 border-t border-[var(--border)] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] font-mono text-[var(--text-muted)] block">
                LESSON MODE
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['Conceptual', 'Standard', 'Rigorous'] as LessonMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLessonMode(mode)}
                    className={`py-1.5 text-center text-[11px] font-mono rounded-lg transition ${
                      lessonMode === mode
                        ? 'bg-[var(--primary)] text-white font-bold'
                        : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            CENTER COLUMN (55% - ~lg:col-span-6 xl:col-span-7)
            AI TEACHER & VISUAL BOARD
            ======================================================== */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-5">
          {/* Main AI Teacher Stage */}
          <TeacherAvatar
            speechText={currentSegment?.currentSpeechScript || currentSegment?.teacherSpeech || ''}
            subtitles={currentSegment?.subtitles || ''}
            tone={currentSegment?.teacherTone || 'calm'}
            language={currentLanguage}
            isEvaluating={teacherState.cycleState === 'EVALUATING'}
            avatarPersona={personaKey}
            adaptationNotice={teacherState.adaptationDescription}
            onAskQuestion={() => setIsAskModalOpen(true)}
            autoPlay={appSettings?.autoPlayVoice ?? true}
            preferredVoice={appSettings?.preferredVoice || 'Kore'}
            voiceMode={appSettings?.voiceMode || 'fast'}
            realWorldExample={currentSection?.example}
            cycleState={teacherState.cycleState}
            onSpeechStart={() => {
              setTeacherState((prev) => ({
                ...prev,
                cycleState: 'EXPLAINING',
              }));
            }}
            onSpeechEnd={() => {
              setIsQuestionActive(true);
              setTeacherState((prev) => ({
                ...prev,
                cycleState: 'QUESTIONING',
              }));
            }}
          />

          {/* Dedicated VISUAL BOARD */}
          <VisualPanel
            visualSpec={currentSegment?.visualSpec}
            topic={currentSection?.concept || plan.topic}
          />

          {/* Checkpoint Question Experience: appears only when triggered/reached */}
          {isQuestionActive && currentSegment?.question ? (
            <InteractiveQuestionCard
              question={currentSegment.question}
              onAnswerSubmit={handleAnswerSubmit}
              onContinue={handleContinueAfterEvaluation}
              onRetest={handleRetest}
            />
          ) : (
            /* Subtle Checkpoint Trigger Banner */
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-panel">
              <div className="flex items-center space-x-2 text-xs text-[var(--text-secondary)]">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                <span>Ready to verify your understanding of {currentSection?.concept}?</span>
              </div>
              <button
                id="btn-trigger-question"
                type="button"
                onClick={() => setIsQuestionActive(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95 shadow-xs shrink-0"
              >
                <span>Checkpoint Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Classroom Adaptations */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs shadow-panel">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider pl-1 font-mono">
              Adapt Explanation:
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleMakeSimpler}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-medium text-xs transition"
              >
                Make Simpler
              </button>
              <button
                type="button"
                onClick={handleGiveAnotherExample}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-medium text-xs transition"
              >
                Give Example
              </button>
              <button
                type="button"
                onClick={() => setIsAskModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold text-xs border border-[var(--primary)]/30 hover:bg-[var(--primary-subtle)] transition"
              >
                Ask "Why?"
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN (25% - ~lg:col-span-3 xl:col-span-3)
            TEACHING INTELLIGENCE: Single compact panel with sections
            ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <TeachingIntelligencePanel
            conceptName={currentSection?.concept || plan.topic}
            teacherState={teacherState}
            sourceContext={plan.sourceContext}
          />

          {/* Learner Profile Quick Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-xs space-y-2 shadow-panel">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] font-mono text-[var(--text-muted)]">
                Learner Context
              </span>
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="text-[10px] text-[var(--primary)] hover:underline font-mono uppercase"
              >
                Edit
              </button>
            </div>
            <div className="space-y-1 text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Target Level:</span>
                <span className="font-semibold text-[var(--text-primary)]">{learnerProfile?.educationalLevel || 'Beginner'}</span>
              </div>
              <div className="flex justify-between">
                <span>Style:</span>
                <span className="font-semibold text-[var(--text-primary)]">{learnerProfile?.preferredTeachingStyle || 'Example-driven'}</span>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-semibold text-[var(--text-primary)]">{currentLanguage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Question Modal */}
      <FollowUpQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        topic={plan.topic}
        currentConcept={currentSection?.concept || plan.topic}
        learnerProfile={learnerProfile}
        language={currentLanguage}
      />
    </div>
  );
};
