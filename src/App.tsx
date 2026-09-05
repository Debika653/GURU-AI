import React, { useState, useEffect } from 'react';
import {
  LessonPlan,
  LearnerProfile,
  PreferredLanguage,
  Assessment,
  LearningReport,
  LearningPath,
  AppSettings,
  DocumentAnalysisResult,
} from './types';
import { DEFAULT_LEARNER_PROFILE, DEMO_SUBJECTS, DEFAULT_SETTINGS } from './data/demoData';
import { ApiService } from './services/apiService';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { Classroom } from './components/Classroom';
import { FinalAssessment } from './components/FinalAssessment';
import { LearningReportView } from './components/LearningReportView';
import { LearningPathView } from './components/LearningPathView';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { CreateLessonModal } from './components/CreateLessonModal';
import { LearnerProfileModal } from './components/LearnerProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { User } from 'firebase/auth';
import {
  subscribeToAuthChanges,
  logoutUser,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
  saveUserSettingsToFirestore,
  getUserSettingsFromFirestore,
  saveLessonRecordToFirestore,
  getUserLessonsFromFirestore,
  saveLearningReportToFirestore,
  getUserReportsFromFirestore,
  LessonRecord,
  StoredReportRecord,
} from './services/firebase';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Synced User History from Firestore
  const [userLessons, setUserLessons] = useState<LessonRecord[]>([]);
  const [userReports, setUserReports] = useState<StoredReportRecord[]>([]);

  // Navigation & View Screen
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'classroom' | 'assessment' | 'report' | 'learning_path'
  >('home');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Consulting AI Educator...');

  // Active Core Data with localStorage recovery
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>(() => {
    try {
      const saved = localStorage.getItem('ai_teacher_learner_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LEARNER_PROFILE;
  });

  const [currentLanguage, setCurrentLanguage] = useState<PreferredLanguage>(() => {
    try {
      const saved = localStorage.getItem('ai_teacher_language');
      if (saved) return saved as PreferredLanguage;
    } catch {}
    return 'English';
  });

  const [currentLessonPlan, setCurrentLessonPlan] = useState<LessonPlan | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentReport, setCurrentReport] = useState<LearningReport | null>(null);
  const [currentLearningPath, setCurrentLearningPath] = useState<LearningPath | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('ai_teacher_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme State (Dark Mode default)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('ai_teacher_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('ai_teacher_theme', theme);
    } catch {}
  }, [theme]);

  // Listen for real Firebase Auth state changes
  useEffect(() => {
    let isMounted = true;
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsAuthChecking(false);
      }
    }, 1200);

    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (!isMounted) return;
      clearTimeout(safetyTimer);
      setCurrentUser(user);
      setIsAuthChecking(false);

      if (user) {
        setIsGuestMode(false);
        // Attempt to load user-specific storage keys for immediate rendering
        try {
          const userProfileRaw = localStorage.getItem(`aiTeacher:${user.uid}:profile`);
          if (userProfileRaw) {
            setLearnerProfile(JSON.parse(userProfileRaw));
          } else {
            setLearnerProfile((prev) => ({
              ...prev,
              name: user.displayName || user.email?.split('@')[0] || prev.name,
            }));
          }

          const userLang = localStorage.getItem(`aiTeacher:${user.uid}:language`);
          if (userLang) setCurrentLanguage(userLang as PreferredLanguage);

          const userSettingsRaw = localStorage.getItem(`aiTeacher:${user.uid}:settings`);
          if (userSettingsRaw) setAppSettings(JSON.parse(userSettingsRaw));
        } catch (e) {
          console.warn('Error hydrating user-specific storage:', e);
        }

        // Asynchronously load and synchronize persistent state from Firestore
        try {
          const [remoteProfile, remoteSettings, remoteLessons, remoteReports] = await Promise.all([
            getUserProfileFromFirestore(user.uid),
            getUserSettingsFromFirestore(user.uid),
            getUserLessonsFromFirestore(user.uid),
            getUserReportsFromFirestore(user.uid),
          ]);

          if (remoteProfile) {
            setLearnerProfile(remoteProfile);
            try {
              localStorage.setItem(`aiTeacher:${user.uid}:profile`, JSON.stringify(remoteProfile));
            } catch {}
          } else {
            // First time cloud initialization for this authenticated user
            await saveUserProfileToFirestore(
              {
                ...DEFAULT_LEARNER_PROFILE,
                name: user.displayName || user.email?.split('@')[0] || 'Learner',
              },
              user.email
            );
          }

          if (remoteSettings) {
            setAppSettings(remoteSettings);
            try {
              localStorage.setItem(`aiTeacher:${user.uid}:settings`, JSON.stringify(remoteSettings));
            } catch {}
          }

          if (remoteLessons && remoteLessons.length > 0) {
            setUserLessons(remoteLessons);
          }

          if (remoteReports && remoteReports.length > 0) {
            setUserReports(remoteReports);
          }
        } catch (cloudErr) {
          console.warn('Firestore cloud sync notice:', cloudErr);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state changes to user-specific localStorage + legacy key
  useEffect(() => {
    try {
      if (currentUser?.uid) {
        localStorage.setItem(`aiTeacher:${currentUser.uid}:profile`, JSON.stringify(learnerProfile));
      }
      localStorage.setItem('ai_teacher_learner_profile', JSON.stringify(learnerProfile));
    } catch {}
  }, [learnerProfile, currentUser]);

  useEffect(() => {
    try {
      if (currentUser?.uid) {
        localStorage.setItem(`aiTeacher:${currentUser.uid}:language`, currentLanguage);
      }
      localStorage.setItem('ai_teacher_language', currentLanguage);
    } catch {}
  }, [currentLanguage, currentUser]);

  useEffect(() => {
    try {
      if (currentUser?.uid) {
        localStorage.setItem(`aiTeacher:${currentUser.uid}:settings`, JSON.stringify(appSettings));
      }
      localStorage.setItem('ai_teacher_settings', JSON.stringify(appSettings));
    } catch {}
  }, [appSettings, currentUser]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setIsGuestMode(false);
      setCurrentScreen('home');
      setCurrentLessonPlan(null);
      setCurrentAssessment(null);
      setCurrentReport(null);
    } catch (e) {
      console.error('Failed to sign out:', e);
    }
  };

  // Complete Adaptive Demo Lesson Flow
  const handleTriggerDemo = async () => {
    setIsLoading(true);
    setLoadingText("Guru AI is structuring a 20-minute adaptive lesson on Newton's Laws of Motion...");

    const demoProfile: LearnerProfile = {
      name: currentUser?.displayName || 'Alex',
      educationalLevel: 'Beginner',
      existingKnowledge: 'Basic understanding',
      learningObjective: 'Understand concept',
      preferredLanguage: currentLanguage || 'English',
      preferredTeachingStyle: 'Example-driven',
      availableTime: '20 minutes',
      desiredDepth: 'Standard',
      naturalLanguageInstruction:
        'Teach me step by step using physical intuition, diagrams, and ask me questions along the way.',
    };

    setLearnerProfile(demoProfile);

    try {
      const plan = await ApiService.generateLessonPlan({
        topic: "Newton's Laws of Motion",
        learnerProfile: demoProfile,
        language: currentLanguage,
      });

      setCurrentLessonPlan(plan);
      setCurrentAssessment(null);
      setCurrentReport(null);
      setCurrentScreen('classroom');
    } catch (err) {
      console.warn('Demo generation fallback to baseline plan:', err);
      const physicsDemo = DEMO_SUBJECTS[0];
      setCurrentLessonPlan(physicsDemo.plan);
      setCurrentAssessment(physicsDemo.assessment);
      setCurrentScreen('classroom');
    } finally {
      setIsLoading(false);
    }
  };

  // Start learning from a preset subject card
  const handleSelectPresetSubject = (presetId: string) => {
    const found = DEMO_SUBJECTS.find((s) => s.id === presetId);
    if (found) {
      setCurrentLessonPlan(found.plan);
      setCurrentAssessment(found.assessment);
      setCurrentScreen('classroom');
    }
  };

  // Start learning from arbitrary custom topic
  const handleStartTopic = async (topic: string, customProfile?: LearnerProfile) => {
    setIsLoading(true);
    setLoadingText(`Guru AI is structuring curriculum for "${topic}"...`);

    const effectiveProfile = customProfile || learnerProfile;

    try {
      const plan = await ApiService.generateLessonPlan({
        topic,
        learnerProfile: effectiveProfile,
        language: currentLanguage,
      });

      setCurrentLessonPlan(plan);
      setCurrentAssessment(null);
      setCurrentReport(null);
      setCurrentScreen('classroom');
    } catch (err) {
      console.error('Failed to generate lesson plan:', err);
      handleTriggerDemo();
    } finally {
      setIsLoading(false);
    }
  };

  // Start learning from uploaded educational material
  const handleDocumentAnalyzed = async (
    analysis: DocumentAnalysisResult,
    scope: { chapter?: string; section?: string }
  ) => {
    setIsLoading(true);
    setLoadingText(`Grounded Guru AI: Structuring lesson from "${analysis.fileName}"...`);

    try {
      const topicName = scope.chapter || analysis.summary || analysis.fileName;
      const plan = await ApiService.generateLessonPlan({
        topic: topicName,
        sourceMaterial: {
          documentName: analysis.fileName,
          selectedChapter: scope.chapter,
          extractedKeyPoints: analysis.keyFormulas || analysis.chapters?.map((c) => c.title),
        },
        learnerProfile,
        language: currentLanguage,
      });

      plan.sourceContext = {
        documentName: analysis.fileName,
        chapter: scope.chapter,
        grounded: true,
      };

      setCurrentLessonPlan(plan);
      setCurrentAssessment(null);
      setCurrentReport(null);
      setCurrentScreen('classroom');
    } catch (err) {
      console.error('Failed to ground lesson from material:', err);
      handleTriggerDemo();
    } finally {
      setIsLoading(false);
    }
  };

  // Move from Classroom to Final Assessment
  const handleCompleteLesson = async () => {
    if (!currentLessonPlan) return;

    if (currentUser?.uid) {
      const lessonId = `lesson_${encodeURIComponent(currentLessonPlan.topic.toLowerCase().replace(/[^a-z0-9]/g, '_'))}`;
      saveLessonRecordToFirestore({
        id: lessonId,
        topic: currentLessonPlan.topic,
        completedSections: currentLessonPlan.sections.length,
        totalSections: currentLessonPlan.sections.length,
        status: 'completed',
      }).catch((e) => console.warn('Could not save lesson to Firestore:', e));
    }

    if (currentAssessment && currentAssessment.topic === currentLessonPlan.topic) {
      setCurrentScreen('assessment');
      return;
    }

    setIsLoading(true);
    setLoadingText('Generating comprehensive diagnostic assessment...');

    try {
      const assessment = await ApiService.generateAssessment({
        topic: currentLessonPlan.topic,
        concepts: currentLessonPlan.sections.map((s) => s.concept),
        learnerProfile,
        language: currentLanguage,
      });

      setCurrentAssessment(assessment);
      setCurrentScreen('assessment');
    } catch (err) {
      console.error('Assessment generation failed:', err);
      if (DEMO_SUBJECTS[0].assessment) {
        setCurrentAssessment(DEMO_SUBJECTS[0].assessment);
      }
      setCurrentScreen('assessment');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete Assessment & Generate Learning Report
  const handleCompleteAssessment = async (results: {
    totalQuestions: number;
    score: number;
    answers: { questionId: string; answer: string; isCorrect: boolean }[];
  }) => {
    if (!currentLessonPlan) return;

    // Record score & completed lesson in user-specific localStorage and state
    if (currentUser?.uid) {
      try {
        const lessonsKey = `aiTeacher:${currentUser.uid}:completedLessons`;
        const prevLessons = JSON.parse(localStorage.getItem(lessonsKey) || '[]');
        if (!prevLessons.includes(currentLessonPlan.topic)) {
          prevLessons.push(currentLessonPlan.topic);
          localStorage.setItem(lessonsKey, JSON.stringify(prevLessons));
        }

        const scoresKey = `aiTeacher:${currentUser.uid}:scores`;
        const prevScores = JSON.parse(localStorage.getItem(scoresKey) || '[]');
        prevScores.push(results.score);
        localStorage.setItem(scoresKey, JSON.stringify(prevScores));

        const lessonId = `lesson_${encodeURIComponent(currentLessonPlan.topic.toLowerCase().replace(/[^a-z0-9]/g, '_'))}`;
        const lessonPayload = {
          id: lessonId,
          topic: currentLessonPlan.topic,
          completedSections: currentLessonPlan.sections.length,
          totalSections: currentLessonPlan.sections.length,
          status: 'completed' as const,
          score: results.score,
        };
        saveLessonRecordToFirestore(lessonPayload).catch((e) =>
          console.warn('Could not update lesson score in Firestore:', e)
        );
        setUserLessons((prev) => {
          const filtered = prev.filter((p) => p.id !== lessonId);
          return [
            {
              ...lessonPayload,
              userId: currentUser.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...filtered,
          ];
        });
      } catch (e) {
        console.warn('Could not record score to storage:', e);
      }
    }

    setIsLoading(true);
    setLoadingText('Generating detailed mastery report & diagnostic analysis...');

    try {
      const report = await ApiService.generateLearningReport({
        topic: currentLessonPlan.topic,
        assessmentResults: results,
        learnerProfile,
        language: currentLanguage,
      });

      if (currentUser?.uid) {
        const reportId = `report_${Date.now()}`;
        saveLearningReportToFirestore(reportId, report).catch((e) =>
          console.warn('Could not save report to Firestore:', e)
        );
      }

      setCurrentReport(report);
      setCurrentScreen('report');
    } catch (err) {
      console.error('Report generation failed:', err);
      const fallbackReport: LearningReport = {
        topic: currentLessonPlan.topic,
        overallScore: results.score,
        letterGrade: results.score >= 80 ? 'A' : results.score >= 60 ? 'B' : 'C',
        masteryStatus: results.score >= 75 ? 'Mastered Foundation' : 'Conceptual Gaps Detected',
        strongAreas: [
          { concept: 'Core Definition', score: 90, comment: 'Strong grasp of foundational principles' },
        ],
        needsImprovement: [
          { concept: 'Edge Cases', score: 55, comment: 'Application to dynamic reference frames' },
        ],
        detectedMisconceptions: [
          {
            issue: 'Inertial vs Applied Force',
            resolution: 'Reinforced with skateboard analogy',
          },
        ],
        recommendedRevision: ["Revise Newton's First Law", 'Practice 2 free-body diagrams'],
        nextRecommendedTopics: [
          {
            title: "Newton's Second Law",
            estimatedTime: '15 mins',
            reason: 'Logical extension to net force',
          },
        ],
      };
      if (currentUser?.uid) {
        const reportId = `report_${Date.now()}`;
        saveLearningReportToFirestore(reportId, fallbackReport).catch((e) =>
          console.warn('Could not save fallback report to Firestore:', e)
        );
      }
      setCurrentReport(fallbackReport);
      setCurrentScreen('report');
    } finally {
      setIsLoading(false);
    }
  };

  // Open Learning Path View
  const handleOpenLearningPath = async (topicTitle?: string) => {
    const mainTopic = topicTitle || currentLessonPlan?.topic || 'Physics & Mechanics';

    setIsLoading(true);
    setLoadingText(`Synthesizing dynamic learning path for "${mainTopic}"...`);

    try {
      const path = await ApiService.generateLearningPath({
        mainTopic,
        learnerLevel: learnerProfile?.educationalLevel || 'Beginner',
        learnerGoal: learnerProfile?.learningObjective || 'Understand core concepts',
        availableTime: learnerProfile?.availableTime || '20 minutes',
      });

      setCurrentLearningPath(path);
      setCurrentScreen('learning_path');
    } catch (err) {
      console.error('Learning path generation failed:', err);
      setCurrentLearningPath({
        mainTopic,
        modules: [
          {
            id: 'm1',
            title: 'Foundational Concepts & Terminology',
            description: 'Core principles and definitions',
            duration: '15 mins',
            status: 'completed',
          },
          {
            id: 'm2',
            title: 'Newtonian Dynamics & Force Laws',
            description: 'Deep dive into vectors and inertia',
            duration: '25 mins',
            status: 'current',
          },
          {
            id: 'm3',
            title: 'Energy, Work & Conservation',
            description: 'Potential vs kinetic energy equations',
            duration: '30 mins',
            status: 'unlocked',
          },
          {
            id: 'm4',
            title: 'Rotational Motion & Torque',
            description: 'Angular momentum and levers',
            duration: '40 mins',
            status: 'locked',
          },
        ],
      });
      setCurrentScreen('learning_path');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while Firebase Auth initializes
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] text-[#43463E] flex flex-col items-center justify-center space-y-4 font-sans antialiased">
        <div className="w-14 h-14 rounded-3xl bg-[#E9EDC9] border border-[#D8DCCB] flex items-center justify-center shadow-sm">
          <Loader2 className="w-7 h-7 text-[#6B705C] animate-spin" />
        </div>
        <p className="text-xs text-[#A5A58D] font-medium tracking-wide">
          Connecting to AI Educator...
        </p>
      </div>
    );
  }

  // If unauthenticated and not in explicit guest demo mode, show Auth Screen
  if (!currentUser && !isGuestMode) {
    return (
      <AuthScreen
        onContinueAsGuest={() => setIsGuestMode(true)}
        onExploreDemo={() => {
          setIsGuestMode(true);
          handleTriggerDemo();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--primary-subtle)] selection:text-[var(--text-primary)] font-sans antialiased transition-colors duration-200">
      {/* Top Application Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen as any)}
        onTriggerDemo={handleTriggerDemo}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenCreateLesson={() => setIsCreateLessonOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLearningPath={() => handleOpenLearningPath()}
        currentLanguage={currentLanguage}
        onChangeLanguage={(lang) => setCurrentLanguage(lang)}
        learnerProfile={learnerProfile}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        currentTheme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4 animate-fadeIn">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[var(--border)] shadow-md relative bg-[#0b0f19]">
                <img
                  src="/guru-ai-logo.jpg"
                  alt="Guru AI"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -inset-1.5 rounded-3xl border-2 border-[var(--primary)]/40 border-t-[var(--primary)] animate-spin pointer-events-none" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-medium text-[var(--text-primary)] tracking-wide">
                {loadingText}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm font-sans">
                Guru AI is preparing your personalized adaptive lesson.
              </p>
            </div>
          </div>
        ) : (
          <>
            {currentScreen === 'home' && (
              <LandingHero
                onStartTopic={handleStartTopic}
                onOpenUpload={() => setIsUploadOpen(true)}
                onTriggerDemo={handleTriggerDemo}
                onSelectPresetSubject={handleSelectPresetSubject}
                userLessons={userLessons}
              />
            )}

            {currentScreen === 'classroom' && currentLessonPlan && (
              <Classroom
                plan={currentLessonPlan}
                learnerProfile={learnerProfile}
                currentLanguage={currentLanguage}
                onCompleteLesson={handleCompleteLesson}
                onOpenProfileModal={() => setIsProfileOpen(true)}
                avatarStyle={appSettings.avatarStyle}
                appSettings={appSettings}
              />
            )}

            {currentScreen === 'assessment' && currentAssessment && (
              <FinalAssessment
                assessment={currentAssessment}
                topic={currentLessonPlan?.topic || 'Curriculum Subject'}
                onComplete={handleCompleteAssessment}
                onExit={() => setCurrentScreen('classroom')}
              />
            )}

            {currentScreen === 'report' && currentReport && (
              <LearningReportView
                report={currentReport}
                onRestartLesson={() => setCurrentScreen('classroom')}
                onStartNextTopic={(t) => handleStartTopic(t)}
                onViewLearningPath={() => handleOpenLearningPath(currentReport.topic)}
              />
            )}

            {currentScreen === 'learning_path' && currentLearningPath && (
              <LearningPathView
                path={currentLearningPath}
                onSelectModule={(moduleTitle) => handleStartTopic(moduleTitle)}
                onBackToLesson={() => setCurrentScreen(currentLessonPlan ? 'classroom' : 'home')}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <CreateLessonModal
        isOpen={isCreateLessonOpen}
        onClose={() => setIsCreateLessonOpen(false)}
        onStartLesson={(t, prof) => {
          setLearnerProfile(prof);
          handleStartTopic(t, prof);
        }}
        onStartTopic={(t) => handleStartTopic(t)}
        initialProfile={learnerProfile}
        currentLanguage={currentLanguage}
        onOpenUpload={() => {
          setIsCreateLessonOpen(false);
          setIsUploadOpen(true);
        }}
        onTriggerDemo={() => {
          setIsCreateLessonOpen(false);
          handleTriggerDemo();
        }}
      />

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentAnalyzed={handleDocumentAnalyzed}
      />

      <LearnerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        initialProfile={learnerProfile}
        onSaveProfile={(prof) => {
          setLearnerProfile(prof);
          if (currentUser?.uid) {
            saveUserProfileToFirestore(prof, currentUser.email).catch((e) =>
              console.warn('Could not sync profile to Firestore:', e)
            );
          }
        }}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        currentLanguage={currentLanguage}
        onUpdateSettings={(newSettings) => {
          setAppSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            if (currentUser?.uid) {
              saveUserSettingsToFirestore(updated).catch((e) =>
                console.warn('Could not sync settings to Firestore:', e)
              );
            }
            return updated;
          });
        }}
        onChangeLanguage={(lang) => setCurrentLanguage(lang)}
      />
    </div>
  );
}
