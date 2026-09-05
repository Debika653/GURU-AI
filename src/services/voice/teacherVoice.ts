export type VoiceState = 'idle' | 'speaking' | 'paused' | 'error';
export type VoiceStatus = VoiceState;

export interface SpeechDiagnostics {
  voiceEngine: 'SpeechSynthesis';
  textReady: boolean;
  speechStart: string | null;
  speechEnd: string | null;
  geminiRequestBeforeSpeak: boolean;
  ttsRequestBeforeSpeak: boolean;
  latencyMs: number | null;
}

export interface VoiceOptions {
  voiceName?: string;
  language?: string;
  rate?: number; // 0.75 | 1.0 | 1.25 | 1.5
  voiceMode?: 'fast' | 'enhanced';
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (charIndex: number, charLength?: number) => void;
  onStatusChange?: (status: VoiceState) => void;
  onSubtitleChange?: (subtitle: string) => void;
  onChunkStart?: (chunkIndex: number, totalChunks: number, chunkText: string) => void;
  onError?: (error: any) => void;
}

export interface VoiceListener {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStatusChange?: (status: VoiceState) => void;
  onSubtitleChange?: (subtitle: string) => void;
  onChunkStart?: (chunkIndex: number, totalChunks: number, chunkText: string) => void;
  onBoundary?: (charIndex: number, charLength?: number) => void;
  onError?: (error: any) => void;
  onDiagnosticsChange?: (diagnostics: SpeechDiagnostics) => void;
}

/**
 * Strips markdown annotations and cleans text for natural spoken delivery
 */
export function cleanSpeechText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/#+\s+/g, '') // headings
    .replace(/`([^`]+)`/g, '$1') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits a full teaching script into natural sentence groups.
 * Ensures chunks are complete sentences and NEVER splits words or splits mid-sentence.
 * Keeps chunks around 120-200 characters for optimal SpeechSynthesis reliability across Chrome & Edge.
 */
export function splitIntoTeachingChunks(script: string): string[] {
  const cleaned = cleanSpeechText(script);
  if (!cleaned) return [];

  // Split by complete sentences ending in . ! ? or Hindi danda ।, or newlines
  const rawSentences = cleaned.match(/[^.!?।\n]+[.!?।]+(?:\s|$)|[^.!?।\n]+$/g) || [cleaned];
  const chunks: string[] = [];
  let buffer = '';

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if ((buffer + ' ' + trimmed).length > 200 && buffer.length > 0) {
      chunks.push(buffer.trim());
      buffer = trimmed;
    } else {
      buffer = buffer ? `${buffer} ${trimmed}` : trimmed;
    }
  }

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks.length > 0 ? chunks : [cleaned];
}

// Safe helper for speech synthesis in sandboxed/iframe environments
function getSafeSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  try {
    if ('speechSynthesis' in window && window.speechSynthesis) {
      return window.speechSynthesis;
    }
  } catch {
    return null;
  }
  return null;
}

// Global cached voices initialized eagerly
let cachedVoices: SpeechSynthesisVoice[] = [];
function initializeVoicesCache(): void {
  const synth = getSafeSpeechSynthesis();
  if (!synth) return;
  try {
    const voices = synth.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
    }
  } catch {}
}

try {
  const synth = getSafeSpeechSynthesis();
  if (synth) {
    initializeVoicesCache();
    synth.onvoiceschanged = initializeVoicesCache;
  }
} catch {}

/**
 * Maps application language names to standard BCP-47 speech synthesis locale tags
 * English → en-IN
 * Hindi → hi-IN
 * Hinglish → en-IN
 * Bengali → bn-IN
 */
export function mapLanguageToLocale(language: string): string {
  const lang = (language || 'English').toLowerCase().trim();
  if (lang.includes('hindi')) return 'hi-IN';
  if (lang.includes('hinglish')) return 'en-IN';
  if (lang.includes('bengali')) return 'bn-IN';
  if (lang.includes('tamil')) return 'ta-IN';
  if (lang.includes('telugu')) return 'te-IN';
  if (lang.includes('marathi')) return 'mr-IN';
  if (lang.includes('gujarati')) return 'gu-IN';
  if (lang.includes('kannada')) return 'kn-IN';
  if (lang.includes('malayalam')) return 'ml-IN';
  if (lang.includes('punjabi')) return 'pa-IN';
  if (lang.includes('spanish')) return 'es-ES';
  if (lang.includes('french')) return 'fr-FR';
  return 'en-IN';
}

/**
 * Selects best available cached browser voice without blocking network lookup
 */
function findBestVoice(locale: string): SpeechSynthesisVoice | null {
  if (cachedVoices.length === 0) {
    initializeVoicesCache();
  }
  if (cachedVoices.length === 0) return null;

  const target = locale.toLowerCase().replace('_', '-');
  const langPrefix = target.split('-')[0];

  // 1. Exact locale match with high quality indicator
  const premiumMatch = cachedVoices.find((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    return (
      vLang === target &&
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Enhanced') ||
        v.name.includes('Online') ||
        v.name.includes('Premium'))
    );
  });
  if (premiumMatch) return premiumMatch;

  // 2. Exact locale match
  const exactMatch = cachedVoices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === target
  );
  if (exactMatch) return exactMatch;

  // 3. Language prefix match (e.g. 'hi' or 'bn' or 'en')
  const prefixMatch = cachedVoices.find((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)
  );
  if (prefixMatch) return prefixMatch;

  // 4. English fallback
  const enMatch = cachedVoices.find((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith('en')
  );
  if (enMatch) return enMatch;

  return cachedVoices[0] || null;
}

/**
 * Single Authoritative Voice Controller
 * Handles Speak, Pause, Resume, Stop, Replay using the browser Web Speech API.
 */
class TeacherVoiceService {
  private status: VoiceState = 'idle';
  private currentText = '';
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private currentSpeed = 1.0;
  private currentLanguage = 'English';
  private currentSessionId = 0;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<VoiceListener> = new Set();
  private audioUnlocked = false;
  private currentOptions: VoiceOptions | null = null;
  private speakTriggerTime = 0;

  private diagnostics: SpeechDiagnostics = {
    voiceEngine: 'SpeechSynthesis',
    textReady: true,
    speechStart: null,
    speechEnd: null,
    geminiRequestBeforeSpeak: false,
    ttsRequestBeforeSpeak: false,
    latencyMs: null,
  };

  constructor() {
    this.setupAudioUnlock();
  }

  private setupAudioUnlock(): void {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.unlockAudio();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { passive: true, once: true });
  }

  public unlockAudio(): void {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    try {
      const synth = getSafeSpeechSynthesis();
      if (synth) {
        synth.resume();
      }
    } catch {}
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    listener.onStatusChange?.(this.status);
    listener.onDiagnosticsChange?.(this.diagnostics);
    return () => this.listeners.delete(listener);
  }

  private setStatus(newStatus: VoiceState): void {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.listeners.forEach((l) => l.onStatusChange?.(newStatus));
    this.currentOptions?.onStatusChange?.(newStatus);
  }

  private updateSubtitle(text: string): void {
    this.listeners.forEach((l) => l.onSubtitleChange?.(text));
    this.currentOptions?.onSubtitleChange?.(text);
  }

  private updateDiagnostics(updates: Partial<SpeechDiagnostics>): void {
    this.diagnostics = { ...this.diagnostics, ...updates };
    this.listeners.forEach((l) => l.onDiagnosticsChange?.(this.diagnostics));
  }

  public getStatus(): VoiceState {
    return this.status;
  }

  public isSpeaking(): boolean {
    return this.status === 'speaking';
  }

  public isPaused(): boolean {
    return this.status === 'paused';
  }

  public getRate(): number {
    return this.currentSpeed;
  }

  public getCurrentScript(): string {
    return this.currentText;
  }

  public getState() {
    return {
      status: this.status,
      currentText: this.currentText,
      chunks: this.chunks,
      currentChunkIndex: this.currentChunkIndex,
      currentSpeed: this.currentSpeed,
      currentLanguage: this.currentLanguage,
    };
  }

  public getDiagnostics(): SpeechDiagnostics {
    return this.diagnostics;
  }

  /**
   * Set speech pace (0.75x, 1x, 1.25x, 1.5x)
   * Dynamically adjusts without regenerating lesson content or calling Gemini.
   * If speed changes while paused: applies to active utterance and subsequent chunks.
   */
  public setRate(rate: number): void {
    this.currentSpeed = Math.max(0.5, Math.min(2.0, rate));
    if (this.activeUtterance) {
      this.activeUtterance.rate = this.currentSpeed;
    }
  }

  public setSpeed(speed: number): void {
    this.setRate(speed);
  }

  /**
   * Fast Low-Latency Speak
   * Uses browser Web Speech API. Zero blocking requests.
   */
  public async speak(text?: string, options?: VoiceOptions): Promise<void> {
    const targetText = text !== undefined ? text : this.currentText;
    const cleaned = cleanSpeechText(targetText);

    if (!cleaned) {
      this.stop();
      return;
    }

    // DOUBLE CLICK PROTECTION:
    // 1. If currently speaking the exact same text, ignore second SPEAK click
    if (this.status === 'speaking' && this.currentText === targetText) {
      return;
    }

    // 2. If paused on the same text, SPEAK acts as RESUME
    if (this.status === 'paused' && (!text || targetText === this.currentText)) {
      this.resume();
      return;
    }

    // Record timestamp for latency tracking (< 1 sec target)
    this.speakTriggerTime = performance.now();

    // Cancel any previous speech immediately
    this.stopInternal();
    this.unlockAudio();

    // Session ID increment: ensures old utterance callbacks never mutate new state
    const sessionId = ++this.currentSessionId;

    this.currentText = targetText;
    this.currentOptions = options || null;
    if (options?.language) {
      this.currentLanguage = options.language;
    }
    if (options?.rate) {
      this.currentSpeed = options.rate;
    }

    this.chunks = splitIntoTeachingChunks(targetText);
    this.currentChunkIndex = 0;

    if (this.chunks.length === 0) {
      this.setStatus('idle');
      return;
    }

    this.updateDiagnostics({
      voiceEngine: 'SpeechSynthesis',
      textReady: true,
      speechStart: null,
      speechEnd: null,
      geminiRequestBeforeSpeak: false,
      ttsRequestBeforeSpeak: false,
      latencyMs: null,
    });

    // Start Chunk 0 immediately
    this.playChunk(0, sessionId);
  }

  /**
   * Plays a single chunk via window.speechSynthesis
   * IMPORTANT CHUNK QUEUE RULES:
   * - DO NOT call speechSynthesis.cancel() between chunks
   * - DO NOT call speechSynthesis.pause() between chunks
   */
  private playChunk(index: number, sessionId: number): void {
    if (sessionId !== this.currentSessionId) return;

    if (index >= this.chunks.length) {
      this.onSpeechEndInternal(sessionId);
      return;
    }

    this.currentChunkIndex = index;
    const chunkText = this.chunks[index];
    const totalChunks = this.chunks.length;

    // Update live subtitle immediately
    this.updateSubtitle(chunkText);
    this.listeners.forEach((l) => l.onChunkStart?.(index, totalChunks, chunkText));
    this.currentOptions?.onChunkStart?.(index, totalChunks, chunkText);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.setStatus('error');
      this.onSpeechEndInternal(sessionId);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      this.activeUtterance = utterance;

      const locale = mapLanguageToLocale(this.currentLanguage);
      utterance.lang = locale;
      utterance.rate = this.currentSpeed;
      utterance.pitch = 1.0;

      const voice = findBestVoice(locale);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        if (sessionId !== this.currentSessionId) return;
        if (this.status !== 'speaking') {
          this.setStatus('speaking');
          this.listeners.forEach((l) => l.onStart?.());
          this.currentOptions?.onStart?.();

          if (this.speakTriggerTime > 0) {
            const latency = Math.round(performance.now() - this.speakTriggerTime);
            this.updateDiagnostics({
              speechStart: new Date().toLocaleTimeString(),
              latencyMs: latency,
            });
            this.speakTriggerTime = 0;
          }
        }
      };

      utterance.onpause = () => {
        if (sessionId !== this.currentSessionId) return;
        this.setStatus('paused');
        this.listeners.forEach((l) => l.onPause?.());
        this.currentOptions?.onPause?.();
      };

      utterance.onresume = () => {
        if (sessionId !== this.currentSessionId) return;
        this.setStatus('speaking');
        this.listeners.forEach((l) => l.onResume?.());
        this.currentOptions?.onResume?.();
      };

      utterance.onboundary = (event) => {
        if (sessionId !== this.currentSessionId) return;
        this.listeners.forEach((l) => l.onBoundary?.(event.charIndex, (event as any).charLength));
        this.currentOptions?.onBoundary?.(event.charIndex, (event as any).charLength);
      };

      utterance.onend = () => {
        if (sessionId !== this.currentSessionId) return;
        this.activeUtterance = null;

        // If user paused, preserve paused status and update currentChunkIndex
        if (this.status === 'paused') {
          this.currentChunkIndex = index + 1;
          return;
        }

        // Proceed immediately to next chunk
        if (this.status === 'speaking') {
          const nextIndex = index + 1;
          if (nextIndex < this.chunks.length) {
            this.playChunk(nextIndex, sessionId);
          } else {
            this.onSpeechEndInternal(sessionId);
          }
        }
      };

      utterance.onerror = (err) => {
        if (sessionId !== this.currentSessionId) return;
        const errType = (err as any).error;
        if (errType === 'canceled' || errType === 'interrupted') {
          return;
        }
        console.warn('SpeechSynthesis notice:', err);
        this.activeUtterance = null;
        const nextIndex = index + 1;
        if (nextIndex < this.chunks.length && this.status === 'speaking') {
          this.playChunk(nextIndex, sessionId);
        } else {
          this.setStatus('error');
          this.onSpeechEndInternal(sessionId);
          this.listeners.forEach((l) => l.onError?.(err));
          this.currentOptions?.onError?.(err);
        }
      };

      const synth = getSafeSpeechSynthesis();
      if (!synth) {
        throw new Error('Speech synthesis is not supported or accessible in this environment.');
      }
      synth.speak(utterance);
    } catch (err) {
      if (sessionId !== this.currentSessionId) return;
      console.warn('SpeechSynthesis error:', err);
      this.setStatus('error');
      this.onSpeechEndInternal(sessionId);
      this.listeners.forEach((l) => l.onError?.(err));
      this.currentOptions?.onError?.(err);
    }
  }

  private onSpeechEndInternal(sessionId: number): void {
    if (sessionId !== this.currentSessionId) return;
    this.setStatus('idle');
    this.activeUtterance = null;
    this.updateDiagnostics({
      speechEnd: new Date().toLocaleTimeString(),
    });
    this.listeners.forEach((l) => l.onEnd?.());
    this.currentOptions?.onEnd?.();
  }

  /**
   * PAUSE speech immediately
   * Calls window.speechSynthesis.pause()
   * MUST NOT call cancel() because cancel destroys the speech position!
   */
  public pause(): void {
    if (this.status !== 'speaking') return;

    try {
      const synth = getSafeSpeechSynthesis();
      if (synth) {
        synth.pause();
      }
    } catch (e) {
      console.warn('speechSynthesis.pause error:', e);
    }

    this.setStatus('paused');
    this.listeners.forEach((l) => l.onPause?.());
    this.currentOptions?.onPause?.();
  }

  /**
   * RESUME speech immediately
   * Calls window.speechSynthesis.resume()
   * Audio continues from paused position.
   * Does NOT create a new utterance if browser is already paused.
   * Does NOT restart from beginning.
   * Does NOT call Gemini.
   */
  public resume(): void {
    if (this.status !== 'paused') return;

    try {
      const synth = getSafeSpeechSynthesis();
      if (synth) {
        // If browser has an active utterance paused, resume it
        if (synth.paused) {
          synth.resume();
        } else if (!synth.speaking && this.currentChunkIndex < this.chunks.length) {
          // If browser prematurely dropped the utterance while paused, play from currentChunkIndex
          this.playChunk(this.currentChunkIndex, this.currentSessionId);
        } else {
          synth.resume();
        }
      }
    } catch (e) {
      console.warn('speechSynthesis.resume error:', e);
      if (this.currentChunkIndex < this.chunks.length) {
        this.playChunk(this.currentChunkIndex, this.currentSessionId);
      }
    }

    this.setStatus('speaking');
    this.listeners.forEach((l) => l.onResume?.());
    this.currentOptions?.onResume?.();
  }

  /**
   * Internal cancellation without resetting session
   */
  private stopInternal(): void {
    try {
      const synth = getSafeSpeechSynthesis();
      if (synth) {
        synth.cancel();
      }
    } catch {}
    this.activeUtterance = null;
    this.status = 'idle';
  }

  /**
   * STOP operation
   * Cancels speech, clears queue, sets state to "idle"
   */
  public stop(): void {
    // Invalidate session so pending callbacks are discarded
    this.currentSessionId++;
    this.stopInternal();
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.setStatus('idle');
  }

  /**
   * REPLAY
   * Cancels current speech, clears queue, speaks current text from beginning.
   * No Gemini call, no content regeneration.
   */
  public replay(): void {
    if (!this.currentText) return;
    this.speakTriggerTime = performance.now();
    this.stopInternal();

    const sessionId = ++this.currentSessionId;
    this.chunks = splitIntoTeachingChunks(this.currentText);
    this.currentChunkIndex = 0;

    this.updateDiagnostics({
      speechStart: null,
      speechEnd: null,
      geminiRequestBeforeSpeak: false,
      ttsRequestBeforeSpeak: false,
      latencyMs: null,
    });

    this.playChunk(0, sessionId);
  }
}

export const teacherVoice = new TeacherVoiceService();
