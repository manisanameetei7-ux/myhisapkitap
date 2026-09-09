import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Radio,
  Sliders,
  Layers,
  Wand2,
  FileText,
  UserCheck,
  Video,
  Languages,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../data/translations';
import {
  HUMAN_VOICE_PERSONAS,
  HumanVoicePersona,
  ASSAMESE_STUDIO_PRESETS,
  HINDI_STUDIO_PRESETS,
  IndicStudioPreset,
  fetchHumanSpeechAudio,
  downloadWavAudio,
} from '../utils/humanVoice';

interface VoiceStudioModalProps {
  lang: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
  onLaunchTutorialWithVoice?: (tutorialIdx: number, voiceId: string, lang: LanguageCode) => void;
}

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
  lang,
  isOpen,
  onClose,
  onLaunchTutorialWithVoice,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(
    lang === 'hi' ? 'hi' : lang === 'as' ? 'as' : 'as'
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    lang === 'hi' ? 'ananya-hi-female' : 'pratibha-as-female'
  );
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('female');

  const currentPresets = selectedLang === 'hi' ? HINDI_STUDIO_PRESETS : ASSAMESE_STUDIO_PRESETS;

  const [inputText, setInputText] = useState<string>(currentPresets[0].nativeText);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(currentPresets[0].id);

  // Playback & State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentBlobUrl, setCurrentBlobUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Ready for Ultra-Realistic Human Voice Synthesis'
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop any active playing audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setAudioProgress(0);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
  }, [isOpen]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  if (!isOpen) return null;

  const currentPersona =
    HUMAN_VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) || HUMAN_VOICE_PERSONAS[0];

  const filteredPersonas = HUMAN_VOICE_PERSONAS.filter((p) => {
    if (genderFilter === 'female') return p.gender === 'female';
    if (genderFilter === 'male') return p.gender === 'male';
    return true;
  });

  // Handle Preset Selection
  const handleSelectPreset = (preset: IndicStudioPreset) => {
    setSelectedPresetId(preset.id);
    setInputText(preset.nativeText);
    setSelectedPersonaId(preset.recommendedVoiceId);
    stopAudio();
  };

  // Switch Language
  const handleLanguageChange = (newLang: LanguageCode) => {
    setSelectedLang(newLang);
    const presets = newLang === 'hi' ? HINDI_STUDIO_PRESETS : ASSAMESE_STUDIO_PRESETS;
    const defaultPersona = newLang === 'hi' ? 'ananya-hi-female' : 'pratibha-as-female';
    setSelectedPersonaId(defaultPersona);
    setSelectedPresetId(presets[0].id);
    setInputText(presets[0].nativeText);
    stopAudio();
  };

  // Generate & Play Voice Audio
  const handleSynthesizeAndPlay = async () => {
    if (!inputText.trim()) return;
    stopAudio();
    setIsLoading(true);
    setStatusMessage('Synthesizing studio HD human audio with Gemini Flash TTS...');

    try {
      const wavUrl = await fetchHumanSpeechAudio(inputText, selectedLang, selectedPersonaId);
      setCurrentBlobUrl(wavUrl);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = wavUrl;
      audio.playbackRate = playbackSpeed;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setAudioProgress(100);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
      setStatusMessage('Playing Ultra-Realistic Assamese Female Voice (24kHz HD PCM)');

      // Progress Tracker Loop
      const updateProgress = () => {
        if (audioRef.current && !audioRef.current.paused) {
          const cur = audioRef.current.currentTime;
          const dur = audioRef.current.duration || 1;
          setAudioProgress((cur / dur) * 100);
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };
      animFrameRef.current = requestAnimationFrame(updateProgress);
    } catch (err: any) {
      console.warn('Synthesis error:', err);
      setIsLoading(false);
      setStatusMessage('Generated device fallback narration.');

      // Device fallback
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(inputText);
        utterance.rate = playbackSpeed;
        utterance.pitch = currentPersona.gender === 'female' ? 1.15 : 0.95;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  // Quick Voice Preview for a single Persona
  const handlePreviewVoice = async (persona: HumanVoicePersona, e: React.MouseEvent) => {
    e.stopPropagation();
    stopAudio();
    setPreviewingVoiceId(persona.id);

    const sampleText =
      persona.gender === 'female'
        ? 'নমস্কাৰ! মই আপোনাৰ অসমীয়া ভয়েচ গাইড। হিচাপ কিতাপ ব্যৱহাৰ কৰিবলৈ স্বাগতম।'
        : 'নমস্কাৰ! মই আপোনাৰ অসমীয়া সহায়ক কণ্ঠ। আজিৰ দোকানৰ হিচাপ আৰম্ভ কৰক।';

    try {
      const wavUrl = await fetchHumanSpeechAudio(sampleText, 'as', persona.id);
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = wavUrl;
      audioRef.current.onended = () => setPreviewingVoiceId(null);
      await audioRef.current.play();
    } catch (err) {
      setPreviewingVoiceId(null);
    }
  };

  const handleTogglePlayPause = () => {
    if (!audioRef.current || !currentBlobUrl) {
      handleSynthesizeAndPlay();
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (audioRef.current && currentBlobUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      handleSynthesizeAndPlay();
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (currentBlobUrl) {
      downloadWavAudio(
        currentBlobUrl,
        `hisapkitap_${currentPersona.name.replace(/\s+/g, '_').toLowerCase()}_assamese_tutorial.wav`
      );
    }
  };

  // Quick insertion of Assamese phrases
  const insertPhrase = (phrase: string) => {
    setInputText((prev) => (prev ? `${prev} ${phrase}` : phrase));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050608]/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#101419] border border-[#26313B] rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-5xl max-h-[94vh] transition-all">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#161C23] border-b border-[#26313B] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#17D5B3] via-[#54B6FF] to-[#FF6F91] p-0.5 flex items-center justify-center shadow-lg shadow-[#17D5B3]/20">
              <div className="w-full h-full bg-[#101419] rounded-[10px] flex items-center justify-center text-[#17D5B3]">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-[#F4F8FB] tracking-tight">
                  Ultra-Realistic Human Voice Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FF6F91]/20 text-[#FF6F91] text-[10px] font-extrabold border border-[#FF6F91]/30">
                  অসমীয়া মহিলা কণ্ঠ (Female Voice)
                </span>
              </div>
              <p className="text-xs text-[#A8B5C2]">
                Studio-grade natural human speech synthesis for Assamese store tutorials, POS guides & khata reminders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-[#101419] p-0.5 rounded-lg border border-[#26313B]">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    selectedLang === l.code
                      ? 'bg-[#17D5B3] text-[#050608] shadow-sm'
                      : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
                  }`}
                >
                  {l.nativeLabel}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-[#101419] hover:bg-red-500/20 text-[#A8B5C2] hover:text-red-400 text-sm font-bold transition-colors"
              title="Close Studio"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#090C0F]">
          {/* Top Banner: Voice Spotlight */}
          <div className="bg-gradient-to-r from-[#17D5B3]/15 via-[#FF6F91]/15 to-[#54B6FF]/15 border border-[#17D5B3]/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6F91] to-[#17D5B3] flex items-center justify-center text-2xl shadow-lg shrink-0">
                  👩
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#17D5B3] uppercase tracking-wider">
                      ✨ {selectedLang === 'hi' ? 'Hindi (हिन्दी)' : selectedLang === 'as' ? 'Assamese (অসমীয়া)' : 'Indic'} Voice Engine Active
                    </span>
                    <span className="text-[10px] font-bold bg-[#101419]/80 text-[#F4F8FB] px-2 py-0.5 rounded-full border border-[#26313B]">
                      {selectedLang === 'hi' ? 'अनन्या / पूजा / प्रिया / आरव' : 'প্ৰতিভা / জোনালী / ৰূপালী / হেমন্ত'}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#F4F8FB] mt-0.5">
                    {selectedLang === 'hi'
                      ? 'Authentic Hindi Pronunciation with Natural Human Inflection'
                      : 'Authentic Assamese Pronunciation with Natural Human Inflection'}
                  </h4>
                  <p className="text-xs text-[#A8B5C2]">
                    High-definition voice output with smooth conversational tone, perfect for teaching customers and shop staff.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (selectedLang === 'hi') {
                      setSelectedPersonaId('ananya-hi-female');
                    } else {
                      setSelectedPersonaId('pratibha-as-female');
                    }
                    setGenderFilter('female');
                    handleSynthesizeAndPlay();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#17D5B3] hover:bg-[#15C2A3] text-[#050608] text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#17D5B3]/25 transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test {selectedLang === 'hi' ? 'Ananya (Hindi)' : 'Pratibha (Assamese)'} Voice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Voice Persona Selection Grid */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#17D5B3]" />
                <h4 className="text-sm font-extrabold text-[#F4F8FB]">
                  Choose Voice Persona (কণ্ঠশিল্পী নিৰ্বাচন)
                </h4>
              </div>

              {/* Gender Filter Buttons */}
              <div className="flex items-center bg-[#101419] p-1 rounded-xl border border-[#26313B]">
                <button
                  onClick={() => setGenderFilter('female')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    genderFilter === 'female'
                      ? 'bg-[#FF6F91] text-[#050608] shadow-md'
                      : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
                  }`}
                >
                  <span>👩 Female Voices (মহিলা কণ্ঠ)</span>
                  <span className="px-1.5 py-0.2 bg-[#050608]/30 rounded text-[10px]">
                    {HUMAN_VOICE_PERSONAS.filter((p) => p.gender === 'female').length}
                  </span>
                </button>

                <button
                  onClick={() => setGenderFilter('male')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    genderFilter === 'male'
                      ? 'bg-[#54B6FF] text-[#050608] shadow-md'
                      : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
                  }`}
                >
                  <span>👨 Male Voices (পুৰুষ কণ্ঠ)</span>
                  <span className="px-1.5 py-0.2 bg-[#050608]/30 rounded text-[10px]">
                    {HUMAN_VOICE_PERSONAS.filter((p) => p.gender === 'male').length}
                  </span>
                </button>

                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    genderFilter === 'all'
                      ? 'bg-[#17D5B3] text-[#050608] shadow-md'
                      : 'text-[#A8B5C2] hover:text-[#F4F8FB]'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Persona Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPersonas.map((persona) => {
                const isSelected = selectedPersonaId === persona.id;
                const isPreviewing = previewingVoiceId === persona.id;

                return (
                  <div
                    key={persona.id}
                    onClick={() => {
                      setSelectedPersonaId(persona.id);
                      stopAudio();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isSelected
                        ? persona.gender === 'female'
                          ? 'bg-[#161C23] border-[#FF6F91] ring-1 ring-[#FF6F91] shadow-lg shadow-[#FF6F91]/10'
                          : 'bg-[#161C23] border-[#17D5B3] ring-1 ring-[#17D5B3] shadow-lg shadow-[#17D5B3]/10'
                        : 'bg-[#101419] border-[#26313B] hover:border-[#A8B5C2]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1 bg-[#101419] rounded-lg border border-[#26313B]">
                            {persona.avatarIcon}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-extrabold text-xs sm:text-sm text-[#F4F8FB]">
                                {persona.name}
                              </h5>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                persona.gender === 'female'
                                  ? 'bg-[#FF6F91]/20 text-[#FF6F91] border border-[#FF6F91]/30'
                                  : 'bg-[#54B6FF]/20 text-[#54B6FF] border border-[#54B6FF]/30'
                              }`}
                            >
                              {persona.badge}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handlePreviewVoice(persona, e)}
                          title="Quick preview voice"
                          className="p-1.5 rounded-lg bg-[#161C23] hover:bg-[#26313B] text-[#17D5B3] border border-[#26313B] transition-colors shrink-0"
                        >
                          {isPreviewing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-[#A8B5C2] leading-relaxed line-clamp-2">
                        {persona.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#26313B]/60 flex items-center justify-between text-[11px] font-mono text-[#A8B5C2]">
                      <span className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-[#17D5B3]" />
                        {persona.voiceName} Model
                      </span>
                      {isSelected && (
                        <span className="text-[#17D5B3] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Tutorial Presets Library */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF6F91]" />
              <h4 className="text-sm font-extrabold text-[#F4F8FB]">
                {selectedLang === 'hi'
                  ? 'Hindi Tutorial Voice Script Presets (हिन्दी पाठ संग्रह)'
                  : 'Assamese Tutorial Voice Script Presets (অসমীয়া পাঠ্য সংগ্ৰহ)'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {currentPresets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#161C23] border-[#17D5B3] ring-1 ring-[#17D5B3]'
                        : 'bg-[#101419] border-[#26313B] hover:border-[#A8B5C2]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#A8B5C2] mb-1">
                      <span className="text-[#FF6F91]">{preset.category}</span>
                      <span className="px-1.5 py-0.2 bg-[#161C23] rounded border border-[#26313B] text-[10px]">
                        Studio Voice
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#F4F8FB] mb-1 truncate">
                      {preset.titleNative}
                    </div>
                    <div className="text-[11px] text-[#A8B5C2] line-clamp-2">
                      "{preset.nativeText}"
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Live Synthesizer Workspace & Text Area */}
          <div className="bg-[#101419] border border-[#26313B] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#26313B] pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#17D5B3]" />
                <h4 className="font-extrabold text-sm text-[#F4F8FB]">
                  {selectedLang === 'hi' ? 'Hindi' : 'Assamese'} Text Synthesizer & Speech Editor
                </h4>
              </div>

              {/* Quick Phrase Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedLang === 'hi' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => insertPhrase('हिसाब किताब में आपका स्वागत है।')}
                      className="px-2 py-0.5 rounded bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    >
                      + स्वागत संदेश
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPhrase('बिलिंग के लिए उत्पाद चुनें या बारकोड स्कैन करें।')}
                      className="px-2 py-0.5 rounded bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    >
                      + बिलिंग सहायता
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPhrase('ग्राहक को बकाया राशि और यूपीआई लिंक भेजें।')}
                      className="px-2 py-0.5 rounded bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    >
                      + उधार तगादा
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => insertPhrase('হিচাপ কিতাপত স্বাগতম।')}
                      className="px-2 py-0.5 rounded bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    >
                      + স্বাগতম বাৰ্তা
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPhrase('বিলিঙৰ বাবে সামগ্ৰী নিৰ্বাচন কৰক।')}
                      className="px-2 py-0.5 rounded bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    >
                      + বিলিং সহায়
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPhrase('গ্ৰাহকৰ বাকী ধন পৰিশোধৰ লিংক পঠিয়াওক।')}
                      className="px-2 py-0.5 rounded bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                    >
                      + বাকী ধন অনুৰোধ
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-1 rounded bg-[#161C23] hover:bg-[#26313B] border border-[#26313B] text-[11px] text-[#A8B5C2] hover:text-[#F4F8FB] transition-colors"
                  title="Copy text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#17D5B3]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedLang === 'hi'
                    ? 'हिन्दी में कोई भी वाक्य लिखें या पेस्ट करें जिसे प्राकृतिक आवाज में बोलना है...'
                    : 'Type or paste any Assamese text to synthesize with ultra-realistic human voice...'
                }
                className="w-full bg-[#161C23] border border-[#26313B] focus:border-[#17D5B3] rounded-xl p-3.5 text-sm text-[#F4F8FB] focus:outline-none placeholder-[#A8B5C2]/50 font-medium leading-relaxed"
              />
            </div>

            {/* Voice Control Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Speed selector */}
                <div className="flex items-center gap-2 bg-[#161C23] px-3 py-1.5 rounded-xl border border-[#26313B]">
                  <Sliders className="w-3.5 h-3.5 text-[#17D5B3]" />
                  <span className="text-xs text-[#A8B5C2] font-semibold">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => {
                      const spd = Number(e.target.value);
                      setPlaybackSpeed(spd);
                      if (audioRef.current) audioRef.current.playbackRate = spd;
                    }}
                    aria-label="Audio Speed"
                    className="bg-transparent text-xs font-bold text-[#F4F8FB] focus:outline-none cursor-pointer"
                  >
                    <option value="0.75" className="bg-[#161C23]">0.75x (Slow)</option>
                    <option value="1.0" className="bg-[#161C23]">1.0x (Normal)</option>
                    <option value="1.25" className="bg-[#161C23]">1.25x (Fast)</option>
                    <option value="1.5" className="bg-[#161C23]">1.5x (Super Fast)</option>
                  </select>
                </div>

                <div className="text-xs text-[#A8B5C2] hidden sm:flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#17D5B3] animate-pulse" />
                  <span className="font-mono text-[11px]">{statusMessage}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isLoading || !inputText.trim()}
                  onClick={handleSynthesizeAndPlay}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#17D5B3] to-[#10B981] hover:from-[#15C2A3] hover:to-[#059669] text-[#050608] font-black text-xs shadow-lg shadow-[#17D5B3]/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Voice...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Generate & Play Female Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Audio Waveform & Player Console */}
            {currentBlobUrl && (
              <div className="mt-4 p-4 rounded-xl bg-[#161C23] border border-[#17D5B3]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Animated Equalizer */}
                    <div className="p-2 rounded-lg bg-[#17D5B3]/10 text-[#17D5B3] shrink-0 flex items-center justify-center">
                      {isPlaying ? (
                        <div className="flex items-end gap-0.5 h-5 w-5 justify-center">
                          <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.1s] h-3" />
                          <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.2s] h-5" />
                          <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.3s] h-4" />
                          <span className="w-1 bg-[#17D5B3] rounded-full animate-bounce [animation-delay:0.15s] h-2" />
                        </div>
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#F4F8FB]">
                          {currentPersona.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#17D5B3]/20 text-[#17D5B3] border border-[#17D5B3]/30">
                          24kHz HD PCM Audio
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A8B5C2]">
                        {currentPersona.assameseTitle} • Studio Master
                      </p>
                    </div>
                  </div>

                  {/* Player Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTogglePlayPause}
                      className="p-2.5 rounded-xl bg-[#17D5B3] text-[#050608] hover:bg-[#15C2A3] transition-colors font-bold text-xs flex items-center gap-1.5"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      onClick={handleReplay}
                      className="p-2.5 rounded-xl bg-[#101419] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] border border-[#26313B] transition-colors"
                      title="Replay from start"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-3 py-2.5 rounded-xl bg-[#101419] hover:bg-[#26313B] text-[#17D5B3] hover:text-white border border-[#26313B] transition-colors font-bold text-xs flex items-center gap-1.5"
                      title="Download audio WAV file"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .WAV</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-2 bg-[#101419] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#17D5B3] to-[#FF6F91] transition-all duration-100 rounded-full"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#A8B5C2]">
                    <span>
                      {Math.round((audioProgress / 100) * (duration || 5))}s
                    </span>
                    <span>{Math.round(duration || 5)}s Total</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#161C23] border-t border-[#26313B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#A8B5C2]">
            <Sparkles className="w-4 h-4 text-[#17D5B3]" />
            <span>
              Powered by <strong className="text-[#F4F8FB]">Gemini 3.1 Flash TTS Studio</strong> with Assamese Natural Phonation
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onLaunchTutorialWithVoice && (
              <button
                onClick={() => {
                  stopAudio();
                  onLaunchTutorialWithVoice(0, selectedPersonaId, selectedLang);
                }}
                className="px-4 py-2 rounded-xl bg-[#FF6F91] hover:bg-[#FF557F] text-[#050608] text-xs font-black flex items-center gap-2 shadow-md transition-transform active:scale-95"
              >
                <Video className="w-4 h-4" />
                <span>Launch Video Tutorial Player</span>
              </button>
            )}

            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-[#101419] hover:bg-[#26313B] text-[#A8B5C2] hover:text-[#F4F8FB] border border-[#26313B] text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
