import React, { useState } from 'react';
import { BirdSpecies } from '../model/speciesDatabase';
import { SAMPLE_BIRD_SONGS } from '../audio/sampleBirdAudio';
import { AudioEngine } from '../audio/audioEngine';
import { X, Volume2, Sparkles, MapPin, Compass } from 'lucide-react';

interface SpeciesModalProps {
  species: BirdSpecies | null;
  onClose: () => void;
}

export const SpeciesModal: React.FC<SpeciesModalProps> = ({ species, onClose }) => {
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  if (!species) return null;

  const sampleSong = SAMPLE_BIRD_SONGS[species.id];

  const handlePlaySong = async () => {
    if (!sampleSong) return;
    try {
      setIsPlayingSample(true);
      const engine = new AudioEngine();
      await engine.playSyntheticBirdCall(sampleSong.play);
      setTimeout(() => {
        setIsPlayingSample(false);
      }, sampleSong.syllableDurationSec * 1000 + 400);
    } catch (e) {
      console.warn('Could not play species audio sample:', e);
      setIsPlayingSample(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0E1626] border border-[#1E2D4A] shadow-2xl max-h-[90vh] overflow-y-auto text-[#F1F5F9] p-6 animate-in slide-in-from-bottom-6 duration-300"
      >
        {/* Grab bar for mobile */}
        <div className="w-10 h-1 bg-[#1E2D4A] rounded-full mx-auto -mt-2 mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono-tabular tracking-wider text-sky-400 font-semibold px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/50">
                {species.code}
              </span>
              <span className="text-xs text-[#94A3B8]">
                {species.family}
              </span>
            </div>
            <h2 className="font-species text-2xl font-semibold text-[#F1F5F9] tracking-tight">
              {species.commonName}
            </h2>
            <p className="text-sm italic text-[#94A3B8]">
              {species.scientificName}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close species details"
            className="w-9 h-9 rounded-full bg-[#141F36] hover:bg-[#1E2D4A] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Call Sound Player Banner */}
        <div className="p-4 rounded-2xl bg-[#121B2F] border border-[#1E2D4A] mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 mb-0.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Vocal Cadence</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
              {species.callDescription}
            </p>
          </div>

          {sampleSong && (
            <button
              onClick={handlePlaySong}
              disabled={isPlayingSample}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition ${
                isPlayingSample
                  ? 'bg-sky-400 text-black font-semibold'
                  : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingSample ? 'animate-bounce' : ''}`} />
              <span>{isPlayingSample ? 'Singing...' : 'Play Song'}</span>
            </button>
          )}
        </div>

        {/* Acoustic Profile Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-[#09101D] border border-[#1E2D4A]/80">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block mb-1">
              Frequency Band
            </span>
            <span className="text-sm font-mono-tabular font-semibold text-sky-300">
              {species.primaryFreqKhz[0]} – {species.primaryFreqKhz[1]} kHz
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#09101D] border border-[#1E2D4A]/80">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block mb-1">
              Song Structure
            </span>
            <span className="text-sm font-species capitalize text-cyan-300">
              {species.callPattern} pattern
            </span>
          </div>
        </div>

        {/* Field Notes Sections */}
        <div className="space-y-3.5 text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#121B2F]/80 border border-[#1E2D4A]/80">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Habitat & Range</span>
            </div>
            <p className="text-[#94A3B8]">
              {species.habitat}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121B2F]/80 border border-[#1E2D4A]/80">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Trail Behavior</span>
            </div>
            <p className="text-[#94A3B8]">
              {species.behavior}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
            <div className="flex items-center gap-1.5 text-sky-300 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Naturalist Fun Fact</span>
            </div>
            <p className="text-sky-100/90">
              {species.funFact}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-[#18243E] hover:bg-[#1E2F52] text-xs font-medium text-[#F1F5F9] transition"
        >
          Return to Trail
        </button>
      </div>
    </div>
  );
};
