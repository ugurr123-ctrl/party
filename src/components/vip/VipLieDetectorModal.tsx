import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Flame,
  Volume2,
  VolumeX,
  Crown
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { LIE_DETECTOR_PROMPTS } from '../../data/vipGamesData';

interface VipLieDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipLieDetectorModal: React.FC<VipLieDetectorModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [victimIdx, setVictimIdx] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [frequency, setFrequency] = useState(192);
  const [stressLevel, setStressLevel] = useState(84);
  const [votesTruth, setVotesTruth] = useState(2);
  const [votesLie, setVotesLie] = useState(3);
  const [verdict, setVerdict] = useState<'idle' | 'truth' | 'lie'>('idle');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentPlayers = loadTablePlayers();
      setPlayers(currentPlayers);
      setVictimIdx(Math.floor(Math.random() * (currentPlayers.length || 1)));
      setPromptIdx(Math.floor(Math.random() * LIE_DETECTOR_PROMPTS.length));
      setIsRecording(false);
      setTimeLeft(15);
      setVerdict('idle');
      setVotesTruth(2);
      setVotesLie(3);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRecording(false);
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            return 0;
          }
          // frequency and stress jitter
          setFrequency(Math.floor(180 + Math.random() * 24));
          setStressLevel(Math.floor(75 + Math.random() * 20));
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const currentVictim = players[victimIdx]?.name || 'Selin';
  const currentPrompt = LIE_DETECTOR_PROMPTS[promptIdx];

  const handleToggleRecord = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');
    if (isRecording) {
      setIsRecording(false);
    } else {
      setTimeLeft(15);
      setIsRecording(true);
      setVerdict('idle');
    }
  };

  const handleNextPrompt = () => {
    soundEngine.playClick();
    setPromptIdx((prev) => (prev + 1) % LIE_DETECTOR_PROMPTS.length);
    setVictimIdx((prev) => (prev + 1) % Math.max(1, players.length));
    setTimeLeft(15);
    setIsRecording(false);
    setVerdict('idle');
  };

  const handleVoteTruth = () => {
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    setVotesTruth((v) => v + 1);
    setVerdict('truth');
    onShowToast(`✅ Masa ${currentVictim}'in gerçeği söylediğine karar verdi!`);
  };

  const handleVoteLie = () => {
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    setVotesLie((v) => v + 1);
    setVerdict('lie');
    onShowToast(`🚨 YALAN TESPİT EDİLDİ! ${currentVictim} masaya shot / ceza çekiyor!`);
  };

  const spawnReaction = (emoji: string) => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');
    const newEmoji = { id: Date.now() + Math.random(), emoji };
    setFloatingEmojis((prev) => [...prev.slice(-6), newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Floating Reactions Layer */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingEmojis.map((e) => (
            <div
              key={e.id}
              className="absolute text-4xl animate-bounce"
              style={{
                left: `${30 + Math.random() * 40}%`,
                bottom: '25%',
                animationDuration: '1.2s'
              }}
            >
              {e.emoji}
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>VIP #1 · SESLİ İTİRAF</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-4">
          
          {/* Target Kurban Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500/10 via-[#161a25] to-[#111827] border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-black text-lg">
                🎯
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">SIRADAKİ KURBAN</span>
                <h4 className="text-sm font-black text-white">{currentVictim} İtirafta</h4>
              </div>
            </div>
            <button
              onClick={handleNextPrompt}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-bold text-gray-300 flex items-center gap-1 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Değiştir</span>
            </button>
          </div>

          {/* Biometric Sensor / Visualizer Box */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>CANLI RADAR</span>
            </div>

            {/* Mic Pulse / Timer Ring */}
            <div className="relative my-2 flex items-center justify-center">
              <div
                className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'border-red-500 shadow-[0_0_28px_rgba(239,68,68,0.5)] bg-red-500/10 animate-pulse'
                    : 'border-cyan-400/40 shadow-[0_0_15px_rgba(76,215,246,0.2)] bg-[#171b26]'
                }`}
              >
                <Mic
                  className={`w-9 h-9 mb-1 transition-transform ${
                    isRecording ? 'text-red-400 scale-110' : 'text-cyan-400'
                  }`}
                />
                <span className="text-xs font-mono font-black">
                  {isRecording ? `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}` : 'DOKUN'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleRecord}
              className={`w-full max-w-xs py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                isRecording
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-[#bef264] text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]'
              }`}
            >
              {isRecording ? '■ Kaydı Durdur' : '● Mikrofonu Aç & İtiraflara Başla'}
            </button>

            {/* Live Metrics */}
            <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-white/5">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center">
                <span className="text-[10px] text-gray-400">Ses Titreşimi</span>
                <span className="text-sm font-mono font-bold text-cyan-400">{frequency} Hz</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center">
                <span className="text-[10px] text-gray-400">Stres Seviyesi</span>
                <span className={`text-sm font-mono font-bold ${stressLevel > 80 ? 'text-red-400' : 'text-amber-400'}`}>
                  %{stressLevel} {stressLevel > 85 ? 'KRİTİK' : 'YÜKSEK'}
                </span>
              </div>
            </div>
          </div>

          {/* Spicy Question Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/30 via-[#171b26] to-[#111827] border border-purple-500/40 relative">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>VIP ŞİFRELİ SORU · GİZLİLİK %100</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              “{currentPrompt}”
            </p>
          </div>

          {/* Table Verdict Voting */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
              Masa Kararı (Oylama)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleVoteTruth}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all active:scale-95 ${
                  verdict === 'truth'
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                    : 'bg-[#111827] border-white/10 hover:border-emerald-500/40 text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">GERÇEK DEDİ</span>
                <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                  Masa İkna Oldu ({votesTruth} Oy)
                </span>
              </button>

              <button
                onClick={handleVoteLie}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all active:scale-95 ${
                  verdict === 'lie'
                    ? 'bg-red-500/30 border-red-500 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.4)]'
                    : 'bg-[#111827] border-white/10 hover:border-red-500/40 text-gray-200'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-1">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-xs font-black">YALAN!</span>
                <span className="text-[10px] text-red-400 font-bold mt-0.5">
                  Ceza: Masaya Shot ({votesLie} Oy)
                </span>
              </button>
            </div>
          </div>

          {/* Quick Reactions Reel */}
          <div className="p-2.5 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Masa Tepkileri</span>
            <div className="flex items-center gap-1.5">
              {['😂', '😱', '🔥', '🥃'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => spawnReaction(emoji)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-base active:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleNextPrompt}
            className="flex-1 py-3 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Sıradaki Kurban & Soru ➔</span>
          </button>
        </div>

      </div>
    </div>
  );
};
