import React, { useState } from 'react';
import { Mic, BookOpen, Trophy, Feather, User, LogOut, ChevronDown } from 'lucide-react';
import { OfflineBadge } from './OfflineBadge';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { useAuth } from '../auth/authContext';

export type ActiveTab = 'listen' | 'journal' | 'lifelist';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  journalCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  journalCount,
}) => {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <>
      {/* Desktop & Tablet Top Bar (Adhering to Top Bar Contract: 3 zones separated by gap-8) */}
      <header className="sticky top-0 z-40 bg-[#070B12]/90 backdrop-blur-md border-b border-[#152136] px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark (single text element) */}
          <button
            onClick={() => onChangeTab('listen')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-sm shadow-md shadow-blue-950/50">
              <Feather className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-species text-lg font-bold tracking-tight text-[#F1F5F9] group-hover:text-sky-300 transition">
                Trailnote
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links for Tablet/Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#94A3B8]">
            <button
              onClick={() => onChangeTab('listen')}
              className={`hover:text-[#F1F5F9] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'listen' ? 'text-sky-300 font-semibold' : ''
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
            <button
              onClick={() => onChangeTab('journal')}
              className={`hover:text-[#F1F5F9] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'journal' ? 'text-sky-300 font-semibold' : ''
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Field Journal ({journalCount})</span>
            </button>
            <button
              onClick={() => onChangeTab('lifelist')}
              className={`hover:text-[#F1F5F9] transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'lifelist' ? 'text-sky-300 font-semibold' : ''
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Life List</span>
            </button>
          </nav>

          {/* Zone 3: Badges, Install action & Naturalist Profile menu */}
          <div className="flex items-center gap-3 shrink-0">
            <OfflineBadge />
            <PWAInstallPrompt />

            {/* Profile / Naturalist badge */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0E1626] hover:bg-[#141F36] border border-[#1E2D4A] text-xs font-medium text-[#F1F5F9] transition"
                  title="Naturalist Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.callsign.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-[11px] font-mono-tabular text-sky-300 truncate max-w-[90px]">
                    {currentUser.callsign}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0E1626] border border-[#1E2D4A] shadow-2xl p-3 z-50 text-xs text-[#F1F5F9] animate-in fade-in slide-in-from-top-2">
                    <div className="pb-2.5 border-b border-[#1E2D4A]/80 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs">
                          {currentUser.callsign.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#F1F5F9] truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[10px] text-sky-400 font-mono-tabular truncate">
                            @{currentUser.callsign}
                          </p>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#94A3B8] truncate mt-1">
                        Region: {currentUser.homeRegion}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-red-400 hover:bg-red-950/30 text-xs font-medium transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Switch Naturalist</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-First Fixed Bottom Tab Bar */}
      <nav 
        aria-label="Primary mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#070B12]/95 backdrop-blur-lg border-t border-[#152136] pb-safe md:hidden"
      >
        <div className="grid grid-cols-3 items-center h-16 max-w-md mx-auto px-2">
          {/* Tab 1: Listen */}
          <button
            onClick={() => onChangeTab('listen')}
            className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'listen' ? 'text-sky-400' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'listen' ? 'bg-blue-950/80 border border-blue-800/60' : ''}`}>
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">
              Listen
            </span>
          </button>

          {/* Tab 2: Journal */}
          <button
            onClick={() => onChangeTab('journal')}
            className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'journal' ? 'text-sky-400' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition ${activeTab === 'journal' ? 'bg-blue-950/80 border border-blue-800/60' : ''}`}>
              <BookOpen className="w-5 h-5" />
              {journalCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-sky-400 text-black text-[9px] font-bold flex items-center justify-center font-mono-tabular">
                  {journalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">
              Journal
            </span>
          </button>

          {/* Tab 3: Life List */}
          <button
            onClick={() => onChangeTab('lifelist')}
            className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'lifelist' ? 'text-sky-400' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'lifelist' ? 'bg-blue-950/80 border border-blue-800/60' : ''}`}>
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">
              Life List
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
