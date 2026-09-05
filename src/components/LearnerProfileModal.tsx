import React, { useState, useEffect } from 'react';
import {
  LearnerProfile,
  EducationalLevel,
  ExistingKnowledge,
  LearningObjective,
  PreferredLanguage,
  TeachingStyle,
  AvailableTime,
  DesiredDepth,
} from '../types';
import {
  User as UserIcon,
  Clock,
  Globe,
  BookOpen,
  Sparkles,
  X,
  ArrowRight,
  LogOut,
  Edit3,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { getUserInitials } from '../services/firebase';

interface LearnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: LearnerProfile;
  onSaveProfile: (profile: LearnerProfile) => void;
  currentUser?: User | null;
  onSignOut?: () => void;
}

export const LearnerProfileModal: React.FC<LearnerProfileModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onSaveProfile,
  currentUser,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>('overview');

  const [name, setName] = useState(
    currentUser?.displayName || initialProfile?.name || 'Learner'
  );
  const [level, setLevel] = useState<EducationalLevel>(
    initialProfile?.educationalLevel || 'Beginner'
  );
  const [knowledge, setKnowledge] = useState<ExistingKnowledge>(
    initialProfile?.existingKnowledge || 'Basic understanding'
  );
  const [objective, setObjective] = useState<LearningObjective>(
    initialProfile?.learningObjective || 'Understand concept'
  );
  const [language, setLanguage] = useState<PreferredLanguage>(
    initialProfile?.preferredLanguage || 'English'
  );
  const [style, setStyle] = useState<TeachingStyle>(
    initialProfile?.preferredTeachingStyle || 'Example-driven'
  );
  const [time, setTime] = useState<AvailableTime>(
    initialProfile?.availableTime || '20 minutes'
  );
  const [depth, setDepth] = useState<DesiredDepth>(
    initialProfile?.desiredDepth || 'Standard'
  );
  const [naturalInstruction, setNaturalInstruction] = useState(
    initialProfile?.naturalLanguageInstruction || ''
  );

  // User Stats from user-specific localStorage
  const [completedLessonsCount, setCompletedLessonsCount] = useState(2);
  const [averageScore, setAverageScore] = useState(88);

  useEffect(() => {
    if (currentUser?.uid) {
      try {
        const savedLessons = localStorage.getItem(`aiTeacher:${currentUser.uid}:completedLessons`);
        if (savedLessons) {
          const parsed = JSON.parse(savedLessons);
          if (Array.isArray(parsed)) setCompletedLessonsCount(parsed.length);
        }
        const savedScores = localStorage.getItem(`aiTeacher:${currentUser.uid}:scores`);
        if (savedScores) {
          const parsed = JSON.parse(savedScores);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const avg = Math.round(parsed.reduce((a, b) => a + b, 0) / parsed.length);
            setAverageScore(avg);
          }
        }
      } catch {}
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      educationalLevel: level,
      existingKnowledge: knowledge,
      learningObjective: objective,
      preferredLanguage: language,
      preferredTeachingStyle: style,
      availableTime: time,
      desiredDepth: depth,
      naturalLanguageInstruction: naturalInstruction,
    });
    setActiveTab('overview');
    onClose();
  };

  const initials = getUserInitials(
    currentUser?.displayName || name,
    currentUser?.email
  );

  return (
    <div
      id="learner-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#43463E]/40 backdrop-blur-sm animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-[28px] border border-[#E5E2D9] bg-white p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E9EDC9] text-[#6B705C] border border-[#D8DCCB] flex items-center justify-center font-bold text-sm">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-serif font-medium text-[#43463E] tracking-tight">
                  {currentUser?.displayName || name}
                </h2>
                {currentUser ? (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E9EDC9] text-[#6B705C] border border-[#D8DCCB]">
                    Authenticated
                  </span>
                ) : (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#737769] border border-[#E5E2D9]">
                    Guest
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A5A58D] font-sans">
                {currentUser?.email || 'Personalized AI Learning Profile'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs text-[#8C4A42] hover:bg-[#FAE1DD]/50 border border-[#F2C2B8] transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#737769] hover:text-[#43463E] hover:bg-[#F9F7F2] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex space-x-2 border-b border-[#E5E2D9] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-semibold font-sans transition ${
              activeTab === 'overview'
                ? 'bg-[#6B705C] text-white shadow-sm'
                : 'bg-[#F9F7F2] text-[#43463E] hover:bg-[#F4F1EA]'
            }`}
          >
            Profile & Progress Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold font-sans transition ${
              activeTab === 'edit'
                ? 'bg-[#6B705C] text-white shadow-sm'
                : 'bg-[#F9F7F2] text-[#43463E] hover:bg-[#F4F1EA]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Learning Preferences</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 font-sans animate-fadeIn">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A5A58D] block">
                  Learning Level
                </span>
                <span className="text-sm font-semibold text-[#43463E] mt-0.5 block">{level}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A5A58D] block">
                  Language
                </span>
                <span className="text-sm font-semibold text-[#43463E] mt-0.5 block">{language}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A5A58D] block">
                  Lessons Completed
                </span>
                <span className="text-sm font-semibold text-[#6B705C] mt-0.5 block">
                  {completedLessonsCount}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A5A58D] block">
                  Average Score
                </span>
                <span className="text-sm font-semibold text-[#6B705C] mt-0.5 block">
                  {averageScore}%
                </span>
              </div>
            </div>

            {/* Pedagogical Profile Summary */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5E2D9] space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#43463E]">
                <GraduationCap className="w-4 h-4 text-[#6B705C]" />
                <span>Pedagogical Calibration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#585C4B]">
                <div className="flex items-center space-x-2">
                  <span className="text-[#A5A58D]">Teaching Style:</span>
                  <span className="font-medium text-[#43463E]">{style}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#A5A58D]">Objective:</span>
                  <span className="font-medium text-[#43463E]">{objective}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#A5A58D]">Pacing / Time:</span>
                  <span className="font-medium text-[#43463E]">{time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#A5A58D]">Desired Depth:</span>
                  <span className="font-medium text-[#43463E]">{depth}</span>
                </div>
              </div>
            </div>

            {/* Cognitive Concept Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#E9EDC9]/40 border border-[#D8DCCB] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#6B705C]">
                  <CheckCircle2 className="w-4 h-4 text-[#6B705C]" />
                  <span>Strong Concepts</span>
                </div>
                <ul className="text-xs text-[#43463E] space-y-1 pl-1">
                  <li>• Inertia & First Law Principles</li>
                  <li>• Proportional Dynamics (F = ma)</li>
                  <li>• Physical Analogy Intuition</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAE1DD]/40 border border-[#F2C2B8] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#8C4A42]">
                  <AlertCircle className="w-4 h-4 text-[#8C4A42]" />
                  <span>Concepts for Reinforcement</span>
                </div>
                <ul className="text-xs text-[#43463E] space-y-1 pl-1">
                  <li>• Action-Reaction Body Isolation</li>
                  <li>• Non-Inertial Reference Frames</li>
                </ul>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="flex items-center space-x-1.5 text-xs font-semibold text-[#6B705C] hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Learning Preferences</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-bold uppercase tracking-wider font-sans transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT PREFERENCES FORM */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSubmit} className="space-y-4 font-sans animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#43463E]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Learner name"
                className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
              />
            </div>

            {/* Row 1: Educational Level & Existing Knowledge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#43463E]">Educational Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as EducationalLevel)}
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (College / Applied)</option>
                  <option value="Advanced">Advanced (Deep Technical)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#43463E]">Prior Knowledge</label>
                <select
                  value={knowledge}
                  onChange={(e) => setKnowledge(e.target.value as ExistingKnowledge)}
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                >
                  <option value="I know nothing">I know nothing (Start from scratch)</option>
                  <option value="Basic understanding">Basic understanding (Heard of terms)</option>
                  <option value="Moderate understanding">Moderate understanding (Studied before)</option>
                  <option value="Strong understanding">Strong understanding (Need mastery drills)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Objective & Teaching Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#43463E]">Learning Objective</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as LearningObjective)}
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                >
                  <option value="Understand concept">Understand core concept</option>
                  <option value="Exam preparation">Exam preparation (Definitions & solving)</option>
                  <option value="Interview preparation">Interview preparation (Mental models)</option>
                  <option value="Practical application">Practical application & code/experiments</option>
                  <option value="Revision">Quick revision of key points</option>
                  <option value="Deep learning">Deep learning & edge cases</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#43463E]">Preferred Teaching Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as TeachingStyle)}
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                >
                  <option value="Simple & conversational">Simple & conversational</option>
                  <option value="Visual">Visual (Rich diagrams & graphs)</option>
                  <option value="Example-driven">Example-driven (Physical analogies)</option>
                  <option value="Socratic/question-based">Socratic (Interactive probing)</option>
                  <option value="Technical">Technical (Mathematical/Code depth)</option>
                  <option value="Step-by-step">Step-by-step procedural</option>
                </select>
              </div>
            </div>

            {/* Row 3: Preferred Language & Available Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#43463E] flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-[#6B705C]" />
                  <span>Preferred Language</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as PreferredLanguage)}
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                >
                  <option value="English">English</option>
                  <option value="Hinglish">Hinglish (Hindi + English)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                  <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#43463E] flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-[#6B705C]" />
                  <span>Available Time</span>
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value as AvailableTime)}
                  className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                >
                  <option value="5 minutes">5 minutes (High-value blitz)</option>
                  <option value="10 minutes">10 minutes (Focused core)</option>
                  <option value="20 minutes">20 minutes (Standard complete lesson)</option>
                  <option value="30 minutes">30 minutes (Deep dive & checkpoints)</option>
                  <option value="60 minutes">60 minutes (Comprehensive mastery)</option>
                  <option value="7-day learning plan">7-day structured roadmap</option>
                </select>
              </div>
            </div>

            {/* Natural Language Prompt Box */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-[#43463E] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#6B705C]" />
                <span>Natural Language Guidance</span>
              </label>
              <input
                type="text"
                value={naturalInstruction}
                onChange={(e) => setNaturalInstruction(e.target.value)}
                placeholder="e.g. 'I am preparing for an exam. Give me 3 real world analogies and test me with tricky questions.'"
                className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] px-3.5 py-2.5 text-xs text-[#43463E] placeholder-[#A5A58D] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
              />
            </div>

            {/* Footer Submit */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#737769] hover:text-[#43463E] transition"
              >
                Back to Overview
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-sans uppercase tracking-wider font-bold transition shadow-md shadow-[#6B705C22] active:scale-95"
              >
                <span>Save Preferences</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
