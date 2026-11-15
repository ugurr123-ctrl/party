import React from 'react';
import { TabType } from '../types';
import { soundEngine } from '../utils/audio';

interface DockProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'games', label: 'Oyunlar', icon: '🎮' },
  { id: 'finger', label: 'Parmak', icon: '👆' },
  { id: 'wheel', label: 'Çark', icon: '🎡' },
  { id: 'name', label: 'İsim', icon: '👤' },
  { id: 'team', label: 'Takım', icon: '👥' },
  { id: 'plan', label: 'Planla', icon: '📅' }
];

export const Dock: React.FC<DockProps> = ({ activeTab, onTabChange }) => {
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);
  const pillPercent = 100 / TABS.length;

  return (
    <nav className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-md sm:max-w-lg md:max-w-xl pb-safe">
      <div className="dock-container relative rounded-full p-1 sm:p-1.5 flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Sliding Neon Lime Pill Indicator */}
        <div
          className="pill-indicator absolute top-1 sm:top-1.5 left-1 sm:left-1.5 h-[calc(100%-8px)] sm:h-[calc(100%-12px)] rounded-full bg-[#bef264] glow-lime z-10 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            width: `calc(${pillPercent}% - 3px)`,
            transform: `translateX(${activeIndex * 100}%)`
          }}
        />

        {/* Tab Buttons */}
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                onTabChange(tab.id);
              }}
              className="dock-btn relative z-20 flex-1 py-1.5 sm:py-2 flex flex-col items-center justify-center group focus:outline-none transition-transform active:scale-95"
              aria-label={tab.label}
            >
              <span
                className={`dock-icon text-base sm:text-lg transition-colors leading-none mb-0.5 ${
                  isActive ? 'text-black font-black scale-110' : 'text-gray-400 group-hover:text-white'
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`dock-label text-[10px] sm:text-xs tracking-tight transition-colors whitespace-nowrap ${
                  isActive ? 'font-black text-black' : 'font-semibold text-gray-400 group-hover:text-white'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
