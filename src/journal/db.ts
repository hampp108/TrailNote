/**
 * IndexedDB persistence layer for Trailnote field journal.
 * Saves sightings, GPS coordinates, species classifications, and binary audio recordings locally.
 * 100% offline, persistent across device reboots and airplane mode.
 */

export interface FieldCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number;
}

export interface JournalSighting {
  id: string;
  timestamp: number;
  speciesId: string;
  commonName: string;
  scientificName: string;
  confidence: number; // e.g. 0.88 for 88%
  peakFreqKhz: number;
  coordinates?: FieldCoordinates | null;
  locationLabel?: string;
  audioBlob?: Blob | null;
  audioDurationSec?: number;
  fieldNote: {
    habitat: string;
    behavior: string;
    funFact: string;
  };
  trailNotes?: string;
}

const DB_NAME = 'trailnote_db';
const DB_VERSION = 1;
const STORE_NAME = 'sightings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('speciesId', 'speciesId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSighting(sighting: JournalSighting): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(sighting);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSightings(): Promise<JournalSighting[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const req = index.openCursor(null, 'prev'); // Most recent first
    const results: JournalSighting[] = [];

    req.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSighting(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllSightings(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Pre-populate with realistic starter trail records if the database is brand new,
 * so the journal and life list immediately have context.
 */
export async function seedInitialTrailSightingsIfEmpty(): Promise<void> {
  const existing = await getAllSightings();
  if (existing.length > 0) return;

  const now = Date.now();
  const oneHour = 3600 * 1000;
  const oneDay = 24 * oneHour;

  const starterSightings: JournalSighting[] = [
    {
      id: 'seed-1',
      timestamp: now - 2 * oneHour,
      speciesId: 'american-robin',
      commonName: 'American Robin',
      scientificName: 'Turdus migratorius',
      confidence: 0.94,
      peakFreqKhz: 2.8,
      coordinates: { latitude: 47.5342, longitude: -121.7358, accuracy: 6 },
      locationLabel: 'Cedar Creek Switchback',
      audioDurationSec: 3.2,
      fieldNote: {
        habitat: 'Deciduous woodlands, mountain forests, open clearings, and urban parks across North America.',
        behavior: 'Forages on forest floors tilting its head to visually spot earthworms and ground beetles. Often sings from the tallest pine top at dawn.',
        funFact: 'Robins can produce two distinct notes simultaneously because each side of their syrinx can be vibrated independently.',
      },
      trailNotes: 'Clear morning caroling from top of Douglas fir canopy near trailhead.',
    },
    {
      id: 'seed-2',
      timestamp: now - 5 * oneHour,
      speciesId: 'black-capped-chickadee',
      commonName: 'Black-capped Chickadee',
      scientificName: 'Poecile atricapillus',
      confidence: 0.89,
      peakFreqKhz: 3.8,
      coordinates: { latitude: 47.5381, longitude: -121.7412, accuracy: 8 },
      locationLabel: 'Hemlock Moss Hollow',
      audioDurationSec: 2.4,
      fieldNote: {
        habitat: 'Mixed hemlock-deciduous stands, birch groves, and willow thickets.',
        behavior: 'Fiercely acrobatic, frequently hanging upside-down on pine cones and needles while caching thousands of seeds in tree bark for winter.',
        funFact: 'Chickadees add extra "-dee" syllables to their warning call depending on the predator size: smaller raptors receive up to 23 urgent "-dee"s.',
      },
      trailNotes: 'Curious flock feeding upside down in Western hemlock needles.',
    },
    {
      id: 'seed-3',
      timestamp: now - oneDay - 3 * oneHour,
      speciesId: 'wood-thrush',
      commonName: 'Wood Thrush',
      scientificName: 'Hylocichla mustelina',
      confidence: 0.91,
      peakFreqKhz: 3.1,
      coordinates: { latitude: 47.5422, longitude: -121.7489, accuracy: 12 },
      locationLabel: 'Deep Fern Ravine',
      audioDurationSec: 4.1,
      fieldNote: {
        habitat: 'Mature, undisturbed mixed hardwood forests with dense deciduous understories.',
        behavior: 'Shy and solitary; hops deliberately through deep leaf litter, tossing dead leaves aside in search of salamanders and snails.',
        funFact: 'The Wood Thrush is considered by naturalists to possess the most beautiful avian song in North America due to its polyphonic dual-pitch harmony.',
      },
      trailNotes: 'Haunting flutelike ee-oh-lay phrase echoing through damp evening mist.',
    },
  ];

  for (const s of starterSightings) {
    await saveSighting(s);
  }
}
