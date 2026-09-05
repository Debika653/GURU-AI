import React from 'react';
import { Sparkles, Settings, Globe, Moon, Sun, PlusCircle, LogOut } from 'lucide-react';
import { GuruLogo } from './GuruLogo';
import { PreferredLanguage, LearnerProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { getUserInitials } from '../services/firebase';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onTriggerDemo: () => void;
  onOpenUpload?: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenLearningPath: () => void;
  onOpenCreateLesson?: () => void;
  currentLanguage: PreferredLanguage;
  onChangeLanguage: (lang: PreferredLanguage) => void;
  learnerProfile?: LearnerProfile;
  currentUser?: FirebaseUser | null;
  onSignOut?: () => void;
  theme?: 'dark' | 'light';
  currentTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onTriggerDemo,
  onOpenProfile,
  onOpenSettings,
  onOpenLearningPath,
  onOpenCreateLesson,
  currentLanguage,
  onChangeLanguage,
  learnerProfile,
  currentUser,
  onSignOut,
  theme: propTheme,
  currentTheme,
  onToggleTheme,
}) => {
  const theme = currentTheme || propTheme || 'dark';
  const initials = getUserInitials(
    currentUser?.displayName || learnerProfile?.name,
    currentUser?.email
  );

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* LEFT: Guru AI Logo & Subtitle */}
        <div
          onClick={() => onNavigate('home')}
          className="cursor-pointer select-none group transition-transform active:scale-98"
        >
          <GuruLogo size="sm" subtitleText="Adaptive Learning" />
        </div>

        {/* CENTER: Clean Text Nav Links */}
        <nav className="hidden md:flex items-center space-x-7">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`text-xs font-medium transition relative py-1 ${
              currentScreen === 'home'
                ? 'text-[var(--primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Home
            {currentScreen === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCreateLesson}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition py-1"
          >
            Create Lesson
          </button>

          <button
            type="button"
            onClick={onOpenLearningPath}
            className={`text-xs font-medium transition relative py-1 ${
              currentScreen === 'learning_path'
                ? 'text-[var(--primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Learning Path
            {currentScreen === 'learning_path' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] rounded-full" />
            )}
          </button>
        </nav>

        {/* RIGHT: Demo Button, Language, Theme Toggle, Profile */}
        <div className="flex items-center space-x-3">
          {/* Highlighted Action: Demo Lesson */}
          <button
            id="btn-nav-demo-lesson"
            onClick={onTriggerDemo}
            title="Instant Demo Lesson: Newton's Laws"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Lesson</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 pointer-events-none" />
            <select
              id="select-nav-language"
              value={currentLanguage}
              onChange={(e) => onChangeLanguage(e.target.value as PreferredLanguage)}
              aria-label="Teaching Language"
              className="bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs rounded-lg pl-7 pr-2.5 py-1.5 hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--primary)] transition cursor-pointer appearance-none"
            >
              <option value="English">English</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Hindi">हिंदी</option>
              <option value="Bengali">বাংলা</option>
              <option value="Tamil">தமிழ்</option>
              <option value="Telugu">తెలుగు</option>
              <option value="Marathi">मराठी</option>
              <option value="Gujarati">ગુજરાતી</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              id="btn-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition active:scale-90 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}

          {/* Profile link */}
          <button
            id="btn-nav-profile"
            onClick={onOpenProfile}
            title={currentUser?.email ? `${currentUser.email} - Profile` : 'Learner Profile'}
            className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/30 flex items-center justify-center font-bold text-[10px] overflow-hidden">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <span className="hidden sm:inline max-w-[90px] truncate">
              {currentUser?.displayName || learnerProfile?.name || 'Profile'}
            </span>
          </button>

          {/* Settings Icon */}
          <button
            id="btn-nav-settings"
            onClick={onOpenSettings}
            title="Settings"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Sign Out (if authenticated) */}
          {currentUser && onSignOut && (
            <button
              id="btn-nav-sign-out"
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
