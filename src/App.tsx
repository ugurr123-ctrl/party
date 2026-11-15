import React, { useState } from 'react';
import { TabType } from './types';
import { soundEngine } from './utils/audio';
import { Header } from './components/Header';
import { Dock } from './components/Dock';
import { GamesTab } from './components/tabs/GamesTab';
import { FingerTab } from './components/tabs/FingerTab';
import { WheelTab } from './components/tabs/WheelTab';
import { NameTab } from './components/tabs/NameTab';
import { TeamTab } from './components/tabs/TeamTab';
import { PlanTab } from './components/tabs/PlanTab';
import { QuickToolsModal } from './components/QuickToolsModal';
import { VIPModal } from './components/VIPModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { CustomDeckModal } from './components/CustomDeckModal';
import { DownloadModal } from './components/DownloadModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { SplashScreen } from './components/SplashScreen';
import { PlayerManagementModal } from './components/PlayerManagementModal';
import { TablePlayer, loadTablePlayers, saveTablePlayers } from './utils/playerManager';
import { vipManager } from './utils/vipManager';

const TAB_TITLES: Record<TabType, string> = {
  games: 'Parti Rafı',
  finger: 'Parmak Seç',
  wheel: 'Karar Çarkı',
  name: 'İsimden Seç',
  team: 'Takım Kur',
  plan: 'Parti Planla'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [isPlayerManagerOpen, setIsPlayerManagerOpen] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(soundEngine.sfxEnabled);
  const [volumePercent, setVolumePercent] = useState<number>(Math.round(soundEngine.volume * 100));
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isCustomDeckOpen, setIsCustomDeckOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState(false);
  const [isVIPModalOpen, setIsVIPModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isVIP, setIsVIP] = useState<boolean>(() => vipManager.getStatus().isVIP);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync VIP status
  React.useEffect(() => {
    const unsub = vipManager.subscribe((st) => setIsVIP(st.isVIP));
    return unsub;
  }, []);

  // Sync players if updated anywhere
  React.useEffect(() => {
    const handleSync = (e: CustomEvent<TablePlayer[]>) => {
      if (e.detail && Array.isArray(e.detail)) {
        setPlayers(e.detail);
      }
    };
    window.addEventListener('table_players_updated' as any, handleSync);
    return () => window.removeEventListener('table_players_updated' as any, handleSync);
  }, []);

  const handleUpdatePlayers = (updated: TablePlayer[]) => {
    setPlayers(updated);
    saveTablePlayers(updated);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const [pendingLaunchGameId, setPendingLaunchGameId] = useState<string | null>(null);

  const handleLaunchGameFromVIP = (gameId: string) => {
    setIsVIPModalOpen(false);
    setActiveTab('games');
    setPendingLaunchGameId(gameId);
  };

  const handleAudioSettingsClose = () => {
    setIsAudioSettingsOpen(false);
    setIsAudioOn(soundEngine.sfxEnabled);
    setVolumePercent(Math.round(soundEngine.volume * 100));
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0e17] bg-grid-pattern text-gray-100 flex flex-col items-center justify-start antialiased selection:bg-[#bef264] selection:text-black overflow-x-hidden">
      {/* Animated Splash / Intro Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Mobile / Tablet Container with Automatic Viewport Adaptation */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl min-h-screen flex flex-col relative px-3 sm:px-6 md:px-8 pt-2 pb-44 sm:pb-48 pb-safe transition-all overflow-x-hidden">
        {/* Header */}
        <Header
          title={TAB_TITLES[activeTab]}
          isAudioOn={isAudioOn}
          volumePercent={volumePercent}
          playersCount={players.length}
          onOpenPlayerManager={() => setIsPlayerManagerOpen(true)}
          onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
          onOpenCustomDeck={() => setIsCustomDeckOpen(true)}
          onOpenDownload={() => setIsDownloadModalOpen(true)}
          onOpenQuickTools={() => setIsQuickToolsOpen(true)}
          onOpenVIP={() => setIsVIPModalOpen(true)}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          isVIP={isVIP}
        />

        {/* Tab Content Display */}
        <main className="flex-1 flex flex-col">
          {activeTab === 'games' && (
            <GamesTab
              onSwitchTab={setActiveTab}
              onShowToast={showToast}
              players={players}
              onOpenPlayerManager={() => setIsPlayerManagerOpen(true)}
              onOpenVIP={() => setIsVIPModalOpen(true)}
              launchGameId={pendingLaunchGameId}
              onClearLaunchGame={() => setPendingLaunchGameId(null)}
            />
          )}
          {activeTab === 'finger' && <FingerTab />}
          {activeTab === 'wheel' && <WheelTab onShowToast={showToast} />}
          {activeTab === 'name' && <NameTab onShowToast={showToast} />}
          {activeTab === 'team' && <TeamTab onShowToast={showToast} />}
          {activeTab === 'plan' && <PlanTab onShowToast={showToast} />}
        </main>

        {/* Generous bottom clearance spacer so floating dock never obstructs bottom content */}
        <div className="h-32 sm:h-36 w-full shrink-0 pointer-events-none" aria-hidden="true" />

        {/* Floating Neon Dock Menu */}
        <Dock activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Modals */}
        <AudioSettingsModal
          isOpen={isAudioSettingsOpen}
          onClose={handleAudioSettingsClose}
          onShowToast={showToast}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          onReplaySplash={() => setShowSplash(true)}
        />

        <CustomDeckModal
          isOpen={isCustomDeckOpen}
          onClose={() => setIsCustomDeckOpen(false)}
          onShowToast={showToast}
        />

        <DownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onShowToast={showToast}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        />

        <PrivacyPolicyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          onShowToast={showToast}
        />

        <QuickToolsModal
          isOpen={isQuickToolsOpen}
          onClose={() => setIsQuickToolsOpen(false)}
          onShowToast={showToast}
        />

        <VIPModal
          isOpen={isVIPModalOpen}
          onClose={() => setIsVIPModalOpen(false)}
          onShowToast={showToast}
          onLaunchGame={handleLaunchGameFromVIP}
        />

        {/* Masa Oyuncuları Yönetim Modalı */}
        <PlayerManagementModal
          isOpen={isPlayerManagerOpen}
          onClose={() => setIsPlayerManagerOpen(false)}
          players={players}
          onUpdatePlayers={handleUpdatePlayers}
          onShowToast={showToast}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#111827]/95 border border-[#bef264] text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl glow-lime pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}

