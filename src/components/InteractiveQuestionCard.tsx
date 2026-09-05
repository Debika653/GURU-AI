import React, { useState } from 'react';
import { CheckpointQuestion, AnswerEvaluation } from '../types';
import { CheckCircle2, AlertCircle, ArrowRight, Lightbulb, HelpCircle, Send, RefreshCw, Loader2 } from 'lucide-react';

interface InteractiveQuestionCardProps {
  question?: CheckpointQuestion;
  onAnswerSubmit: (answerText: string) => Promise<AnswerEvaluation>;
  onContinue: () => void;
  onRetest: (retestQuestionText?: string) => void;
  isLoading?: boolean;
}

export const InteractiveQuestionCard: React.FC<InteractiveQuestionCardProps> = ({
  question,
  onAnswerSubmit,
  onContinue,
  onRetest,
  isLoading = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!question) {
    return null;
  }

  const { text, type, options = [], hint, conceptTested } = question;

  const handleSubmit = async () => {
    let answerText = '';
    if (type === 'MCQ' && selectedOption !== null) {
      answerText = options[selectedOption] || `Option ${selectedOption + 1}`;
    } else {
      answerText = writtenAnswer.trim();
    }

    if (!answerText) return;

    setIsSubmitting(true);
    try {
      const evalResult = await onAnswerSubmit(answerText);
      setEvaluation(evalResult);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNext = () => {
    setEvaluation(null);
    setSelectedOption(null);
    setWrittenAnswer('');
    setShowHint(false);
    onContinue();
  };

  const handleTriggerRetest = () => {
    const retestText = evaluation?.adaptiveExplanation?.retestQuestion;
    setEvaluation(null);
    setSelectedOption(null);
    setWrittenAnswer('');
    setShowHint(false);
    onRetest(retestText);
  };

  return (
    <div
      id="interactive-question-card"
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 text-[var(--text-primary)] font-sans space-y-4 shadow-panel animate-fadeIn"
    >
      {/* Question Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono text-[var(--primary)] block">
            YOUR TURN
          </span>
          <span className="text-xs text-[var(--text-secondary)]">Let's check your understanding.</span>
        </div>

        {hint && !evaluation && (
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center space-x-1 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
          </button>
        )}
      </div>

      {/* Hint Banner if toggled */}
      {showHint && hint && (
        <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-start space-x-2 text-xs text-[var(--text-secondary)]">
          <Lightbulb className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
          <span><strong>Hint:</strong> {hint}</span>
        </div>
      )}

      {/* Question Text */}
      <div className="py-1">
        <h4 className="text-base sm:text-lg font-serif font-medium text-[var(--text-primary)] leading-snug">
          {text}
        </h4>
      </div>

      {/* Form or Evaluation State */}
      {!evaluation ? (
        <div className="space-y-4">
          {type === 'MCQ' && options.length > 0 ? (
            <div className="space-y-2">
              {options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--text-primary)] font-medium shadow-xs'
                        : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={writtenAnswer}
              onChange={(e) => setWrittenAnswer(e.target.value)}
              placeholder="Explain what happens in your own words..."
              rows={3}
              className="w-full rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition"
            />
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-1">
            <button
              id="btn-submit-answer"
              type="button"
              disabled={isSubmitting || (type === 'MCQ' ? selectedOption === null : !writtenAnswer.trim())}
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-mono text-xs uppercase tracking-wider font-semibold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking your understanding...</span>
                </>
              ) : (
                <>
                  <span>SUBMIT</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Adaptive Feedback */
        <div className="space-y-4 pt-1 animate-fadeIn">
          {evaluation.isCorrect ? (
            /* Correct Feedback */
            <div className="p-4 rounded-xl border border-[var(--success)]/30 bg-[var(--success-subtle)] space-y-1.5 text-[var(--text-primary)]">
              <div className="flex items-center space-x-2 text-[var(--success)]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold text-sm">✓ Concept understood</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                "Great. Let's move one level deeper."
              </p>
              {evaluation.feedback && (
                <p className="text-xs text-[var(--text-primary)] pt-1">{evaluation.feedback}</p>
              )}
            </div>
          ) : (
            /* Incorrect Feedback - subtle, calm, no giant harsh red card */
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-subtle)] space-y-1 text-[var(--text-primary)]">
                <div className="flex items-center space-x-2 text-[var(--warning)]">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold text-xs uppercase tracking-wide font-mono">
                    Let's look at this another way
                  </span>
                </div>
                {evaluation.feedback && (
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed pt-0.5">
                    {evaluation.feedback}
                  </p>
                )}
              </div>

              {/* Detected Misconception */}
              {evaluation.misconceptionDetected && (
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider font-mono block">
                    Detected Misconception
                  </span>
                  <p className="text-xs text-[var(--text-primary)]">
                    {evaluation.misconceptionDetected}
                  </p>
                  {evaluation.correctConcept && (
                    <p className="text-xs text-[var(--text-secondary)] pt-1">
                      <strong>Core Reality:</strong> {evaluation.correctConcept}
                    </p>
                  )}
                </div>
              )}

              {/* New Explanation & Analogy */}
              {evaluation.adaptiveExplanation && (
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[var(--primary)] tracking-wider font-mono block">
                    New Explanation & Intuition
                  </span>
                  <p className="italic text-[var(--text-primary)]">
                    "{evaluation.adaptiveExplanation.analogy}"
                  </p>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    <strong>Rule:</strong> {evaluation.adaptiveExplanation.simplifiedRule}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-2">
            {!evaluation.isCorrect && (
              <button
                type="button"
                onClick={handleTriggerRetest}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--border-strong)] text-xs font-semibold text-[var(--text-primary)] transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}

            <button
              id="btn-continue-lesson"
              type="button"
              onClick={handleResetForNext}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold transition active:scale-95"
            >
              <span>{evaluation.isCorrect ? 'Proceed to Next Concept' : 'Continue Lesson'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
