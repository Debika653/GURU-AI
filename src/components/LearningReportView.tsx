import React from 'react';
import { LearningReport } from '../types';
import { Award, CheckCircle2, AlertTriangle, BookOpen, Compass, Download, ArrowRight, RotateCcw } from 'lucide-react';

interface LearningReportViewProps {
  report: LearningReport;
  onRestartLesson: () => void;
  onStartNextTopic: (topicTitle: string) => void;
  onViewLearningPath: () => void;
}

export const LearningReportView: React.FC<LearningReportViewProps> = ({
  report,
  onRestartLesson,
  onStartNextTopic,
  onViewLearningPath,
}) => {
  const {
    topic,
    overallScore,
    letterGrade,
    masteryStatus,
    strongAreas = [],
    needsImprovement = [],
    detectedMisconceptions = [],
    recommendedRevision = [],
    nextRecommendedTopics = [],
  } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="learning-report-view"
      className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn"
    >
      {/* Report Header Card */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#E5E2D9] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E2D9]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[#E9EDC9] text-[#6B705C] border border-[#D8DCCB] font-sans">
                Learning Assessment
              </span>
              <span className="text-xs text-[#A5A58D] font-sans">Pedagogical Mastery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#43463E] mt-2 tracking-tight">
              {topic}
            </h1>
            <p className="text-sm text-[#A5A58D] font-sans mt-0.5">
              Comprehensive Diagnostic & Adaptive Mastery Report
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#F9F7F2] border border-[#E5E2D9] px-5 py-3 rounded-2xl">
            <div className="text-center font-sans">
              <div className="text-3xl font-serif font-medium text-[#6B705C]">
                {overallScore}%
              </div>
              <div className="text-[10px] text-[#A5A58D] uppercase font-bold tracking-wider">Total Score</div>
            </div>
            <div className="w-px h-10 bg-[#E5E2D9]" />
            <div className="text-center font-sans">
              <div className="text-3xl font-serif font-medium text-[#43463E]">
                {letterGrade || 'A'}
              </div>
              <div className="text-[10px] text-[#A5A58D] uppercase font-bold tracking-wider">Grade</div>
            </div>
          </div>
        </div>

        {/* Mastery Status Banner */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-xs font-sans">
          <div className="flex items-center space-x-2 text-[#43463E] font-medium">
            <Award className="w-4 h-4 text-[#6B705C]" />
            <span>Mastery Classification: <strong className="text-[#6B705C]">{masteryStatus || 'Conceptually Proficient'}</strong></span>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#F9F7F2] hover:bg-[#EFECE4] text-[#43463E] text-xs border border-[#E5E2D9] transition font-medium"
          >
            <Download className="w-3.5 h-3.5 text-[#6B705C]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Grid: Strong Areas vs Needs Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Concepts */}
        <div className="p-6 rounded-[28px] bg-white border border-[#E5E2D9] shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 text-[#6B705C] font-sans font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#6B705C]" />
            <span>Demonstrated Strong Areas</span>
          </div>
          <div className="space-y-2.5">
            {strongAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#E9EDC9]/40 border border-[#D8DCCB] text-xs space-y-1 font-sans"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#43463E] text-xs">{area.concept}</span>
                  <span className="font-mono text-[#6B705C] font-bold">{area.score}%</span>
                </div>
                <p className="text-[#737769] text-[11px] leading-relaxed">{area.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="p-6 rounded-[28px] bg-white border border-[#E5E2D9] shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 text-[#8C4A42] font-sans font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-[#8C4A42]" />
            <span>Targeted Reinforcement Areas</span>
          </div>
          <div className="space-y-2.5">
            {needsImprovement.map((area, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FEFAE0] border border-[#E5E2D9] text-xs space-y-1 font-sans"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#43463E] text-xs">{area.concept}</span>
                  <span className="font-mono text-[#8C4A42] font-bold">{area.score}%</span>
                </div>
                <p className="text-[#737769] text-[11px] leading-relaxed">{area.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detected Misconceptions & Diagnoses */}
      {detectedMisconceptions.length > 0 && (
        <div className="p-6 rounded-[28px] bg-white border border-[#E5E2D9] shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2 text-[#6B705C] font-sans font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-[#6B705C]" />
            <span>Cognitive Misconceptions Addressed During Lesson</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detectedMisconceptions.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-xs space-y-1.5 font-sans">
                <div className="font-semibold text-[#8C4A42]">Issue: {item.issue}</div>
                <p className="text-[#43463E] text-[11px] leading-relaxed">
                  <strong className="text-[#6B705C]">Resolution:</strong> {item.resolution}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Revision Plan */}
      <div className="p-6 rounded-[28px] bg-white border border-[#E5E2D9] shadow-sm space-y-3.5">
        <div className="flex items-center space-x-2 text-[#6B705C] font-sans font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-[#6B705C]" />
          <span>Recommended Targeted Revision</span>
        </div>
        <ul className="space-y-2">
          {recommendedRevision.map((rev, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-2.5 text-xs text-[#43463E] bg-[#F9F7F2] p-3 rounded-2xl border border-[#E5E2D9] font-sans"
            >
              <span className="w-5 h-5 rounded-full bg-[#E9EDC9] text-[#6B705C] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-[#D8DCCB]">
                {idx + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{rev}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Recommended Topics */}
      <div className="p-6 rounded-[28px] bg-white border border-[#E5E2D9] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#43463E] font-serif font-medium text-sm">
            <Compass className="w-4 h-4 text-[#6B705C]" />
            <span>Next Suggested Learning Topics</span>
          </div>
          <button
            onClick={onViewLearningPath}
            className="text-xs text-[#6B705C] hover:underline font-sans font-medium"
          >
            View Full Learning Path
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {nextRecommendedTopics.map((topicItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] flex flex-col justify-between space-y-3 font-sans"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-medium text-[#43463E] text-sm">{topicItem.title}</h4>
                  <span className="text-[10px] font-sans text-[#6B705C] px-2.5 py-0.5 rounded-full bg-white border border-[#E5E2D9] font-semibold">
                    {topicItem.estimatedTime}
                  </span>
                </div>
                <p className="text-xs text-[#737769] mt-1.5 leading-relaxed">
                  {topicItem.reason}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onStartNextTopic(topicItem.title)}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-full bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-sans uppercase tracking-wider font-bold transition shadow-sm shadow-[#6B705C22]"
              >
                <span>Learn this next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onRestartLesson}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#F9F7F2] hover:bg-[#EFECE4] text-[#43463E] border border-[#E5E2D9] text-xs font-sans font-semibold transition"
        >
          <RotateCcw className="w-4 h-4 text-[#6B705C]" />
          <span>Revise This Lesson</span>
        </button>

        <button
          type="button"
          onClick={onViewLearningPath}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-sans uppercase tracking-wider font-bold transition shadow-md shadow-[#6B705C22] active:scale-95"
        >
          <span>Continue Learning Path</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
