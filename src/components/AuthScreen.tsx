import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Brain,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  formatAuthError,
} from '../services/firebase';

type AuthMode = 'signin' | 'signup' | 'forgot_password';

interface AuthScreenProps {
  onExploreDemo?: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onExploreDemo, onContinueAsGuest }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetFormAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleGoogleSignIn = async () => {
    resetFormAlerts();
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode === 'forgot_password') {
      setIsLoading(true);
      try {
        await sendPasswordReset(email);
        setSuccessMessage('Password reset link sent! Please check your email inbox.');
      } catch (err: any) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      try {
        await signUpWithEmail(fullName, email, password);
      } catch (err: any) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Sign in mode
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#43463E] flex flex-col justify-between selection:bg-[#E9EDC9] selection:text-[#43463E] font-sans antialiased">
      {/* Header Bar */}
      <header className="w-full border-b border-[#E5E2D9] bg-[#F9F7F2]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/guru-ai-logo.jpg"
              alt="Guru AI Logo"
              className="w-10 h-10 rounded-xl object-cover border-2 border-[#6B705C]/30 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-[#43463E] text-lg tracking-tight">
                  Guru AI
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] bg-[#E9EDC9] text-[#6B705C] border border-[#6B705C]/20 font-sans">
                  Adaptive
                </span>
              </div>
              <p className="text-[10px] text-[#A5A58D] uppercase tracking-[0.2em] font-sans font-semibold">
                Adaptive Human-Like Educator
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#6B705C] font-medium font-sans">
            <span className="inline-block w-2 h-2 rounded-full bg-[#6B705C] animate-pulse" />
            <span>Secure Firebase Session</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-white rounded-[32px] border border-[#E5E2D9] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Brand & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden border border-[#D8DCCB] mb-2 shadow-sm">
              <img
                src="/guru-ai-logo.jpg"
                alt="Guru AI"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#43463E] tracking-tight">
              Welcome to Guru AI
            </h1>
            <p className="text-xs sm:text-sm text-[#737769] font-sans leading-relaxed max-w-sm mx-auto">
              Learn smarter with your personalized, interactive and adaptive AI teacher.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div
              id="auth-error-banner"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-sans flex items-start space-x-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              id="auth-success-banner"
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-sans flex items-start space-x-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{successMessage}</div>
            </div>
          )}

          {/* Google Sign In Button */}
          {mode !== 'forgot_password' && (
            <>
              <button
                id="btn-google-auth"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-3 px-4 rounded-full border border-[#D8DCCB] bg-white hover:bg-[#F9F7F2] text-[#43463E] text-xs font-sans font-semibold flex items-center justify-center space-x-3 transition active:scale-[0.99] shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#6B705C]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#E5E2D9]" />
                <span className="bg-white px-3 text-[11px] font-sans uppercase tracking-widest text-[#A5A58D] font-medium absolute">
                  OR
                </span>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#6B705C] uppercase tracking-wider font-sans">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#A5A58D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signup-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajat Banerjee"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-xs font-sans text-[#43463E] placeholder-[#A5A58D] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#6B705C] uppercase tracking-wider font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A5A58D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-xs font-sans text-[#43463E] placeholder-[#A5A58D] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#6B705C] uppercase tracking-wider font-sans">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        resetFormAlerts();
                        setMode('forgot_password');
                      }}
                      className="text-[11px] text-[#6B705C] hover:text-[#585C4B] font-sans hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A5A58D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-xs font-sans text-[#43463E] placeholder-[#A5A58D] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#6B705C] uppercase tracking-wider font-sans">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A5A58D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-signup-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] text-xs font-sans text-[#43463E] placeholder-[#A5A58D] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 px-4 rounded-full bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-sans uppercase tracking-wider font-bold shadow-md shadow-[#6B705C22] flex items-center justify-center space-x-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin'
                      ? 'Sign In'
                      : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Links Switcher */}
          <div className="text-center pt-2 text-xs text-[#737769] font-sans space-y-2">
            {mode === 'signin' && (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetFormAlerts();
                    setMode('signup');
                  }}
                  className="text-[#6B705C] font-semibold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetFormAlerts();
                    setMode('signin');
                  }}
                  className="text-[#6B705C] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot_password' && (
              <button
                type="button"
                onClick={() => {
                  resetFormAlerts();
                  setMode('signin');
                }}
                className="inline-flex items-center space-x-1 text-[#6B705C] font-semibold hover:underline cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            )}

            {(onExploreDemo || onContinueAsGuest) && (
              <div className="pt-3 border-t border-[#E5E2D9] space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {onContinueAsGuest && (
                    <button
                      type="button"
                      id="btn-auth-continue-guest"
                      onClick={onContinueAsGuest}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-full border border-[#D8DCCB] hover:bg-[#F4F1EA] text-[#6B705C] text-xs font-semibold font-sans transition active:scale-95"
                    >
                      <span>Explore Dashboard</span>
                    </button>
                  )}
                  {onExploreDemo && (
                    <button
                      type="button"
                      id="btn-auth-explore-demo"
                      onClick={onExploreDemo}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-full border border-[#D8DCCB] bg-[#E9EDC9]/60 hover:bg-[#E9EDC9] text-[#43463E] text-xs font-semibold font-sans transition active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#6B705C]" />
                      <span>Try Demo Lesson</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Educational Features Banner */}
      <footer className="w-full border-t border-[#E5E2D9] bg-white/60 py-4 px-6 text-center text-xs text-[#A5A58D] font-sans">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#6B705C]" />
            <span>Personalized Curriculum</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-[#6B705C]" />
            <span>Misconception Diagnostics</span>
          </div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#6B705C]" />
            <span>Interactive Visual Blackboards</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
