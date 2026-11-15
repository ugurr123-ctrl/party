import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  BellRing,
  Volume2,
  Flame,
  Crown,
  Vote,
  RotateCcw,
  AlertOctagon,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { HOSTAGE_PHONE_DARES } from '../../data/vipGamesData';

interface VipHostagePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipHostagePhoneModal: React.FC<VipHostagePhoneModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [ownerIdx, setOwnerIdx] = useState(0);
  const [panicLevel, setPanicLevel] = useState(92);
  const [dares, setDares] = useState(HOSTAGE_PHONE_DARES);
  const [selectedDareId, setSelectedDareId] = useState<string | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(90);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = loadTablePlayers();
      setPlayers(current);
      setOwnerIdx(Math.floor(Math.random() * (current.length || 1)));
      setDares(HOSTAGE_PHONE_DARES);
      setSelectedDareId(null);
      setIsAlarmActive(false);
      setCountdownSeconds(90);
      setPanicLevel(92);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && countdownSeconds > 0) {
      timerRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            triggerIncomingBomb();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, countdownSeconds]);

  if (!isOpen) return null;

  const currentOwner = players[ownerIdx]?.name || 'Mert';

  const triggerIncomingBomb = () => {
    setIsAlarmActive(true);
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    onShowToast(`🚨 BİLDİRİM BOMBASI PATLADI! ${currentOwner} telefonunu masaya teslim ediyor!`);
  };

  const handleVoteDare = (id: string) => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');
    setSelectedDareId(id);
    setDares((prev) =>
      prev.map((d) => (d.id === id ? { ...d, votes: d.votes + 1 } : d))
    );
    setPanicLevel((p) => Math.min(100, p + 3));
    onShowToast('🗳️ Masa oyu kaydedildi!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>VIP #7 · REHİN TELEFON</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
              00:{countdownSeconds < 10 ? '0' + countdownSeconds : countdownSeconds}
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
          
          {/* Main Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600/20 via-[#171b26] to-[#111827] border border-red-500/40 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-red-400 uppercase tracking-wider">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>DOKUNMAK KESİNLİKLE YASAK!</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">
              Telefon Masanın Tam Ortasında
            </h3>
            <p className="text-[11px] text-gray-300">
              Rehin Sahibi: <b className="text-amber-400">@{currentOwner.toLowerCase()}_vip</b> · 6 Oyuncu İzliyor
            </p>
          </div>

          {/* Table Panic Gauge Meter */}
          <div className="p-3.5 rounded-2xl bg-[#111827] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Masa Panik & Heyecan Ölçer</span>
              </span>
              <span className="font-mono font-black text-red-400">%{panicLevel} KRİTİK</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                style={{ width: `${panicLevel}%` }}
              />
            </div>
          </div>

          {/* Hostage Simulated Phone Screen with Alarm Pulse */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-[#161a25] to-[#0a0e18] border-2 border-amber-500/40 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-xs font-mono text-gray-400 uppercase">REHİN STATÜSÜ</h4>
              <p className="text-sm font-black text-white mt-0.5">
                {isAlarmActive ? '🚨 GELEN BİLDİRİM DEVREDE!' : 'Gözler Ekranda • Bildirim Bekleniyor'}
              </p>
            </div>

            <button
              onClick={triggerIncomingBomb}
              className="py-2 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>Sahte Bildirim Patlat (Şimdi!)</span>
            </button>
          </div>

          {/* Dares Voting List */}
          <div className="space-y-2">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
              Masa Kararı: Hangi Meydan Okuma Yapılacak?
            </span>
            <div className="space-y-2">
              {dares.map((d) => {
                const isSelected = selectedDareId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleVoteDare(d.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-[#111827] border-white/10 text-gray-200 hover:border-white/20'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black">{d.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                          {d.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{d.desc}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-mono font-black text-amber-400">{d.votes} Oy</span>
                      <span className="text-[10px] text-gray-400 block font-mono">%{d.pct}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setOwnerIdx((prev) => (prev + 1) % Math.max(1, players.length));
              setCountdownSeconds(90);
              setIsAlarmActive(false);
            }}
            className="flex-1 py-3.5 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sıradaki Rehin Telefon ➔</span>
          </button>
        </div>

      </div>
    </div>
  );
};
