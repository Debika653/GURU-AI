import React, { useState } from 'react';
import { Sparkles, UploadCloud, Brain, BookOpen, Layers, ArrowRight, Globe, Compass, History } from 'lucide-react';
import type { LessonRecord } from '../services/firebase';

interface LandingHeroProps {
  onStartTopic: (topic: string) => void;
  onOpenUpload: () => void;
  onTriggerDemo: () => void;
  onSelectPresetSubject: (presetId: string) => void;
  userLessons?: LessonRecord[];
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartTopic,
  onOpenUpload,
  onTriggerDemo,
  onSelectPresetSubject,
  userLessons = [],
}) => {
  const [customTopic, setCustomTopic] = useState('');

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    onStartTopic(customTopic.trim());
  };

  const featureHighlights = [
    {
      icon: <Brain className="w-5 h-5 text-[var(--primary)]" />,
      title: 'Adaptive Teaching',
      desc: 'Detects student misconceptions and pivots instantly with customized analogies and progressive mental models.',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-[var(--secondary)]" />,
      title: 'Source-Grounded Learning',
      desc: 'Upload notes, PDFs, or textbook chapters to anchor lessons directly in verified educational material.',
    },
    {
      icon: <Layers className="w-5 h-5 text-[var(--success)]" />,
      title: 'Visual Learning',
      desc: 'Subject-aware interactive boards render force diagrams, mathematical graphs, code flow, and biology cycles.',
    },
    {
      icon: <Globe className="w-5 h-5 text-[var(--warning)]" />,
      title: 'Multilingual Teaching',
      desc: 'Fluid instruction across English, Hindi, Hinglish, Bengali, Tamil, and Spanish without losing lesson continuity.',
    },
  ];

  return (
    <div id="landing-hero" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-14 text-center shadow-panel">
        {/* Subtle ambient lighting */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[var(--primary)]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[var(--secondary)]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs">
            <img
              src="/guru-ai-logo.jpg"
              alt="Guru AI"
              className="w-5 h-5 rounded-md object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-[var(--text-primary)]">
              GURU AI <span className="text-[var(--text-secondary)] font-normal">• ADAPTIVE VIRTUAL CLASSROOM</span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-[var(--text-primary)] leading-[1.08]">
            LEARN ANYTHING.
            <br />
            <span className="text-[var(--primary)]">YOUR WAY.</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Meet <strong className="text-[var(--text-primary)] font-semibold">Guru AI</strong> — your personal adaptive teacher that explains, asks, evaluates, and adapts to how you learn.
          </p>

          {/* Quick Topic Input */}
          <form onSubmit={handleTopicSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="What do you want to learn today? (e.g. Newton's Laws, React Hooks, Photosynthesis)..."
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95 shadow-sm shrink-0"
            >
              Start Learning
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="btn-hero-demo"
              onClick={onTriggerDemo}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Demo Lesson</span>
            </button>

            <button
              id="btn-hero-upload"
              onClick={onOpenUpload}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider transition active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-[var(--primary)]" />
              <span>Upload Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Feature Highlights */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] font-mono">
            Key Capabilities
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[var(--text-primary)]">
            Designed for Genuine Conceptual Mastery
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureHighlights.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition space-y-3"
            >
              <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] w-fit border border-[var(--border)]">
                {feat.icon}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{feat.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Lessons (if user has completed lessons) */}
      {userLessons.length > 0 && (
        <div id="recent-lessons-section" className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-semibold text-[var(--text-primary)]">
            <History className="w-4 h-4 text-[var(--primary)]" />
            <span>Recent Learning Sessions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userLessons.slice(0, 6).map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => onStartTopic(lesson.topic)}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition">
                    {lesson.topic}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Score: {lesson.assessmentScore || 85}% • {lesson.language || 'English'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
