import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Fingerprint,
  Shield,
  Eye,
  Gavel,
  Crown,
  Users,
  Timer,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';

interface VipMafiaAllianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

type Stage = 'reveal' | 'whisper' | 'vote' | 'verdict';

interface AssignedRole {
  playerId: string;
  name: string;
  avatar: string;
  role: 'mafia' | 'cop' | 'citizen';
  isEliminated?: boolean;
}

export const VipMafiaAllianceModal: React.FC<VipMafiaAllianceModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [stage, setStage] = useState<Stage>('reveal');
  const [assignedRoles, setAssignedRoles] = useState<AssignedRole[]>([]);
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [isHoldingCard, setIsHoldingCard] = useState(false);
  const [whisperTimeLeft, setWhisperTimeLeft] = useState(60);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [executedPlayer, setExecutedPlayer] = useState<AssignedRole | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const players = loadTablePlayers();
      // Ensure at least 4 players
      const roster: TablePlayer[] = players.length >= 4 ? players : [
        { id: '1', name: 'Burak', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#bef264', score: 0 },
        { id: '2', name: 'Cansu', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: '#f751a1', score: 0 },
        { id: '3', name: 'Efe', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', color: '#4cd7f6', score: 0 },
        { id: '4', name: 'Deniz', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', color: '#a855f7', score: 0 }
      ];

      // Shuffle roles: 1 Mafia, 1 Cop, rest Citizens
      const shuffledIndices = [...Array(roster.length).keys()].sort(() => Math.random() - 0.5);
      const mafiaIdx = shuffledIndices[0];
      const copIdx = shuffledIndices[1];

      const roles: AssignedRole[] = roster.map((p, idx) => ({
        playerId: p.id,
        name: p.name,
        avatar: p.avatar,
        role: idx === mafiaIdx ? 'mafia' : idx === copIdx ? 'cop' : 'citizen'
      }));

      setAssignedRoles(roles);
      setActivePlayerIdx(0);
      setIsHoldingCard(false);
      setStage('reveal');
      setWhisperTimeLeft(60);
      setSelectedSuspectId(null);
      setExecutedPlayer(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (stage === 'whisper' && whisperTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setWhisperTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            soundEngine.playBuzzer();
            setStage('vote');
            onShowToast('⏳ Fısıltı süresi doldu! İnfaz oylaması başlıyor.');
            return 0;
          }
          if (prev <= 5) soundEngine.playWheelTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, whisperTimeLeft]);

  if (!isOpen) return null;

  const currentPlayer = assignedRoles[activePlayerIdx];

  const handleNextPlayerOrStage = () => {
    soundEngine.playClick();
    setIsHoldingCard(false);
    if (activePlayerIdx < assignedRoles.length - 1) {
      setActivePlayerIdx((prev) => prev + 1);
    } else {
      setStage('whisper');
      setWhisperTimeLeft(60);
      soundEngine.playVictory();
      onShowToast('🤫 Tüm roller dağıtıldı! Fısıltı pazarlığı başladı.');
    }
  };

  const handleExecute = () => {
    if (!selectedSuspectId) {
      onShowToast('Lütfen masadan bir şüpheli seçin!');
      return;
    }
    const victim = assignedRoles.find((r) => r.playerId === selectedSuspectId);
    if (!victim) return;

    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    setExecutedPlayer(victim);
    setStage('verdict');

    if (victim.role === 'mafia') {
      soundEngine.playVictory();
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      onShowToast(`🎉 MAFYA YAKALANDI! ${victim.name} haindi! Masumlar kazandı!`);
    } else {
      onShowToast(`💀 MASUM İNFAZ EDİLDİ! ${victim.name} hain değildi!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-red-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-red-400" />
              <span>VIP #4 · MAFYA MASASI</span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-4">
          
          {/* Phase 1: Pass & Play Role Reveal */}
          {stage === 'reveal' && currentPlayer && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentPlayer.avatar}
                    alt={currentPlayer.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-red-500/50"
                  />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-mono">TELEFONU ALAN OYUNCU</span>
                    <h4 className="text-sm font-black text-white">{currentPlayer.name}</h4>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                  {activePlayerIdx + 1} / {assignedRoles.length}
                </span>
              </div>

              {/* Hold-to-reveal biometric pad */}
              <div
                onMouseDown={() => {
                  soundEngine.triggerHaptic('touch');
                  setIsHoldingCard(true);
                }}
                onMouseUp={() => setIsHoldingCard(false)}
                onTouchStart={() => {
                  soundEngine.triggerHaptic('touch');
                  setIsHoldingCard(true);
                }}
                onTouchEnd={() => setIsHoldingCard(false)}
                className={`p-6 sm:p-8 rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer select-none ${
                  isHoldingCard
                    ? currentPlayer.role === 'mafia'
                      ? 'bg-red-950/40 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                      : currentPlayer.role === 'cop'
                      ? 'bg-blue-950/40 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]'
                      : 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
                    : 'bg-[#111827] border-white/20 hover:border-white/40 shadow-xl'
                }`}
              >
                {isHoldingCard ? (
                  <div className="space-y-2 animate-in zoom-in-95 duration-150">
                    <span className="text-4xl">
                      {currentPlayer.role === 'mafia' ? '🗡️' : currentPlayer.role === 'cop' ? '🕵️' : '🛡️'}
                    </span>
                    <h3 className="text-lg font-black uppercase tracking-tight">
                      {currentPlayer.role === 'mafia'
                        ? 'GÖLGE CASUS / HAİN'
                        : currentPlayer.role === 'cop'
                        ? 'GİZLİ POLİS / DEDEKTİF'
                        : 'SİVİL MASUM'}
                    </h3>
                    <p className="text-xs text-gray-300 max-w-xs">
                      {currentPlayer.role === 'mafia'
                        ? 'Masanın arasına sızdın! Masumları birbirine düşür, yakalanma!'
                        : currentPlayer.role === 'cop'
                        ? 'Şüpheli hareketleri gözlemle, masayı doğru haini infaz etmeye yönlendir!'
                        : 'Haini tespit et ve oylamada masumları koru!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Fingerprint className="w-14 h-14 text-red-400 mx-auto animate-pulse" />
                    <h4 className="text-sm font-black text-white">BİYOMETRİK KİMLİK KORUMASI</h4>
                    <p className="text-xs text-gray-400">
                      Rolünü sadece sen görmek için parmağını <b className="text-white">basılı tut</b>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextPlayerOrStage}
                className="w-full py-3.5 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 transition-all"
              >
                {activePlayerIdx < assignedRoles.length - 1
                  ? 'Sıradaki Oyuncuya Ver ➔'
                  : 'Roller Tamamlandı! Pazarlığı Başlat ➔'}
              </button>
            </div>
          )}

          {/* Phase 2: Whisper & Bluffing Timer */}
          {stage === 'whisper' && (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-3xl bg-gradient-to-b from-red-950/20 to-[#111827] border border-red-500/30 space-y-3">
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">AŞAMA 2</span>
                <h3 className="text-base font-black text-white">Gizli Pazarlık & Fısıltı Saati</h3>
                <p className="text-xs text-gray-300">
                  Masada fısıldaşın, ittifaklar kurun veya blöf yapın! Süre bitince infaz oylaması başlayacak.
                </p>

                <div className="text-4xl font-mono font-black text-red-400 py-3">
                  00:{whisperTimeLeft < 10 ? '0' + whisperTimeLeft : whisperTimeLeft}
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setStage('vote');
                  }}
                  className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
                >
                  Erken Oylamaya Geç ➔
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Voting & Execution */}
          {stage === 'vote' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#111827] border border-white/10">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Masa Suçlaması</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Masa kime inanmıyor? İnfaz edilecek şüpheliyi seçin:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {assignedRoles.map((r) => {
                  const isSelected = selectedSuspectId === r.playerId;
                  return (
                    <button
                      key={r.playerId}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedSuspectId(r.playerId);
                      }}
                      className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all active:scale-95 text-left ${
                        isSelected
                          ? 'bg-red-500/20 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                          : 'bg-[#111827] border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-black truncate block">{r.name}</span>
                        <span className="text-[10px] text-gray-400">Şüpheli</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleExecute}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Gavel className="w-4 h-4" />
                <span>Masa Kararını Açıkla & İnfaz Et</span>
              </button>
            </div>
          )}

          {/* Phase 4: Verdict Announcement */}
          {stage === 'verdict' && executedPlayer && (
            <div className="p-5 rounded-3xl bg-gradient-to-b from-[#1c1f2a] to-[#111827] border border-red-500/50 text-center space-y-3">
              <span className="text-4xl">
                {executedPlayer.role === 'mafia' ? '🏆' : '💀'}
              </span>
              <h3 className="text-lg font-black text-white">
                {executedPlayer.name} İnfaz Edildi!
              </h3>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 inline-block px-5">
                <span className="text-xs font-mono text-gray-400">Gerçek Rolü:</span>
                <p className={`text-base font-black mt-0.5 ${
                  executedPlayer.role === 'mafia' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {executedPlayer.role === 'mafia' ? 'HAİN CASUS (MASUMLAR KAZANDI!)' : 'MASUM SİVİL (HATA!)'}
                </p>
              </div>
            </div>
          )}

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setStage('reveal');
              setActivePlayerIdx(0);
              setIsHoldingCard(false);
              setWhisperTimeLeft(60);
              setSelectedSuspectId(null);
              setExecutedPlayer(null);
            }}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yeni Tur Başlat</span>
          </button>
        </div>

      </div>
    </div>
  );
};
