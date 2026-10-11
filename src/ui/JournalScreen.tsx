import React, { useState } from 'react';
import { JournalSighting, deleteSighting } from '../journal/db';
import { exportJournalToCSV, exportJournalToJSON } from '../journal/export';
import { BirdSpecies, findSpeciesById } from '../model/speciesDatabase';
import { AudioPlayer } from './AudioPlayer';
import { 
  Trash2, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MapPin, 
  Feather, 
  FileSpreadsheet,
  FileCode,
  ExternalLink
} from 'lucide-react';

interface JournalScreenProps {
  sightings: JournalSighting[];
  onRefreshSightings: () => void;
  onOpenSpeciesModal: (species: BirdSpecies) => void;
  onNavigateToListen: () => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  sightings,
  onRefreshSightings,
  onOpenSpeciesModal,
  onNavigateToListen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSightings = sightings.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.commonName.toLowerCase().includes(q) ||
      s.scientificName.toLowerCase().includes(q) ||
      (s.locationLabel && s.locationLabel.toLowerCase().includes(q)) ||
      (s.trailNotes && s.trailNotes.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this sighting from your local field journal?')) {
      setDeletingId(id);
      await deleteSighting(id);
      setDeletingId(null);
      onRefreshSightings();
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 w-full pb-24">
      {/* Journal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-species text-2xl font-semibold text-[#F1F5F9] tracking-tight">
            Field Journal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {sightings.length} {sightings.length === 1 ? 'sighting' : 'sightings'} archived locally on this device
          </p>
        </div>

        {/* Export Buttons */}
        {sightings.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => exportJournalToCSV(sightings)}
              title="Export all sightings as CSV spreadsheet"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121B2F] hover:bg-[#18243E] border border-[#1E2D4A] text-xs font-medium text-sky-300 transition active:scale-95 whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => exportJournalToJSON(sightings)}
              title="Export all sightings as structured JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121B2F] hover:bg-[#18243E] border border-[#1E2D4A] text-xs font-medium text-sky-300 transition active:scale-95 whitespace-nowrap"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span>Export JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      {sightings.length > 0 && (
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search journal by species or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0E1626] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/60 focus:outline-none focus:border-sky-500/60 transition"
          />
        </div>
      )}

      {/* Sightings Timeline */}
      {filteredSightings.length > 0 ? (
        <div className="space-y-4">
          {filteredSightings.map((sighting) => {
            const isExpanded = expandedId === sighting.id;
            const fullSpecies = findSpeciesById(sighting.speciesId);

            return (
              <div
                key={sighting.id}
                className="rounded-2xl bg-[#0E1626] border border-[#1E2D4A] p-4 shadow-lg transition hover:border-[#2A3C60]"
              >
                {/* Header row: Species & Confidence */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div
                    onClick={() => fullSpecies && onOpenSpeciesModal(fullSpecies)}
                    className="cursor-pointer group flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-800/50 text-sky-300">
                        {Math.round(sighting.confidence * 100)}% match
                      </span>
                      <span className="text-[11px] font-mono-tabular text-[#94A3B8] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTimestamp(sighting.timestamp)}
                      </span>
                    </div>

                    <h2 className="font-species text-lg font-semibold text-[#F1F5F9] group-hover:text-sky-300 transition truncate">
                      {sighting.commonName}
                    </h2>
                    <p className="text-xs italic text-[#94A3B8] truncate">
                      {sighting.scientificName}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(sighting.id, e)}
                    disabled={deletingId === sighting.id}
                    title="Delete sighting"
                    className="p-2 text-[#94A3B8] hover:text-red-400 rounded-lg hover:bg-[#141F36] transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Coordinates & Location Tag */}
                {sighting.coordinates && (
                  <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-[#94A3B8] mb-3">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>
                      {sighting.coordinates.latitude.toFixed(4)}° N, {sighting.coordinates.longitude.toFixed(4)}° W
                    </span>
                    {sighting.locationLabel && (
                      <span className="text-[#94A3B8]/80 truncate">
                        · {sighting.locationLabel}
                      </span>
                    )}
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${sighting.coordinates.latitude}&mlon=${sighting.coordinates.longitude}#map=16/${sighting.coordinates.latitude}/${sighting.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-sky-400/80 hover:text-sky-300 flex items-center gap-0.5"
                    >
                      <span className="text-[10px]">Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Audio Clip Player */}
                {sighting.audioBlob && (
                  <div className="mb-3">
                    <AudioPlayer
                      audioBlob={sighting.audioBlob}
                      durationSec={sighting.audioDurationSec || 2.5}
                      label={`Trail recording (${(sighting.peakFreqKhz || 3).toFixed(1)} kHz vocalization)`}
                    />
                  </div>
                )}

                {/* Trail notes */}
                {sighting.trailNotes && (
                  <p className="text-xs text-[#94A3B8] bg-[#09101D] p-2.5 rounded-xl border border-[#1E2D4A]/80 mb-3">
                    &ldquo;{sighting.trailNotes}&rdquo;
                  </p>
                )}

                {/* Expand Field Guide Drawer */}
                <div className="pt-1">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sighting.id)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition"
                  >
                    <span>{isExpanded ? 'Hide Field Note' : 'View Naturalist Field Note'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 text-xs text-[#94A3B8] pt-2 border-t border-[#1E2D4A]/80 animate-in fade-in">
                      <div className="p-2.5 rounded-xl bg-[#121B2F] border border-[#1E2D4A]">
                        <span className="text-sky-300 font-semibold block mb-0.5">Habitat:</span>
                        <p>{sighting.fieldNote.habitat}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#121B2F] border border-[#1E2D4A]">
                        <span className="text-sky-300 font-semibold block mb-0.5">Behavior:</span>
                        <p>{sighting.fieldNote.behavior}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-sky-100/90">
                        <span className="text-sky-300 font-semibold block mb-0.5">Fun Fact:</span>
                        <p>{sighting.fieldNote.funFact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0E1626] border border-[#1E2D4A] p-8 text-center my-8">
          <Feather className="w-8 h-8 text-sky-400/60 mx-auto mb-3" />
          <h3 className="font-species text-lg font-medium text-[#F1F5F9] mb-1">
            {searchQuery ? 'No matching sightings' : 'Your field journal is quiet'}
          </h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mb-5 leading-relaxed">
            {searchQuery 
              ? 'Try searching by common name or reset the query.'
              : 'Head out onto the trail, tap the Listen button, and record your first songbird.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onNavigateToListen}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-black text-xs font-semibold hover:opacity-95 transition"
            >
              Start Listening
            </button>
          )}
        </div>
      )}
    </div>
  );
};
