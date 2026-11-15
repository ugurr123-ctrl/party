import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  Timer,
  Trophy,
  Vibrate,
  Play,
  CheckCircle2,
  X,
  Sparkles,
  Moon,
  Settings,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { soundEngine, CountdownToneType, HapticIntensity } from '../utils/audio';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onOpenPrivacy?: () => void;
  onReplaySplash?: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onOpenPrivacy,
  onReplaySplash
}) => {
  // SoundEngine states
  const [profile, setProfile] = useState<'party' | 'night' | 'custom'>('party');
  const [volume, setVolume] = useState<number>(Math.round(soundEngine.volume * 100));
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(soundEngine.sfxEnabled);
  const [countdownEnabled, setCountdownEnabled] = useState<boolean>(soundEngine.countdownEnabled);
  const [countdownTone, setCountdownTone] = useState<CountdownToneType>(soundEngine.countdownTone);
  const [fanfareEnabled, setFanfareEnabled] = useState<boolean>(soundEngine.fanfareEnabled);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(soundEngine.hapticsEnabled);
  const [hapticIntensity, setHapticIntensity] = useState<HapticIntensity>(soundEngine.hapticIntensity);

  // Equalizer visualizer test state
  const [isPlayingTestSFX, setIsPlayingTestSFX] = useState(false);
  const [equalizerBars, setEqualizerBars] = useState<number[]>([6, 12, 8, 14, 6]);

  // Preview active tone state
  const [activePreviewTone, setActivePreviewTone] = useState<CountdownToneType | null>(null);

  // Animate audio bars during SFX test
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingTestSFX) {
      interval = setInterval(() => {
        setEqualizerBars([
          Math.floor(Math.random() * 12 + 4),
          Math.floor(Math.random() * 14 + 6),
          Math.floor(Math.random() * 10 + 4),
          Math.floor(Math.random() * 16 + 6),
          Math.floor(Math.random() * 12 + 4)
        ]);
      }, 100);
    } else {
      setEqualizerBars([6, 12, 8, 14, 6]);
    }
    return () => clearInterval(interval);
  }, [isPlayingTestSFX]);

  if (!isOpen) return null;

  // Apply Quick Profiles
  const handleSelectProfile = (selected: 'party' | 'night' | 'custom') => {
    setProfile(selected);
    soundEngine.playClick();

    if (selected === 'party') {
      setVolume(100);
      soundEngine.setVolume(1.0);
      setSfxEnabled(true);
      soundEngine.sfxEnabled = true;
      setCountdownEnabled(true);
      soundEngine.countdownEnabled = true;
      setFanfareEnabled(true);
      soundEngine.fanfareEnabled = true;
      setHapticsEnabled(true);
      soundEngine.hapticsEnabled = true;
      setHapticIntensity('heavy');
      soundEngine.hapticIntensity = 'heavy';
      onShowToast('🎉 Parti Modu: Maksimum ses ve titreşim devrede!');
    } else if (selected === 'night') {
      setVolume(20);
      soundEngine.setVolume(0.2);
      setSfxEnabled(true);
      soundEngine.sfxEnabled = true;
      setCountdownEnabled(true);
      soundEngine.countdownEnabled = true;
      setFanfareEnabled(false);
      soundEngine.fanfareEnabled = false;
      setHapticsEnabled(true);
      soundEngine.hapticsEnabled = true;
      setHapticIntensity('light');
      soundEngine.hapticIntensity = 'light';
      onShowToast('🌙 Sessiz Gece: Düşük ses ve yumuşak titreşim.');
    } else {
      onShowToast('⚙️ Özel ayarlarınızı yapılandırabilirsiniz.');
    }
  };

  // Volume Slider change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol / 100);
    setProfile('custom');
  };

  // Test SFX
  const handleTestSFX = () => {
    if (isPlayingTestSFX) return;
    setIsPlayingTestSFX(true);
    soundEngine.playDiceRoll();

    setTimeout(() => {
      soundEngine.playVictory();
    }, 700);

    setTimeout(() => {
      setIsPlayingTestSFX(false);
    }, 2400);
  };

  // Preview Specific Countdown Tone
  const handlePreviewTone = (tone: CountdownToneType) => {
    setCountdownTone(tone);
    soundEngine.countdownTone = tone;
    setActivePreviewTone(tone);
    setProfile('custom');

    // Play preview
    soundEngine.playCountdown(tone);

    setTimeout(() => {
      setActivePreviewTone(null);
    }, 1200);
  };

  // Full sound test showcase
  const handleFullShowcase = () => {
    soundEngine.playClick();
    onShowToast('🔊 Tüm ses efektleri sırayla test ediliyor...');
    soundEngine.playWheelTick();
    setTimeout(() => soundEngine.playCountdown(countdownTone), 400);
    setTimeout(() => soundEngine.playBuzzer(), 1000);
    setTimeout(() => soundEngine.playVictory(), 1600);
  };

  // Save & Return
  const handleSaveAndReturn = () => {
    soundEngine.sfxEnabled = sfxEnabled;
    soundEngine.countdownEnabled = countdownEnabled;
    soundEngine.countdownTone = countdownTone;
    soundEngine.fanfareEnabled = fanfareEnabled;
    soundEngine.hapticsEnabled = hapticsEnabled;
    soundEngine.hapticIntensity = hapticIntensity;
    soundEngine.setVolume(volume / 100);

    soundEngine.playSuccess();
    onShowToast('Ses ve titreşim ayarları kaydedildi! 🔊');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="audio-haptics-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#121622]/98 border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.85)] rounded-t-[36px] sm:rounded-[36px] overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Top Grab Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Modal Header */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(76,215,246,0.25)]">
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                Ses & Titreşim Ayarları
              </h3>
              <p className="text-xs text-gray-400">
                Oyun deneyimini ortama göre özelleştir
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* 1. Hızlı Profil Seçimi */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">
              HIZLI PROFİL SEÇİMİ
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectProfile('party')}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                  profile === 'party'
                    ? 'bg-pink-500/20 border-[#ec4899] text-pink-300 shadow-[0_0_12px_rgba(247,81,161,0.25)]'
                    : 'bg-[#111827] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>Parti Modu</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProfile('night')}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                  profile === 'night'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(76,215,246,0.25)]'
                    : 'bg-[#111827] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Sessiz Gece</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectProfile('custom')}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-bold text-center flex flex-col items-center gap-1 transition-all ${
                  profile === 'custom'
                    ? 'bg-lime-500/20 border-lime-400 text-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.25)]'
                    : 'bg-[#111827] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-lime-400" />
                <span>Özel Ayar</span>
              </button>
            </div>
          </div>

          {/* 2. Ses Efektleri (SFX) Card with Volume Slider */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    Ses Efektleri (SFX)
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Oyun butonları ve etkileşim sesleri
                  </div>
                </div>
              </div>

              {/* Neon Green Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={sfxEnabled}
                  onChange={(e) => {
                    setSfxEnabled(e.target.checked);
                    soundEngine.sfxEnabled = e.target.checked;
                    setProfile('custom');
                    soundEngine.playClick();
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c6f832] shadow-[0_0_12px_rgba(198,248,50,0.4)]" />
              </label>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-gray-400">Ses Seviyesi</span>
                <span className="text-cyan-400 font-mono">%{volume}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-full bg-white/10 accent-[#bef264] cursor-pointer"
              />
            </div>

            {/* Test SFX Button with Visualizer Audio Bars */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestSFX}
                disabled={!sfxEnabled}
                className="group flex-1 py-2 px-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-between shadow-[0_0_12px_rgba(76,215,246,0.2)] active:scale-95 transition-all disabled:opacity-40"
              >
                <div className="flex items-center gap-2">
                  <Play
                    className={`w-4 h-4 fill-cyan-400 group-hover:scale-110 transition-transform ${
                      isPlayingTestSFX ? 'animate-pulse' : ''
                    }`}
                  />
                  <span>
                    {isPlayingTestSFX ? `Çalınıyor (%${volume})...` : 'Ses Efektlerini Test Et'}
                  </span>
                </div>

                {/* Animated Equalizer Bars */}
                <div className="flex items-end gap-1 h-4 px-1">
                  {equalizerBars.map((height, bIdx) => (
                    <span
                      key={bIdx}
                      className="w-1 rounded-full transition-all duration-150"
                      style={{
                        height: `${height}px`,
                        backgroundColor:
                          bIdx === 1 ? '#bef264' : bIdx === 3 ? '#ec4899' : '#06b6d4'
                      }}
                    />
                  ))}
                </div>
              </button>
            </div>
          </div>

          {/* 3. Geri Sayım & Tik-Tak Efekti Card */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    Geri Sayım & Tik-Tak Efekti
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Beş saniye ve kura sayacı
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={countdownEnabled}
                  onChange={(e) => {
                    setCountdownEnabled(e.target.checked);
                    soundEngine.countdownEnabled = e.target.checked;
                    setProfile('custom');
                    soundEngine.playClick();
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c6f832]" />
              </label>
            </div>

            {/* Tone Selector Options */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'klasik' as CountdownToneType, label: 'Klasik Tik-Tak', sub: '1.0s Ritim' },
                { id: 'kalp' as CountdownToneType, label: 'Kalp Atışı', sub: 'Derin Nabız' },
                { id: 'retro' as CountdownToneType, label: 'Retro Arcade', sub: '8-Bit Bip' }
              ].map((t) => {
                const isSelected = countdownTone === t.id;
                const isTonePlaying = activePreviewTone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handlePreviewTone(t.id)}
                    className={`group relative flex flex-col items-center justify-between p-2 rounded-2xl border transition-all text-center select-none active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500/15 border-2 border-amber-400 text-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.3)]'
                        : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-amber-400">
                        <Play className="w-3 h-3 fill-amber-400" />
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white tracking-tight">
                      {t.label}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-medium mt-0.5">
                      {isTonePlaying ? 'Dinleniyor...' : t.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Kazanma & Fanfar Sesleri Card */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  Kazanma & Fanfar Sesleri
                </div>
                <div className="text-[10px] text-gray-400">
                  Kura neticesi ve zafer kutlaması
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={fanfareEnabled}
                onChange={(e) => {
                  setFanfareEnabled(e.target.checked);
                  soundEngine.fanfareEnabled = e.target.checked;
                  setProfile('custom');
                  soundEngine.playClick();
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c6f832]" />
            </label>
          </div>

          {/* 5. Haptik Dokunmatik Titreşim Card */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    Haptik Dokunmatik Titreşim
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Parmak algılama ve çark dönüş tıkırtısı
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={hapticsEnabled}
                  onChange={(e) => {
                    setHapticsEnabled(e.target.checked);
                    soundEngine.hapticsEnabled = e.target.checked;
                    setProfile('custom');
                    soundEngine.triggerHaptic('tap');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c6f832]" />
              </label>
            </div>

            {/* Haptic Intensity selector */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-gray-400 font-semibold">Titreşim Şiddeti:</span>
              <div className="flex gap-1.5">
                {(['light', 'medium', 'heavy'] as const).map((lvl) => {
                  const isCur = hapticIntensity === lvl;
                  const label = lvl === 'light' ? 'Hafif' : lvl === 'medium' ? 'Dengeli' : 'Güçlü';
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setHapticIntensity(lvl);
                        soundEngine.hapticIntensity = lvl;
                        soundEngine.triggerHaptic('alert');
                        setProfile('custom');
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        isCur
                          ? 'bg-purple-500/20 border border-purple-400 text-purple-300 font-black shadow'
                          : 'bg-black/30 border border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Test All Audio Showcase Button */}
          <button
            type="button"
            onClick={handleFullShowcase}
            className="w-full py-2.5 px-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-gray-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Sesleri Önizle & Test Et</span>
          </button>

          {/* Mağaza & Gizlilik Standartları Butonu */}
          {onOpenPrivacy && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onOpenPrivacy();
              }}
              className="w-full py-2 px-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Google Play & App Store Standartları & Gizlilik</span>
            </button>
          )}

          {/* Açılış İntrosunu Tekrar İzle */}
          {onReplaySplash && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onReplaySplash();
              }}
              className="w-full py-2 px-3 rounded-2xl bg-white/5 border border-white/10 hover:border-lime-400/30 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#bef264]" />
              <span>Açılış İntro Ekranını Yeniden Oynat</span>
            </button>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-white/10 bg-[#0f131d]/95">
          <button
            type="button"
            onClick={handleSaveAndReturn}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#c6f832] via-[#bef264] to-[#c6f832] text-neutral-950 font-black text-sm text-center flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(198,248,50,0.4)] active:scale-95 hover:brightness-105 transition-all glow-lime"
          >
            <CheckCircle2 className="w-5 h-5 fill-neutral-950 text-[#c6f832]" />
            <span>Ayarları Kaydet & Oyuna Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};
