import { JournalSighting } from './db';

/**
 * Exports sightings as formatted CSV string and triggers browser download
 */
export function exportJournalToCSV(sightings: JournalSighting[]) {
  const headers = [
    'ID',
    'Timestamp (ISO)',
    'Common Name',
    'Scientific Name',
    'Confidence (%)',
    'Peak Freq (kHz)',
    'Latitude',
    'Longitude',
    'Location Label',
    'Audio Clip Duration (s)',
    'Habitat',
    'Behavior',
    'Fun Fact',
    'Trail Notes',
  ];

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = sightings.map((s) => [
    escapeCSV(s.id),
    escapeCSV(new Date(s.timestamp).toISOString()),
    escapeCSV(s.commonName),
    escapeCSV(s.scientificName),
    escapeCSV(Math.round(s.confidence * 100)),
    escapeCSV(s.peakFreqKhz?.toFixed(2)),
    escapeCSV(s.coordinates?.latitude),
    escapeCSV(s.coordinates?.longitude),
    escapeCSV(s.locationLabel || ''),
    escapeCSV(s.audioDurationSec?.toFixed(1) || ''),
    escapeCSV(s.fieldNote?.habitat || ''),
    escapeCSV(s.fieldNote?.behavior || ''),
    escapeCSV(s.fieldNote?.funFact || ''),
    escapeCSV(s.trailNotes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `trailnote-journal-${formatDateForFilename(new Date())}.csv`);
}

/**
 * Exports sightings as clean JSON format
 */
export function exportJournalToJSON(sightings: JournalSighting[]) {
  // Strip out binary blobs in pure JSON, keep durations and metadata
  const exportable = sightings.map(({ audioBlob, ...rest }) => ({
    ...rest,
    hasAudioRecording: !!audioBlob,
    exportedAt: new Date().toISOString(),
  }));

  const jsonStr = JSON.stringify(exportable, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `trailnote-journal-${formatDateForFilename(new Date())}.json`);
}

function formatDateForFilename(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
