import React from 'react';
import { LearningPath, LearningPathModule } from '../types';
import { CheckCircle, Lock, Play, Clock, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

interface LearningPathViewProps {
  path: LearningPath;
  onSelectModule: (moduleTitle: string) => void;
  onBackToLesson: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  path,
  onSelectModule,
  onBackToLesson,
}) => {
  const modules = path.modules || [];

  return (
    <div
      id="learning-path-view"
      className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLesson}
            className="p-2 rounded-full bg-white hover:bg-[#F9F7F2] text-[#43463E] border border-[#E5E2D9] transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B705C]" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B705C] bg-[#E9EDC9] px-3 py-1 rounded-full border border-[#D8DCCB] font-sans">
                Dynamic Curriculum
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#43463E] mt-1 tracking-tight">
              {path.mainTopic} Learning Path
            </h1>
          </div>
        </div>

        <div className="text-xs text-[#A5A58D] font-sans font-medium hidden sm:block">
          {modules.filter((m) => m.status === 'completed').length} / {modules.length} Completed
        </div>
      </div>

      {/* Path Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E5E2D9]">
        {modules.map((mod, idx) => {
          const isCompleted = mod.status === 'completed';
          const isCurrent = mod.status === 'current';
          const isUnlocked = mod.status === 'unlocked';
          const isLocked = mod.status === 'locked';

          return (
            <div key={mod.id} className="relative group">
              {/* Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-10 top-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-[#E9EDC9] text-[#6B705C]'
                    : isCurrent
                    ? 'bg-[#6B705C] text-white ring-4 ring-[#6B705C]/20'
                    : isUnlocked
                    ? 'bg-[#E5E2D9] text-[#737769]'
                    : 'bg-[#F9F7F2] text-[#A5A58D]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
              </div>

              {/* Module Card */}
              <div
                className={`p-5 rounded-[24px] border transition-all ${
                  isCurrent
                    ? 'bg-white border-2 border-[#6B705C] shadow-sm'
                    : isCompleted
                    ? 'bg-white/80 border-[#E5E2D9]'
                    : isUnlocked
                    ? 'bg-white/90 border-[#E5E2D9] hover:border-[#D8DCCB]'
                    : 'bg-white/40 border-[#E5E2D9] opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#A5A58D]">
                      Module {idx + 1}
                    </span>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] bg-[#6B705C] text-white font-sans">
                        Current Focus
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] bg-[#E9EDC9] text-[#6B705C] border border-[#D8DCCB] font-sans">
                        Mastered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-[#A5A58D] font-sans">
                    <Clock className="w-3.5 h-3.5 text-[#6B705C]" />
                    <span>{mod.duration}</span>
                  </div>
                </div>

                <h3 className="text-base font-serif font-medium text-[#43463E] mt-1">
                  {mod.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#737769] font-sans mt-1 leading-relaxed">
                  {mod.description}
                </p>

                {/* Launch Module CTA */}
                {(isCurrent || isUnlocked || isCompleted) && (
                  <div className="mt-3.5 pt-3 border-t border-[#E5E2D9] flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectModule(mod.title)}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider font-bold transition ${
                        isCurrent
                          ? 'bg-[#6B705C] hover:bg-[#585C4B] text-white shadow-sm shadow-[#6B705C22]'
                          : 'bg-[#F9F7F2] hover:bg-[#EFECE4] text-[#43463E] border border-[#E5E2D9]'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isCompleted ? 'Review Module' : isCurrent ? 'Continue Lesson' : 'Start Module'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
