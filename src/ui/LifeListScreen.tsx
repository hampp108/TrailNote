import React, { useState } from 'react';
import { SPECIES_CATALOG, BirdSpecies } from '../model/speciesDatabase';
import { JournalSighting } from '../journal/db';
import { Check, Trophy, Search } from 'lucide-react';

interface LifeListScreenProps {
  sightings: JournalSighting[];
  onOpenSpeciesModal: (species: BirdSpecies) => void;
  onNavigateToListen: () => void;
}

export const LifeListScreen: React.FC<LifeListScreenProps> = ({
  sightings,
  onOpenSpeciesModal,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'heard' | 'unheard'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count sightings per species
  const heardSpeciesCounts: Record<string, number> = {};
  sightings.forEach((s) => {
    heardSpeciesCounts[s.speciesId] = (heardSpeciesCounts[s.speciesId] || 0) + 1;
  });

  const totalCatalogSpecies = SPECIES_CATALOG.length;
  const heardCount = Object.keys(heardSpeciesCounts).length;
  const progressPercent = Math.round((heardCount / totalCatalogSpecies) * 100);

  // Filter species list
  const filteredSpecies = SPECIES_CATALOG.filter((species) => {
    const isHeard = !!heardSpeciesCounts[species.id];
    if (filterMode === 'heard' && !isHeard) return false;
    if (filterMode === 'unheard' && isHeard) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        species.commonName.toLowerCase().includes(q) ||
        species.scientificName.toLowerCase().includes(q) ||
        species.code.toLowerCase().includes(q) ||
        species.habitat.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // SVG Progress Ring calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 w-full pb-24">
      {/* Life List Header & Season Progress Ring */}
      <div className="rounded-3xl bg-gradient-to-br from-[#121B2F] via-[#0E1626] to-[#080C14] border border-[#1E2D4A] p-5 shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Seasonal Life List</span>
          </div>
          <h1 className="font-species text-2xl font-bold text-[#F1F5F9] tracking-tight">
            Avian Trail Catalog
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed max-w-sm">
            {heardCount === 0
              ? 'Listen on your next hike to begin filling your personal season field list.'
              : `You have recorded ${heardCount} of ${totalCatalogSpecies} resident and migratory species this season.`}
          </p>
        </div>

        {/* Circular Progress Ring in Black-Blue Palette */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="text-[#141F36]"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className="text-sky-400 transition-all duration-700 ease-out"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="url(#progressGrad)"
              fill="transparent"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono-tabular text-xl font-bold text-[#F1F5F9]">
              {heardCount}/{totalCatalogSpecies}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#94A3B8]">
              Logged
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#0E1626] rounded-xl border border-[#1E2D4A] w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            All Species ({totalCatalogSpecies})
          </button>
          <button
            onClick={() => setFilterMode('heard')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'heard'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            Recorded ({heardCount})
          </button>
          <button
            onClick={() => setFilterMode('unheard')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'unheard'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            Unheard ({totalCatalogSpecies - heardCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0E1626] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/60 focus:outline-none focus:border-sky-500/60"
          />
        </div>
      </div>

      {/* Species Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSpecies.map((species) => {
          const timesHeard = heardSpeciesCounts[species.id] || 0;
          const isHeard = timesHeard > 0;

          return (
            <div
              key={species.id}
              onClick={() => onOpenSpeciesModal(species)}
              className={`group cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                isHeard
                  ? 'bg-[#0E1626] border-sky-500/40 hover:border-sky-400/70 shadow-lg shadow-black/50'
                  : 'bg-[#090F1C] border-[#162136] hover:border-[#223352] opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-[#141F36] border border-[#1E2D4A] text-[#94A3B8]">
                    {species.code}
                  </span>

                  {isHeard ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono-tabular font-semibold text-sky-400">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{timesHeard} {timesHeard === 1 ? 'call' : 'calls'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#94A3B8]/60 font-mono-tabular">
                      Unheard
                    </span>
                  )}
                </div>

                <h3 className="font-species text-base font-semibold text-[#F1F5F9] group-hover:text-sky-300 transition truncate">
                  {species.commonName}
                </h3>
                <p className="text-xs italic text-[#94A3B8] truncate mb-3">
                  {species.scientificName}
                </p>

                <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {species.habitat}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E2D4A]/80 flex items-center justify-between text-[11px]">
                <span className="font-mono-tabular text-sky-300/80">
                  {species.primaryFreqKhz[0]}–{species.primaryFreqKhz[1]} kHz
                </span>
                <span className="text-sky-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                  Field Guide →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
