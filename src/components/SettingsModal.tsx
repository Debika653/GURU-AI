import React from 'react';
import { AppSettings, PreferredLanguage } from '../types';
import { Settings, Volume2, Globe, Eye, Sliders, X, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  currentLanguage: PreferredLanguage;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onChangeLanguage: (lang: PreferredLanguage) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentLanguage,
  onUpdateSettings,
  onChangeLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#43463E]/40 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-[28px] border border-[#E5E2D9] bg-white p-6 sm:p-7 shadow-2xl space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#E9EDC9] text-[#6B705C] border border-[#D8DCCB]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-medium text-[#43463E] tracking-tight">
                Teacher & Classroom Settings
              </h2>
              <p className="text-xs text-[#A5A58D]">Configure voice, language, and presentation.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#737769] hover:text-[#43463E] hover:bg-[#F9F7F2] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Active Language */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#43463E] flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-[#6B705C]" />
              <span>Teaching Language (Preserves Lesson Context)</span>
            </label>
            <select
              value={currentLanguage}
              onChange={(e) => onChangeLanguage(e.target.value as PreferredLanguage)}
              className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] p-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
            >
              <option value="English">English</option>
              <option value="Hinglish">Hinglish (Hindi + English)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
            </select>
          </div>

          {/* Voice Engine Mode */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#43463E] flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#6B705C]" />
                <span>Voice Engine Mode</span>
              </span>
              <span className="text-[10px] text-[#A5A58D]">
                {settings.voiceMode === 'enhanced' ? 'Gemini Cloud TTS' : 'Browser SpeechSynthesis (Instant)'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ voiceMode: 'fast' })}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                  (settings.voiceMode || 'fast') === 'fast'
                    ? 'border-[#6B705C] bg-[#E9EDC9]/40 text-[#43463E] font-semibold'
                    : 'border-[#E5E2D9] bg-[#F9F7F2] text-[#737769] hover:bg-white'
                }`}
              >
                <div className="font-medium">Fast Voice (Default)</div>
                <div className="text-[10px] text-[#A5A58D]">Instant zero-latency browser speech</div>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ voiceMode: 'enhanced' })}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                  settings.voiceMode === 'enhanced'
                    ? 'border-[#6B705C] bg-[#E9EDC9]/40 text-[#43463E] font-semibold'
                    : 'border-[#E5E2D9] bg-[#F9F7F2] text-[#737769] hover:bg-white'
                }`}
              >
                <div className="font-medium">Enhanced AI Voice</div>
                <div className="text-[10px] text-[#A5A58D]">Gemini cloud audio voice</div>
              </button>
            </div>
          </div>

          {/* Teacher Voice */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#43463E] flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#6B705C]" />
              <span>Teacher Voice Tone</span>
            </label>
            <select
              value={settings.preferredVoice}
              onChange={(e) => onUpdateSettings({ preferredVoice: e.target.value })}
              className="w-full rounded-2xl bg-[#F9F7F2] border border-[#E5E2D9] p-2.5 text-xs text-[#43463E] focus:outline-none focus:border-[#6B705C] focus:bg-white transition"
            >
              <option value="Kore">Kore (Warm, articulate female educator)</option>
              <option value="Puck">Puck (Energetic, engaging male teacher)</option>
              <option value="Fenrir">Fenrir (Authoritative, calm academic)</option>
              <option value="Zephyr">Zephyr (Supportive, conversational mentor)</option>
            </select>
          </div>

          {/* Teacher Avatar Model Style */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#43463E] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6B705C]" />
              <span>Guru AI Persona</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'avatar-female', name: 'Prof. Sophia' },
                { id: 'avatar-male', name: 'Dr. Aryan' },
                { id: 'avatar-modern', name: 'Elena Vance' },
              ].map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => onUpdateSettings({ avatarStyle: persona.id as any })}
                  className={`p-2.5 rounded-2xl border text-center transition text-xs ${
                    settings.avatarStyle === persona.id
                      ? 'bg-[#E9EDC9] border-[#D8DCCB] text-[#43463E] font-semibold shadow-sm'
                      : 'bg-[#F9F7F2] border-[#E5E2D9] text-[#737769] hover:bg-[#F4F1EA]'
                  }`}
                >
                  {persona.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-[#E5E2D9] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#43463E]">Auto-play Teacher Voice</span>
                <p className="text-[11px] text-[#A5A58D]">Automatically speak when a new explanation appears</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoPlayVoice}
                onChange={(e) => onUpdateSettings({ autoPlayVoice: e.target.checked })}
                className="w-4 h-4 rounded accent-[#6B705C] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#43463E]">Show Subtitles & Teleprompter</span>
                <p className="text-[11px] text-[#A5A58D]">Display synchronized live text transcript</p>
              </div>
              <input
                type="checkbox"
                checked={settings.showSubtitles}
                onChange={(e) => onUpdateSettings({ showSubtitles: e.target.checked })}
                className="w-4 h-4 rounded accent-[#6B705C] cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E5E2D9] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#6B705C] hover:bg-[#585C4B] text-white text-xs font-sans uppercase tracking-wider font-bold transition shadow-md shadow-[#6B705C22]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
