import React, { useState } from 'react';
import {
  LearnerProfile,
  EducationalLevel,
  TeachingStyle,
  AvailableTime,
  DesiredDepth,
  PreferredLanguage,
} from '../types';
import { Sparkles, ArrowRight, ArrowLeft, Check, X, BookOpen, Compass, Clock, GraduationCap } from 'lucide-react';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLesson?: (topic: string, profile: LearnerProfile) => void;
  onStartTopic?: (topic: string) => void;
  initialProfile?: LearnerProfile;
  currentLanguage?: PreferredLanguage;
  onOpenUpload?: () => void;
  onTriggerDemo?: () => void;
}

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  onStartLesson,
  onStartTopic,
  initialProfile,
  currentLanguage = 'English',
  onOpenUpload,
  onTriggerDemo,
}) => {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<EducationalLevel>(initialProfile?.educationalLevel || 'Beginner');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<TeachingStyle>(initialProfile?.preferredTeachingStyle || 'Example-driven');
  const [depth, setDepth] = useState<DesiredDepth>(initialProfile?.desiredDepth || 'Standard');
  const [time, setTime] = useState<AvailableTime>(initialProfile?.availableTime || '20 minutes');

  if (!isOpen) return null;

  const popularTopics = [
    "Newton's Laws of Motion",
    'Photosynthesis & Light Reactions',
    'React State & Component Lifecycle',
    'Quantum Superposition & Entanglement',
    'Calculus: Derivatives & Rates of Change',
    'Mitosis vs Meiosis Cell Division',
  ];

  const handleStart = () => {
    if (!topic.trim()) return;
    const configuredProfile: LearnerProfile = {
      name: initialProfile?.name || 'Learner',
      existingKnowledge: initialProfile?.existingKnowledge || 'Basic understanding',
      learningObjective: initialProfile?.learningObjective || 'Understand core concepts',
      naturalLanguageInstruction: initialProfile?.naturalLanguageInstruction || '',
      ...initialProfile,
      educationalLevel: level,
      preferredTeachingStyle: style,
      desiredDepth: depth,
      availableTime: time,
      preferredLanguage: currentLanguage,
    };
    if (onStartLesson) {
      onStartLesson(topic.trim(), configuredProfile);
    } else if (onStartTopic) {
      onStartTopic(topic.trim());
    }
    onClose();
    setStep(1);
  };

  return (
    <div
      id="create-lesson-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl text-[var(--text-primary)] font-sans space-y-6">
        {/* Header & Step Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] font-mono">
              Step {step} of 5
            </span>
            <h2 className="text-lg font-serif font-medium mt-0.5">Create Custom Lesson</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Your Level */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Step 1 • Your Educational Level</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                How should Guru AI calibrate terminology and depth?
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as EducationalLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                    level === lvl
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold shadow-xs'
                      : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mb-1.5" />
                  <span className="text-xs">{lvl}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What do you want to learn? */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Step 2 • What do you want to learn?</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Type any subject, theorem, code concept, or choose a quick prompt.
              </p>
            </div>
            <input
              type="text"
              autoFocus
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Special Relativity, Binary Search, Mitochondria..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Popular suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {popularTopics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition text-left"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Teaching Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Step 3 • Teaching Preferences</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Choose your preferred pedagogical style and conceptual depth.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Teaching Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Example-driven',
                  'Visual',
                  'Step-by-step',
                  'Socratic/question-based',
                  'Simple & conversational',
                  'Technical',
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStyle(st as TeachingStyle)}
                    className={`px-3 py-2 rounded-xl border text-xs text-left transition ${
                      style === st
                        ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Desired Depth
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Quick overview', 'Standard', 'Deep technical'] as DesiredDepth[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`px-2.5 py-2 rounded-xl border text-xs text-center transition ${
                      depth === d
                        ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Available Time */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Step 4 • Lesson Time</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                How much time do you have for this teaching session?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {(['10 minutes', '20 minutes', '30 minutes', '60 minutes'] as AvailableTime[]).map((tm) => (
                <button
                  key={tm}
                  type="button"
                  onClick={() => setTime(tm)}
                  className={`p-3 rounded-xl border text-center transition flex items-center justify-center space-x-2 ${
                    time === tm
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                      : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{tm}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Start & Review */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Step 5 • Ready to Start</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Guru AI will immediately synthesize an adaptive curriculum.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Topic:</span>
                <span className="font-semibold text-[var(--text-primary)]">{topic || "Newton's Laws of Motion"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Level:</span>
                <span className="text-[var(--text-primary)]">{level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Teaching Style:</span>
                <span className="text-[var(--text-primary)]">{style}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Duration:</span>
                <span className="text-[var(--text-primary)]">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Language:</span>
                <span className="text-[var(--text-primary)]">{currentLanguage}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(s - 1, 1))}
              className="flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              disabled={step === 2 && !topic.trim()}
              onClick={() => setStep((s) => Math.min(s + 1, 5))}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-md transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Learning</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
