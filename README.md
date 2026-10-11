# Trailnote 🌲🐦

An offline-first, dark-mode Progressive Web App (PWA) that identifies bird songs and calls on the trail using open-source audio AI running 100% on the user's device.

The user taps one big button, holds their phone up to a bird call in the trees, gets a live species ID with a confidence score, and puts the phone away. The screen is designed to be the shortest part of the trail experience.

---

## Why Open Matters

1. **Runs Everywhere Offline (Even in Airplane Mode)**: Deep in old-growth ravines, subalpine passes, or river canyons where cell towers cannot reach, Trailnote functions without interruption. All acoustic feature extraction, frequency analysis, and species classification execute locally in the browser engine.
2. **Keeps Audio 100% Private**: Your microphone feed and recorded audio never touch a remote cloud server. The birds you hear and your trail coordinates stay entirely on your phone.
3. **Zero API Cost & Perpetual Longevity**: No API keys, no monthly token subscriptions, and no reliance on third-party backend servers that can shut down or change pricing.
4. **Model Freedom & Swapability**: Built on open architectures (Web Audio API, TFLite/ONNX-compatible spectrogram embeddings). You can swap acoustic classification weights or tune frequency bands for regional species without rewriting the app.

---

## Features

- **Thumb-Friendly Listen Screen**: A glowing circular listen button with an animated moss/emerald pulse. Real-time canvas waveform and spectrogram frequency visualizer.
- **Top-3 Species Identification**: Instant species matches with confidence percentage bars, scientific taxonomy, vocal cadence descriptions, and peak kHz readouts.
- **100% On-Device Neural Acoustic Classifier**: Evaluates harmonic band energy, spectral centroid, spectral rolloff, and syllable structure locally.
- **Built-in Sound Synthesizer**: Test and explore authentic avian songs (American Robin, Song Sparrow, Black-capped Chickadee, Northern Cardinal, Wood Thrush, Barred Owl) indoors or offline.
- **Field Journal (IndexedDB)**: Persists sightings locally with exact timestamp, GPS coordinates (with accuracy radius), species name, audio recording clips, and naturalist field notes.
- **Audio Clip Playback**: Scrub and listen back to captured bird call audio directly from each journal card.
- **Export Journal**: Instant one-tap download as structured **JSON** or spreadsheet **CSV**.
- **Seasonal Life List**: Visual circular progress ring ("X species logged this season") and an interactive field guide catalog of resident and migratory species.
- **Calm "Go Outside" Nudge**: A gentle reminder after 2 minutes of active screen time encouraging you to put the phone in your pocket and listen to the forest. Includes a one-tap low-power "Pocket Standby" listener.

---

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser (Chrome, Safari, Firefox, Edge) with Web Audio API support

### Installation & Run

```bash
# Install dependencies
npm install

# Start the local development server (port 3000)
npm run dev

# Build production bundle with PWA service worker
npm run build
```

Open `http://localhost:3000` in your browser.

### Installing as a PWA on Your Phone
1. **Chrome / Android**: Tap the in-app **Install PWA** button or open browser menu → **Install app**.
2. **Safari / iOS**: Tap the **Share** button in the bottom Safari toolbar → **Add to Home Screen**.
3. Toggle on **Airplane Mode** to verify complete offline functionality.

---

## Outdoor Demo Script: Taking Trailnote on the Trail

Here is a 5-step field guide for taking Trailnote outside into nature:

1. **At the Trailhead (Airplane Mode Test)**:
   - Turn on Airplane Mode on your phone.
   - Open Trailnote from your home screen.
   - Verify the "100% on-device / Airplane mode" badge in the top right.
2. **When You Hear a Song in the Canopy**:
   - Tap the large glowing circular button.
   - Aim the microphone toward the sound source.
   - Watch the live emerald waveform dance to the bird's vocalization.
3. **Locking the ID**:
   - Tap the button once more or let the phrase conclude.
   - Review the Top-3 species match (e.g., *Black-capped Chickadee, 91% Confidence*).
   - Tap **Save Sighting to Journal** to store your GPS waypoint and audio clip.
4. **Put the Phone Away**:
   - The screen goes dark. Take a deep breath and listen to the rest of the flock.
5. **Evening Campfire Review**:
   - Open the **Field Journal** tab to replay recorded audio clips along your trail timeline.
   - Check your **Life List** progress ring to see how many species you identified today.
   - Tap **Export CSV** to back up your trail notes or import them into GIS maps.

---

## Post Template: How It Went on a Real Walk

Share your trail walk log using this naturalist template:

```markdown
🌲 Trail Walk Log: [Trail Name, e.g., Twin Falls Forest Trail]
📅 Date: [e.g., October 11, 2026]
📍 Conditions: [e.g., 52°F, early morning mist, damp hemlock canopy]

Total Distance: [e.g., 4.2 miles]
Species Identified with @Trailnote: [e.g., 6 species]

Top Highlights:
1. American Robin — 94% confidence (2.8 kHz caroling from top of Douglas fir)
2. Black-capped Chickadee — 89% confidence (curious flock feeding upside down in needles)
3. Wood Thrush — 91% confidence (haunting flute notes echoing in fern ravine)

Best part: Zero cell signal 3 miles past the trailhead, but Trailnote ran 100% locally in airplane mode without a glitch. No lag, no server calls, and my phone stayed in my pocket 95% of the hike.

#Birding #TrailLife #OpenSource #OnDeviceAI #PWA #FieldJournal
```

---

## Architecture & Code Structure

```
├── /src
│   ├── /audio          # Web Audio engine, canvas visualizer, bird song synthesizer
│   │   ├── audioEngine.ts
│   │   ├── audioVisualizer.ts
│   │   └── sampleBirdAudio.ts
│   ├── /model          # Acoustic classifier & avian species database
│   │   ├── birdClassifier.ts
│   │   └── speciesDatabase.ts
│   ├── /journal        # IndexedDB storage and CSV/JSON export
│   │   ├── db.ts
│   │   └── export.ts
│   ├── /ui             # Dark-mode mobile-first UI components
│   │   ├── Navigation.tsx
│   │   ├── ListenScreen.tsx
│   │   ├── JournalScreen.tsx
│   │   ├── LifeListScreen.tsx
│   │   ├── SpeciesModal.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── GoOutsideNudge.tsx
│   │   ├── OfflineBadge.tsx
│   │   └── PWAInstallPrompt.tsx
│   ├── App.tsx         # Main application controller
│   └── index.css       # Deep forest theme (#0B0F0D), Fraunces serif, glowing pulse
```
