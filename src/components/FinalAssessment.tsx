import React, { useState } from 'react';
import { Assessment } from '../types';
import { Award, ArrowRight, Check, Loader2 } from 'lucide-react';

interface FinalAssessmentProps {
  assessment: Assessment;
  topic: string;
  onComplete: (results: {
    totalQuestions: number;
    score: number;
    answers: { questionId: string; answer: string; isCorrect: boolean }[];
  }) => void;
  onExit: () => void;
}

export const FinalAssessment: React.FC<FinalAssessmentProps> = ({
  assessment,
  topic,
  onComplete,
  onExit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = assessment.questions || [];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (!currentQ) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: idx,
    }));
  };

  const handleTextAnswer = (val: string) => {
    if (!currentQ) return;
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const handleFinish = () => {
    setIsSubmitting(true);

    let correctCount = 0;
    const answersPayload = questions.map((q) => {
      const ans = studentAnswers[q.id];
      let isCorrect = false;

      if (q.type === 'MCQ') {
        isCorrect = ans === q.correctIndex;
      } else {
        isCorrect = typeof ans === 'string' && ans.trim().length > 15;
      }

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        answer: String(ans !== undefined ? ans : ''),
        isCorrect,
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete({
        totalQuestions: questions.length,
        score: scorePercentage,
        answers: answersPayload,
      });
    }, 600);
  };

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-[var(--text-secondary)]">
        <p>No assessment questions available.</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-medium"
        >
          Return to Classroom
        </button>
      </div>
    );
  }

  const isCurrentAnswered = studentAnswers[currentQ.id] !== undefined && studentAnswers[currentQ.id] !== '';
  const isLast = currentIdx === questions.length - 1;

  return (
    <div
      id="final-assessment-view"
      className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn text-[var(--text-primary)] font-sans"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-panel">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif font-medium text-[var(--text-primary)]">
              Final Comprehensive Assessment
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-mono">Topic: {topic}</p>
          </div>
        </div>

        {/* Progress Counter */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider font-mono">
            Progress
          </span>
          <div className="text-sm font-mono font-bold text-[var(--primary)]">
            {currentIdx + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-[var(--primary)] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-panel space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--primary)]">
            Concept: {currentQ.concept}
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-secondary)] uppercase font-mono font-semibold">
            {currentQ.type}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-serif font-medium text-[var(--text-primary)] leading-relaxed">
          {currentQ.questionText}
        </h3>

        {/* Options */}
        {currentQ.type === 'MCQ' && currentQ.options ? (
          <div className="space-y-2.5">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = studentAnswers[currentQ.id] === oIdx;
              const letter = String.fromCharCode(65 + oIdx);
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(oIdx)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition ${
                    isSelected
                      ? 'bg-[var(--primary-subtle)] border-[var(--primary)] text-[var(--text-primary)] font-medium shadow-xs'
                      : 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isSelected
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]'
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
          <div className="space-y-2">
            <textarea
              value={String(studentAnswers[currentQ.id] || '')}
              onChange={(e) => handleTextAnswer(e.target.value)}
              placeholder="Write your explanation or solve the scenario..."
              rows={4}
              className="w-full rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => Math.max(prev - 1, 0))}
            className="px-4 py-2 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {!isLast ? (
              <button
                type="button"
                disabled={!isCurrentAnswered}
                onClick={() => setCurrentIdx((prev) => Math.min(prev + 1, questions.length - 1))}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95 disabled:opacity-40 shadow-xs"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isCurrentAnswered || isSubmitting}
                onClick={handleFinish}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95 shadow-xs disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Computing Evaluation...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Assessment</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
