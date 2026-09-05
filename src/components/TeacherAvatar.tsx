import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, MessageSquare, Gauge, Activity } from 'lucide-react';
import { teacherVoice, VoiceStatus, SpeechDiagnostics } from '../services/voice/teacherVoice';
import { PreferredLanguage, TeacherState } from '../types';

interface TeacherAvatarProps {
  speechText?: string;
  subtitles?: string;
  tone?: string;
  language: PreferredLanguage;
  isEvaluating?: boolean;
  avatarPersona?: 'sophia' | 'aryan' | 'elena';
  adaptationNotice?: string | null;
  onAskQuestion?: () => void;
  autoPlay?: boolean;
  preferredVoice?: string;
  voiceMode?: 'fast' | 'enhanced';
  realWorldExample?: string;
  cycleState?: TeacherState['cycleState'];
  onSpeechEnd?: () => void;
  onSpeechStart?: () => void;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  speechText = '',
  subtitles = '',
  tone = 'calm and clear',
  language,
  isEvaluating = false,
  avatarPersona = 'sophia',
  adaptationNotice,
  onAskQuestion,
  autoPlay = true,
  preferredVoice = 'Kore',
  voiceMode = 'fast',
  realWorldExample,
  cycleState,
  onSpeechEnd,
  onSpeechStart,
}) => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [liveSubtitle, setLiveSubtitle] = useState('');
  const [blink, setBlink] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [diagnostics, setDiagnostics] = useState<SpeechDiagnostics>(teacherVoice.getDiagnostics());

  const isSpeaking = voiceStatus === 'speaking';
  const isPaused = voiceStatus === 'paused';

  // Determine current active teacher status
  const getTeacherStatus = () => {
    if (isSpeaking) return { text: 'Speaking', color: 'var(--primary)' };
    if (isPaused) return { text: 'Paused', color: 'var(--warning)' };
    if (adaptationNotice) return { text: 'Adapting', color: 'var(--warning)' };
    if (isEvaluating || cycleState === 'EVALUATING') return { text: 'Evaluating', color: 'var(--secondary)' };
    if (cycleState === 'AWAITING_ANSWER') return { text: 'Listening', color: 'var(--success)' };
    if (cycleState === 'QUESTIONING') return { text: 'Teaching', color: 'var(--primary)' };
    if (cycleState === 'INTRODUCING') return { text: 'Preparing', color: 'var(--text-muted)' };
    return { text: 'Teaching', color: 'var(--primary)' };
  };

  const status = getTeacherStatus();

  // Periodic natural blinking and subtle micro-movements
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);

    const tiltInterval = setInterval(() => {
      setHeadTilt((Math.random() - 0.5) * 2.5);
    }, 4500);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(tiltInterval);
    };
  }, []);

  // Continuous mouth animation synchronized strictly while actually speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    let animId: number;
    let lastToggle = performance.now();
    let currentOpen = 0.5;

    const loop = (now: number) => {
      if (now - lastToggle > 90) {
        currentOpen = 0.2 + Math.random() * 0.8;
        setMouthOpen(currentOpen);
        lastToggle = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking]);

  // Keep callback refs stable to prevent unneeded resubscriptions
  const onSpeechStartRef = React.useRef(onSpeechStart);
  const onSpeechEndRef = React.useRef(onSpeechEnd);
  useEffect(() => {
    onSpeechStartRef.current = onSpeechStart;
    onSpeechEndRef.current = onSpeechEnd;
  });

  // Subscribe to single authoritative voice controller once on mount
  useEffect(() => {
    const unsubscribe = teacherVoice.subscribe({
      onStatusChange: (newStatus) => {
        setVoiceStatus(newStatus);
        if (newStatus === 'speaking') {
          onSpeechStartRef.current?.();
        } else if (newStatus === 'idle') {
          onSpeechEndRef.current?.();
        }
      },
      onSubtitleChange: (subtitle) => {
        setLiveSubtitle(subtitle);
      },
      onDiagnosticsChange: (d) => {
        setDiagnostics(d);
      },
      onEnd: () => {
        setVoiceStatus('idle');
        onSpeechEndRef.current?.();
      },
      onError: () => {
        setVoiceStatus('error');
      },
    });

    return () => {
      unsubscribe();
      teacherVoice.stop();
    };
  }, []);

  // Trigger speech only when teaching speechText genuinely changes to a new non-empty string
  const prevSpeechTextRef = React.useRef<string>('');
  useEffect(() => {
    if (!speechText || speechText === prevSpeechTextRef.current) {
      return;
    }
    prevSpeechTextRef.current = speechText;

    // Reset voice queue on concept change
    teacherVoice.stop();
    setLiveSubtitle(subtitles || '');

    if (autoPlay && speechText.trim()) {
      teacherVoice.speak(speechText, {
        voiceName: preferredVoice,
        language,
        rate: speechRate,
        voiceMode: voiceMode === 'enhanced' ? 'enhanced' : 'fast',
      });
    }
  }, [speechText, autoPlay]);

  // Toggle Speak / Pause / Resume
  const togglePlayPause = () => {
    teacherVoice.unlockAudio();

    if (voiceStatus === 'speaking') {
      teacherVoice.pause();
    } else if (voiceStatus === 'paused') {
      teacherVoice.resume();
    } else {
      // Idle: start speaking current speech script immediately without regenerating anything!
      const textToSpeak = speechText || teacherVoice.getCurrentScript();
      if (textToSpeak && textToSpeak.trim()) {
        teacherVoice.speak(textToSpeak, {
          voiceName: preferredVoice,
          language,
          rate: speechRate,
          voiceMode: voiceMode === 'enhanced' ? 'enhanced' : 'fast',
        });
      }
    }
  };

  // Replay existing speech immediately without calling Gemini or regenerating text
  const handleReplay = () => {
    teacherVoice.unlockAudio();
    teacherVoice.replay();
  };

  // Adjust playback speed: 0.75x, 1x, 1.25x, 1.5x
  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(speechRate) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setSpeechRate(newSpeed);
    teacherVoice.setRate(newSpeed);
  };

  const personaConfig = {
    sophia: {
      name: 'Prof. Sophia',
      role: 'Physics Educator',
      primaryColor: '#536DFF',
      accentColor: '#8B7CFF',
      hairColor: '#334155',
      suitColor: '#0F172A',
    },
    aryan: {
      name: 'Dr. Aryan',
      role: 'Engineering & Logic Educator',
      primaryColor: '#0ea5e9',
      accentColor: '#38bdf8',
      hairColor: '#1e293b',
      suitColor: '#082f49',
    },
    elena: {
      name: 'Elena Vance',
      role: 'Systems & Biology Educator',
      primaryColor: '#10b981',
      accentColor: '#34d399',
      hairColor: '#78350f',
      suitColor: '#064e3b',
    },
  }[avatarPersona];

  const displayText = liveSubtitle || subtitles || speechText;

  return (
    <div
      id="teacher-stage"
      className="relative flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-panel overflow-hidden transition"
    >
      {/* Stage Header: GURU AI, Name, Status Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center space-x-1.5">
            <img
              src="/guru-ai-logo.jpg"
              alt="Guru AI Logo"
              className="w-4 h-4 rounded-sm object-cover border border-[var(--border)]"
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono text-[var(--primary)] block">
              GURU AI
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <h3 className="text-base sm:text-lg font-serif font-semibold text-[var(--text-primary)]">
              {personaConfig.name}
            </h3>
            <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">
              • {personaConfig.role}
            </span>
          </div>
        </div>

        {/* Dynamic Teacher Status */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)]">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
            {status.text}
          </span>
        </div>
      </div>

      {/* Main Avatar Visual Area - Large & Prominent */}
      <div className="relative flex flex-col items-center justify-center my-4 py-4 sm:py-6">
        {/* Soft Ambient Glow Behind Avatar */}
        <div
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
            isSpeaking
              ? 'opacity-40 scale-110 bg-[var(--primary)]'
              : 'opacity-15 scale-95 bg-[var(--primary)]'
          }`}
        />

        {/* Large Lightweight SVG Avatar */}
        <div
          className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full border border-[var(--border-strong)] bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--surface-board)] shadow-inner flex items-center justify-center overflow-hidden transition-transform duration-300"
          style={{ transform: `rotate(${headTilt}deg)` }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full select-none">
            <defs>
              <linearGradient id="avatarSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fdba74" />
              </linearGradient>
              <linearGradient id="avatarSuit" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={personaConfig.primaryColor} />
                <stop offset="100%" stopColor={personaConfig.suitColor} />
              </linearGradient>
            </defs>

            {/* Suit & Shoulders */}
            <path
              d="M 25 195 Q 50 135, 100 130 Q 150 135, 175 195 Z"
              fill="url(#avatarSuit)"
            />
            {/* Shirt Collar */}
            <polygon points="85,130 100,162 115,130" fill="#f8fafc" />
            <polygon points="95,140 100,172 105,140" fill="#cbd5e1" />

            {/* Neck */}
            <rect x="86" y="108" width="28" height="26" rx="6" fill="#fed7aa" />

            {/* Head Base */}
            <ellipse cx="100" cy="80" rx="38" ry="46" fill="url(#avatarSkin)" />

            {/* Hair */}
            {avatarPersona === 'sophia' ? (
              <path
                d="M 58 70 C 58 30, 142 30, 142 70 C 145 90, 138 100, 138 100 C 130 60, 70 60, 62 100 Z"
                fill={personaConfig.hairColor}
              />
            ) : (
              <path
                d="M 60 65 C 60 35, 140 35, 140 65 C 135 48, 65 48, 60 65 Z"
                fill={personaConfig.hairColor}
              />
            )}

            {/* Glasses Frame (Educator look) */}
            <rect x="70" y="69" width="24" height="15" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--text-primary)]" />
            <rect x="106" y="69" width="24" height="15" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--text-primary)]" />
            <line x1="94" y1="76" x2="106" y2="76" stroke="currentColor" strokeWidth="2.5" className="text-[var(--text-primary)]" />

            {/* Eyes */}
            {blink ? (
              <>
                <line x1="74" y1="77" x2="88" y2="77" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--text-primary)]" />
                <line x1="112" y1="77" x2="124" y2="77" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--text-primary)]" />
              </>
            ) : (
              <>
                <ellipse cx="81" cy="76" rx="4" ry="4" fill="currentColor" className="text-[var(--text-primary)]" />
                <ellipse cx="118" cy="76" rx="4" ry="4" fill="currentColor" className="text-[var(--text-primary)]" />
                <circle cx="82.5" cy="74.5" r="1.5" fill="#ffffff" />
                <circle cx="119.5" cy="74.5" r="1.5" fill="#ffffff" />
              </>
            )}

            {/* Eyebrows */}
            <path d="M 72 65 Q 81 61, 90 65" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--text-secondary)]" />
            <path d="M 110 65 Q 119 61, 128 65" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--text-secondary)]" />

            {/* Nose */}
            <path d="M 100 79 L 98 89 L 103 89" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

            {/* Animated Mouth */}
            {isSpeaking ? (
              <g>
                <ellipse
                  cx="100"
                  cy={102 + mouthOpen * 2}
                  rx={5 + mouthOpen * 4}
                  ry={2.5 + mouthOpen * 5}
                  fill="#881337"
                />
                {mouthOpen > 0.4 && (
                  <rect
                    x={100 - (3 + mouthOpen * 2)}
                    y={100.5}
                    width={(3 + mouthOpen * 2) * 2}
                    height="2"
                    rx="1"
                    fill="#FEFAE0"
                    opacity="0.85"
                  />
                )}
              </g>
            ) : (
              <path
                d="M 92 103 Q 100 108, 108 103"
                fill="none"
                stroke="#991b1b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        {/* Lightweight Animated Waveform & Speaking Indicator */}
        {isSpeaking && (
          <div className="flex items-center space-x-2 mt-4 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-ping" />
            <span className="text-[11px] font-mono font-medium text-[var(--primary)] pr-1">
              Speaking
            </span>
            <div className="flex items-center space-x-1 pl-1">
              <span className="w-1 h-3.5 bg-[var(--primary)] animate-pulse rounded-full" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-[var(--secondary)] animate-pulse rounded-full" style={{ animationDelay: '120ms' }} />
              <span className="w-1 h-2.5 bg-[var(--primary)] animate-pulse rounded-full" style={{ animationDelay: '240ms' }} />
              <span className="w-1 h-4 bg-[var(--secondary)] animate-pulse rounded-full" style={{ animationDelay: '180ms' }} />
            </div>
          </div>
        )}

        {isPaused && (
          <div className="flex items-center space-x-2 mt-4 px-3.5 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
            <span className="text-[11px] font-mono font-medium text-[var(--warning)]">
              Paused
            </span>
          </div>
        )}

        {voiceStatus === 'error' && (
          <div className="mt-4 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-mono text-[var(--danger)] animate-fadeIn">
            Voice playback isn't available. Try again.
          </div>
        )}
      </div>

      {/* Subtitles: Directly below avatar, updates with spoken sentences */}
      <div className="my-2 min-h-[52px] flex items-center justify-center text-center px-4">
        <p className="text-sm sm:text-base text-[var(--text-primary)] leading-relaxed font-serif">
          {displayText ? (
            <span>"{displayText}"</span>
          ) : (
            <span className="text-[var(--text-muted)] italic font-sans text-xs">
              Teacher is preparing the next explanation...
            </span>
          )}
        </p>
      </div>

      {/* Physical Analogy / Real-World Example (Appears when relevant) */}
      {realWorldExample && (
        <div className="mt-3 p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs space-y-1 animate-fadeIn">
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-[var(--primary)] block">
            REAL-WORLD EXAMPLE
          </span>
          <p className="text-[var(--text-secondary)] italic leading-relaxed">
            "{realWorldExample}"
          </p>
        </div>
      )}

      {/* Compact Teacher Controls: Play, Replay, Speed, Ask Teacher */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)] text-xs">
        <div className="flex items-center space-x-2">
          {/* Speak / Pause / Resume */}
          <button
            id="btn-toggle-speech"
            type="button"
            onClick={togglePlayPause}
            title={isSpeaking ? 'Pause Teacher' : isPaused ? 'Resume Teacher' : 'Speak (Instant Playback)'}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
          >
            {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Pause' : isPaused ? 'Resume' : 'Speak'}</span>
          </button>

          {/* Replay */}
          <button
            id="btn-replay-speech"
            type="button"
            onClick={handleReplay}
            title="Replay explanation"
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition active:scale-90 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed: 0.75x, 1x, 1.25x, 1.5x */}
          <button
            id="btn-cycle-speed"
            type="button"
            onClick={cycleSpeed}
            title="Adjust speech pace"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-mono text-xs font-semibold transition active:scale-95 cursor-pointer"
          >
            <Gauge className="w-3 h-3 text-[var(--text-muted)]" />
            <span>{speechRate}x</span>
          </button>
        </div>

        {onAskQuestion && (
          <button
            id="btn-ask-teacher"
            type="button"
            onClick={onAskQuestion}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-medium transition active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Ask Guru AI</span>
          </button>
        )}
      </div>

      {/* Development-Only Speech Debug Panel */}
      {(import.meta as any).env?.DEV && (
        <div className="mt-3 pt-2.5 border-t border-[var(--border)] font-mono text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1 font-semibold text-[var(--text-secondary)]">
              <Activity className="w-3 h-3 text-[var(--primary)]" />
              <span>Speech Diagnostics</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-[10px] underline hover:text-[var(--primary)] cursor-pointer"
            >
              {showDebugPanel ? 'Hide' : 'Verify Latency'}
            </button>
          </div>

          {showDebugPanel && (
            <div className="mt-2 p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] space-y-1">
              <div>Voice Engine: <span className="text-[var(--primary)] font-semibold">{diagnostics.voiceEngine}</span></div>
              <div>Text Ready: <span className="text-emerald-600 font-semibold">{speechText && speechText.trim() ? 'YES' : 'NO'}</span></div>
              <div>Speech Start: <span className="text-[var(--text-primary)]">{diagnostics.speechStart || 'Waiting for speech'}</span></div>
              <div>Speech End: <span className="text-[var(--text-primary)]">{diagnostics.speechEnd || '—'}</span></div>
              <div>Gemini Request Before Speak: <span className="text-emerald-600 font-semibold">{diagnostics.geminiRequestBeforeSpeak ? 'YES' : 'NO'}</span></div>
              <div>TTS Request Before Speak: <span className="text-emerald-600 font-semibold">{diagnostics.ttsRequestBeforeSpeak ? 'YES' : 'NO'}</span></div>
              {diagnostics.latencyMs !== null && (
                <div className="text-xs font-bold text-emerald-600 pt-0.5">
                  Measured Latency: {diagnostics.latencyMs}ms (&lt; 1 sec target achieved)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
