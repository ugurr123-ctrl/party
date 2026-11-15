import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Gavel,
  Crown,
  HelpCircle,
  Timer,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { SECRET_DETECTIVE_CASES } from '../../data/vipGamesData';

interface VipSecretDetectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipSecretDetectiveModal: React.FC<VipSecretDetectiveModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [detectiveIdx, setDetectiveIdx] = useState(0);
  const [caseIdx, setCaseIdx] = useState(0);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [questionsLeft, setQuestionsLeft] = useState(3);
  const [isSecretRevealed, setIsSecretRevealed] = useState(true);
  const [verdict, setVerdict] = useState<{ executedName: string; isGuilty: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = loadTablePlayers();
      setPlayers(current);
      setDetectiveIdx(0);
      setCaseIdx(Math.floor(Math.random() * SECRET_DETECTIVE_CASES.length));
      setSelectedSuspectId(null);
      setQuestionsLeft(3);
      setVerdict(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const chiefDetective = players[detectiveIdx]?.name || 'Zeynep K.';
  const currentCase = SECRET_DETECTIVE_CASES[caseIdx];
  const suspects = players.filter((_, idx) => idx !== detectiveIdx);

  const handleAskQuestionToken = () => {
    if (questionsLeft <= 0) return;
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');
    setQuestionsLeft((q) => q - 1);
    onShowToast(`🔎 1 Soru Hakkı Kullanıldı! Kalan: ${questionsLeft - 1}`);
  };

  const handleNextCase = () => {
    soundEngine.playClick();
    setCaseIdx((prev) => (prev + 1) % SECRET_DETECTIVE_CASES.length);
    setDetectiveIdx((prev) => (prev + 1) % Math.max(1, players.length));
    setSelectedSuspectId(null);
    setQuestionsLeft(3);
    setVerdict(null);
  };

  const handleConvict = () => {
    if (!selectedSuspectId) {
      onShowToast('Lütfen bir şüpheli seçin!');
      return;
    }
    const accused = players.find((p) => p.id === selectedSuspectId);
    if (!accused) return;

    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');

    // 50% simulated guilt for dramatic play
    const isGuilty = Math.random() > 0.4;
    setVerdict({ executedName: accused.name, isGuilty });

    if (isGuilty) {
      soundEngine.playVictory();
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      onShowToast(`🎉 DAHİYANE TAHMİN! ${accused.name} sırrın gerçek sahibiydi!`);
    } else {
      onShowToast(`❌ YANLIŞ ŞÜPHELİ! ${accused.name} masumdu, gerçek suçlu sıyrıldı!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-blue-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#60a5fa]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-blue-400" />
              <span>VIP #8 · MASA DEDEKTİFİ</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
              Token: {questionsLeft} Hak
            </span>
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
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-3.5">
          
          {/* Chief Detective Banner */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                🔍
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">BAŞ DEDEKTİF</span>
                <h4 className="text-xs sm:text-sm font-black text-white">{chiefDetective}</h4>
              </div>
            </div>
            <button
              onClick={handleAskQuestionToken}
              disabled={questionsLeft <= 0}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
                questionsLeft > 0
                  ? 'bg-blue-500/20 border-blue-400/40 text-blue-300 hover:bg-blue-500/30'
                  : 'bg-gray-800 border-transparent text-gray-500 cursor-not-allowed'
              }`}
            >
              Soru Sor ({questionsLeft})
            </button>
          </div>

          {/* Sealed Confession Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#171b26] to-[#111827] border border-blue-500/40 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-blue-300 uppercase">
              <span>MÜHÜRLÜ İTİRAF</span>
              <span className="text-amber-400">{currentCase.category}</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
              “{currentCase.secret}”
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">Dedektif İpucu:</span>
              <span>{currentCase.clue}</span>
            </div>
          </div>

          {/* Suspects Selection Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
              Masadaki Şüpheliler ({suspects.length})
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {suspects.map((s) => {
                const isSelected = selectedSuspectId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedSuspectId(s.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-white shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                        : 'bg-[#111827] border-white/10 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black truncate block">{s.name}</span>
                      <span className="text-[10px] text-gray-400">Şüpheli</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verdict Box */}
          {verdict && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1c1f2a] to-[#111827] border border-blue-500/50 text-center space-y-1.5 animate-in zoom-in-95 duration-200">
              <span className="text-3xl">{verdict.isGuilty ? '🏆' : '❌'}</span>
              <h4 className="text-sm font-black text-white">
                {verdict.executedName} {verdict.isGuilty ? 'GERÇEK SUÇLUYDU!' : 'MASUMDU!'}
              </h4>
              <p className="text-xs text-gray-300">
                {verdict.isGuilty
                  ? 'Dedektif sırrı başarıyla çözdü ve masadan puanı kaptı!'
                  : 'Gerçek suçlu sinsi bir gülümsemeyle paçayı kurtardı!'}
              </p>
            </div>
          )}

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleNextCase}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yeni Sır</span>
          </button>
          <button
            onClick={handleConvict}
            className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(96,165,250,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Gavel className="w-4 h-4" />
            <span>Suçluyu İnfaz Et ➔</span>
          </button>
        </div>

      </div>
    </div>
  );
};
