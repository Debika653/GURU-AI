import React, { useState } from 'react';
import { ApiService } from '../services/apiService';
import { LearnerProfile, PreferredLanguage } from '../types';
import { MessageSquare, X, Send, ArrowRight, Loader2 } from 'lucide-react';

interface FollowUpQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  currentConcept: string;
  learnerProfile: LearnerProfile;
  language: PreferredLanguage;
  onAnswerReceived?: (answerText: string) => void;
}

export const FollowUpQuestionModal: React.FC<FollowUpQuestionModalProps> = ({
  isOpen,
  onClose,
  topic,
  currentConcept,
  learnerProfile,
  language,
  onAnswerReceived,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; keyPoint: string; resumePrompt: string } | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Can you explain this more simply?',
    'Give me another real-world example.',
    'Why does this actually happen physically?',
    'Explain this in conversational terms.',
    'What is a common pitfall students make here?',
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const res = await ApiService.askStudentQuestion({
        userQuestion: q,
        currentConcept,
        topic,
        learnerProfile,
        language,
      });

      setResponse(res);
      if (onAnswerReceived) {
        onAnswerReceived(res.answer);
      }
    } catch (err) {
      console.error('Failed to answer student question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = () => {
    setResponse(null);
    setUserQuery('');
    onClose();
  };

  return (
    <div
      id="followup-question-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-4 font-sans text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-[var(--text-primary)]">
                Ask Guru AI
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                Context: {currentConcept || topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!response ? (
          <div className="space-y-4">
            {/* Quick Prompts */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                Quick Inquiries
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUserQuery(prompt);
                      handleAsk(prompt);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] transition text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-2.5 pt-1">
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Type any doubt, question, or request for clarification..."
                rows={3}
                className="w-full rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isLoading || !userQuery.trim()}
                  onClick={() => handleAsk()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95 disabled:opacity-40 shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Consulting Teacher...</span>
                    </>
                  ) : (
                    <>
                      <span>Ask Teacher</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Response State */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] font-mono block">
                Teacher's Explanation
              </span>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed font-serif text-sm">
                "{response.answer}"
              </p>
              {response.keyPoint && (
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-mono mt-2">
                  <strong className="text-[var(--text-primary)]">Key Concept:</strong> {response.keyPoint}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setResponse(null)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              >
                Ask Another Question
              </button>

              <button
                type="button"
                onClick={handleResume}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold transition active:scale-95"
              >
                <span>Resume Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
