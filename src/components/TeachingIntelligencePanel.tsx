import React from 'react';
import { TeacherState, TeachingAction } from '../types';
import { Brain, Activity, CheckCircle2 } from 'lucide-react';

interface TeachingIntelligencePanelProps {
  conceptName: string;
  teacherState: TeacherState;
  sourceContext?: {
    documentName?: string;
    chapter?: string;
    grounded?: boolean;
  };
}

export const TeachingIntelligencePanel: React.FC<TeachingIntelligencePanelProps> = ({
  conceptName,
  teacherState,
  sourceContext,
}) => {
  const {
    understandingScore = 78,
    difficultyLevel = 2,
    currentMisconception,
    lastAction,
    adaptationDescription,
  } = teacherState;

  // Format concise action text
  const formatNextAction = (action: TeachingAction) => {
    switch (action) {
      case 'CONTINUE':
        return 'Verify understanding & advance';
      case 'REEXPLAIN':
        return 'Alternative mental model';
      case 'GIVE_ANALOGY':
        return 'Deploy real-world analogy';
      case 'SIMPLIFY':
        return 'Decompose into simpler terms';
      case 'INCREASE_DIFFICULTY':
        return 'Application challenge';
      default:
        return 'Verify understanding';
    }
  };

  // Concise diagnosis
  const getConciseDiagnosis = () => {
    if (!currentMisconception) {
      return 'No blocker detected';
    }
    return `Needs reinforcement: ${currentMisconception}`;
  };

  // Concise adaptation
  const getConciseAdaptation = () => {
    if (adaptationDescription) {
      return adaptationDescription.length > 55
        ? adaptationDescription.slice(0, 52) + '...'
        : adaptationDescription;
    }
    return 'Explaining with an example';
  };

  return (
    <div
      id="teaching-intelligence-panel"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 text-[var(--text-primary)] font-sans space-y-4 shadow-panel"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] font-mono text-[var(--text-secondary)]">
            TEACHING INTELLIGENCE
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="text-[10px] font-mono text-[var(--success)]">Active</span>
        </div>
      </div>

      {/* Sections inside one compact panel */}
      <div className="space-y-3.5 text-xs">
        {/* Current Concept */}
        <div>
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block font-mono">
            Current Concept
          </span>
          <div className="text-sm font-serif font-medium mt-0.5 text-[var(--text-primary)]">
            {conceptName || "Newton's First Law"}
          </div>
        </div>

        {/* Understanding */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider font-mono">
              Understanding
            </span>
            <span className="font-mono text-xs font-bold text-[var(--primary)]">{understandingScore}%</span>
          </div>
          <div className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[var(--primary)]"
              style={{ width: `${Math.min(Math.max(understandingScore, 5), 100)}%` }}
            />
          </div>
        </div>

        {/* Diagnosis */}
        <div className="pt-1 border-t border-[var(--border)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block font-mono">
            Diagnosis
          </span>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
            {getConciseDiagnosis()}
          </p>
        </div>

        {/* Adaptation */}
        <div className="pt-1 border-t border-[var(--border)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block font-mono">
            Adaptation
          </span>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
            {getConciseAdaptation()}
          </p>
        </div>

        {/* Next & Level */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block font-mono">
              Next
            </span>
            <span className="text-xs font-medium text-[var(--text-primary)] mt-0.5 block">
              {formatNextAction(lastAction)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block font-mono">
              Level
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--primary)] mt-0.5 inline-block">
              {difficultyLevel} / 5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
