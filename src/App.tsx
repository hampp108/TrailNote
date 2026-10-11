/**
 * Trailnote - Offline Bird Song Identifier & Naturalist Journal
 * Runs 100% on-device in browser via Web Audio & client-side acoustic model.
 * Black-Blue midnight color theme with login authentication gate.
 */

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth/authContext';
import { LoginPage } from './ui/LoginPage';
import { Navigation, ActiveTab } from './ui/Navigation';
import { ListenScreen } from './ui/ListenScreen';
import { JournalScreen } from './ui/JournalScreen';
import { LifeListScreen } from './ui/LifeListScreen';
import { SpeciesModal } from './ui/SpeciesModal';
import { GoOutsideNudge } from './ui/GoOutsideNudge';
import { 
  getAllSightings, 
  seedInitialTrailSightingsIfEmpty, 
  JournalSighting 
} from './journal/db';
import { BirdSpecies } from './model/speciesDatabase';

function MainAppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('listen');
  const [sightings, setSightings] = useState<JournalSighting[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<BirdSpecies | null>(null);

  // Load sightings and seed starter trail records on initial mount
  const refreshSightings = async () => {
    try {
      const data = await getAllSightings();
      setSightings(data);
    } catch (e) {
      console.warn('Error reading sightings from IndexedDB:', e);
    }
  };

  useEffect(() => {
    const initStorage = async () => {
      try {
        await seedInitialTrailSightingsIfEmpty();
        await refreshSightings();
      } catch (err) {
        console.error('Storage initialization failed:', err);
      }
    };

    if (isAuthenticated) {
      initStorage();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B12] flex items-center justify-center text-sky-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono-tabular text-[#94A3B8]">Loading Trailnote...</span>
        </div>
      </div>
    );
  }

  // Show login page first if user is not authenticated
  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => refreshSightings()} />;
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-[#F1F5F9] flex flex-col selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* Top Header & Mobile Bottom Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        journalCount={sightings.length}
      />

      {/* Main Screen Views */}
      <main className="flex-1 flex flex-col justify-start">
        {activeTab === 'listen' && (
          <ListenScreen
            onOpenSpeciesModal={setSelectedSpecies}
            onSightingSaved={refreshSightings}
          />
        )}

        {activeTab === 'journal' && (
          <JournalScreen
            sightings={sightings}
            onRefreshSightings={refreshSightings}
            onOpenSpeciesModal={setSelectedSpecies}
            onNavigateToListen={() => setActiveTab('listen')}
          />
        )}

        {activeTab === 'lifelist' && (
          <LifeListScreen
            sightings={sightings}
            onOpenSpeciesModal={setSelectedSpecies}
            onNavigateToListen={() => setActiveTab('listen')}
          />
        )}
      </main>

      {/* Species Field Guide Detail Modal */}
      <SpeciesModal
        species={selectedSpecies}
        onClose={() => setSelectedSpecies(null)}
      />

      {/* Gentle "Go Outside" Screen Timer Nudge */}
      <GoOutsideNudge />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
