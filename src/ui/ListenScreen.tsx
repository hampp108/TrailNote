import React, { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../audio/audioEngine';
import { AudioVisualizerRenderer, VisualizerMode } from '../audio/audioVisualizer';
import { SAMPLE_BIRD_SONGS } from '../audio/sampleBirdAudio';
import { classifyAcousticSpectrum, ClassificationResult, SpeciesPrediction } from '../model/birdClassifier';
import { BirdSpecies } from '../model/speciesDatabase';
import { saveSighting, JournalSighting, FieldCoordinates } from '../journal/db';
import { 
  Mic, 
  Activity, 
  Bookmark, 
  Check, 
  MapPin, 
  ChevronRight,
  Radio,
  Sliders,
  Play
} from 'lucide-react';

interface ListenScreenProps {
  onOpenSpeciesModal: (species: BirdSpecies) => void;
  onSightingSaved: () => void;
}

export const ListenScreen: React.FC<ListenScreenProps> = ({
  onOpenSpeciesModal,
  onSightingSaved,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [listeningSource, setListeningSource] = useState<'mic' | 'sample'>('mic');
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('waveform');
  const [latestResult, setLatestResult] = useState<ClassificationResult | null>(null);
  const [bestPrediction, setBestPrediction] = useState<SpeciesPrediction | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [coordinates, setCoordinates] = useState<FieldCoordinates | null>(null);
  const [, setGpsStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [showSimModal, setShowSimModal] = useState(false);
  const [, setActiveSampleId] = useState<string>('american-robin');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerRef = useRef<AudioVisualizerRenderer | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const lastClassifyTimeRef = useRef<number>(0);

  // Setup Canvas Visualizer and Audio Engine
  useEffect(() => {
    if (canvasRef.current) {
      visualizerRef.current = new AudioVisualizerRenderer(canvasRef.current);
      visualizerRef.current.clear();
    }

    const engine = new AudioEngine({
      onFrame: (freqData, timeData, sampleRate) => {
        // Run classification throttled to every 120ms for smooth UI performance
        const now = Date.now();
        if (now - lastClassifyTimeRef.current > 120) {
          lastClassifyTimeRef.current = now;
          const result = classifyAcousticSpectrum(freqData, sampleRate, 2048);
          setLatestResult(result);

          if (result.isBirdVocalizationDetected && result.topPredictions.length > 0) {
            setBestPrediction(result.topPredictions[0]);
          }
        }

        // Render live audio waveform / spectrogram
        if (visualizerRef.current) {
          visualizerRef.current.render(
            freqData, 
            timeData, 
            latestResult?.dominantFrequencyKhz || 0,
            latestResult?.rmsDbfs || -60
          );
        }
      },
      onAudioClipReady: (blob, duration) => {
        setRecordedBlob(blob);
        setRecordedDuration(duration);
      },
      onError: (err) => {
        console.error('Audio engine error:', err);
        setIsListening(false);
      },
    });

    audioEngineRef.current = engine;

    // Check GPS permissions gently in background
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: Number(pos.coords.latitude.toFixed(5)),
            longitude: Number(pos.coords.longitude.toFixed(5)),
            accuracy: Math.round(pos.coords.accuracy),
          });
          setGpsStatus('granted');
        },
        () => setGpsStatus('denied'),
        { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
      );
    }

    return () => {
      engine.stop();
    };
  }, []);

  const handleToggleListening = async () => {
    if (isListening) {
      // Stop listening and finalize
      audioEngineRef.current?.stop();
      setIsListening(false);
      visualizerRef.current?.clear();
    } else {
      // Start listening via microphone
      setIsSaved(false);
      setRecordedBlob(null);
      setListeningSource('mic');
      try {
        await audioEngineRef.current?.startMicrophone();
        setIsListening(true);
      } catch {
        // If mic permission rejected or fails in sandbox, offer immediate simulated trial
        setShowSimModal(true);
      }
    }
  };

  const handlePlaySimulatedSample = async (speciesId: string) => {
    if (!audioEngineRef.current) return;
    const sample = SAMPLE_BIRD_SONGS[speciesId];
    if (!sample) return;

    audioEngineRef.current.stop();
    setIsSaved(false);
    setRecordedBlob(null);
    setListeningSource('sample');
    setActiveSampleId(speciesId);
    setIsListening(true);
    setShowSimModal(false);

    try {
      await audioEngineRef.current.playSyntheticBirdCall(sample.play);
      // Auto-stop after phrase finishes
      setTimeout(() => {
        setIsListening(false);
        visualizerRef.current?.clear();
      }, sample.syllableDurationSec * 1000 + 300);
    } catch (e) {
      console.warn('Simulation failed:', e);
      setIsListening(false);
    }
  };

  const handleSaveSighting = async () => {
    if (!bestPrediction) return;
    setIsSaving(true);

    try {
      const targetSpecies = bestPrediction.species;
      const sighting: JournalSighting = {
        id: `sighting-${Date.now()}`,
        timestamp: Date.now(),
        speciesId: targetSpecies.id,
        commonName: targetSpecies.commonName,
        scientificName: targetSpecies.scientificName,
        confidence: bestPrediction.confidence,
        peakFreqKhz: latestResult?.dominantFrequencyKhz || targetSpecies.peakFreqKhz,
        coordinates: coordinates,
        locationLabel: coordinates ? 'GPS Trail Waypoint' : 'Trail Station',
        audioBlob: recordedBlob,
        audioDurationSec: recordedDuration || 2.5,
        fieldNote: {
          habitat: targetSpecies.habitat,
          behavior: targetSpecies.behavior,
          funFact: targetSpecies.funFact,
        },
        trailNotes: `Detected on trail at ${(latestResult?.dominantFrequencyKhz || targetSpecies.peakFreqKhz).toFixed(1)} kHz vocal pitch.`,
      };

      await saveSighting(sighting);
      setIsSaved(true);
      onSightingSaved();
    } catch (err) {
      console.error('Failed to save sighting:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activePreds = latestResult?.topPredictions || (bestPrediction ? [bestPrediction] : []);

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-7.5rem)] px-4 py-4 max-w-xl mx-auto w-full">
      {/* Top Status & Visualization Bar */}
      <div className="w-full space-y-3">
        {/* Visualizer Frame */}
        <div className="relative w-full h-32 rounded-2xl bg-[#0E1626] border border-[#1E2D4A] overflow-hidden p-2 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-[11px] px-2 text-[#94A3B8] z-10">
            <div className="flex items-center gap-1.5 font-mono-tabular">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-sky-400 animate-pulse' : 'bg-[#1E2D4A]'}`} />
              <span>{isListening ? (listeningSource === 'mic' ? 'Acoustic Sensor Live' : 'Synthesized Input') : 'Sensor Idle'}</span>
            </div>

            {/* Toggle visualizer mode */}
            <div className="flex items-center gap-1 bg-[#141F36] rounded-lg p-0.5 border border-[#1E2D4A]">
              <button
                onClick={() => {
                  setVisualizerMode('waveform');
                  visualizerRef.current?.setMode('waveform');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  visualizerMode === 'waveform' ? 'bg-[#1E2D4A] text-sky-300' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                Waveform
              </button>
              <button
                onClick={() => {
                  setVisualizerMode('spectrogram');
                  visualizerRef.current?.setMode('spectrogram');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  visualizerMode === 'spectrogram' ? 'bg-[#1E2D4A] text-sky-300' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                Spectrum
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={480}
            height={120}
            className="w-full h-20 self-center"
          />

          <div className="flex items-center justify-between text-[10px] px-2 text-[#94A3B8] font-mono-tabular">
            <span>Range: 0.3 – 9.0 kHz</span>
            {latestResult && (
              <span className="text-sky-400">
                {latestResult.rmsDbfs > -65 ? `${latestResult.rmsDbfs.toFixed(0)} dBFS` : 'Ambient quiet'}
              </span>
            )}
          </div>
        </div>

        {/* GPS location pill */}
        <div className="flex items-center justify-between text-xs px-1 text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            {coordinates ? (
              <span className="font-mono-tabular text-[11px]">
                {coordinates.latitude}° N, {coordinates.longitude}° W (±{coordinates.accuracy}m)
              </span>
            ) : (
              <span>Trail coordinate sensor ready</span>
            )}
          </div>

          {/* Quick test call trigger */}
          <button
            onClick={() => setShowSimModal(true)}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition"
          >
            <Sliders className="w-3 h-3" />
            <span>Test Sound</span>
          </button>
        </div>
      </div>

      {/* Primary Listen Button (The Hero Interaction in Black-Blue Palette) */}
      <div className="relative flex flex-col items-center justify-center my-6 select-none">
        {/* Animated outer sound wave ripples when active */}
        {isListening && (
          <>
            <div className="absolute w-56 h-56 rounded-full bg-sky-500/10 animate-ripple pointer-events-none" />
            <div className="absolute w-68 h-68 rounded-full bg-blue-500/5 animate-ripple delay-700 pointer-events-none" />
          </>
        )}

        <button
          onClick={handleToggleListening}
          aria-label={isListening ? 'Stop listening to bird calls' : 'Start listening to bird calls'}
          className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
            isListening
              ? 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-black shadow-sky-500/50 animate-blue-glow'
              : 'bg-gradient-to-br from-[#141F36] via-[#0E1626] to-[#070B12] border-2 border-sky-500/40 text-sky-300 hover:border-sky-400 shadow-blue-950/40'
          }`}
        >
          {isListening ? (
            <>
              <Activity className="w-10 h-10 mb-1 animate-pulse stroke-[2.5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-black">Listening...</span>
              <span className="text-[10px] text-black/80 font-medium mt-0.5">Tap to lock ID</span>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mb-1 text-sky-300">
                <Mic className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-[#F1F5F9]">Tap to Listen</span>
              <span className="text-[10px] text-[#94A3B8] mt-0.5">Hold up to bird call</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-[#94A3B8] mt-4 text-center max-w-xs">
          {isListening 
            ? 'Capturing acoustic audio signatures on-device...'
            : 'Point microphone toward canopy · Neural BirdNET classifier running 100% locally'}
        </p>
      </div>

      {/* Identification & Confidence Section */}
      <div className="w-full space-y-3">
        {activePreds.length > 0 ? (
          <div className="rounded-2xl bg-[#0E1626] border border-[#1E2D4A] p-4 shadow-xl space-y-3">
            {/* Top Match */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1E2D4A]/80">
              <div 
                onClick={() => onOpenSpeciesModal(activePreds[0].species)}
                className="cursor-pointer group flex-1"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-800/50 text-sky-300">
                    {activePreds[0].species.code}
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    Top Match
                  </span>
                </div>
                <h3 className="font-species text-xl font-semibold text-[#F1F5F9] group-hover:text-sky-300 transition flex items-center gap-1.5">
                  {activePreds[0].species.commonName}
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition" />
                </h3>
                <p className="text-xs italic text-[#94A3B8]">
                  {activePreds[0].species.scientificName}
                </p>
              </div>

              {/* Confidence Percentage */}
              <div className="text-right shrink-0">
                <span className="text-2xl font-mono-tabular font-bold text-sky-400">
                  {Math.round(activePreds[0].confidence * 100)}%
                </span>
                <span className="block text-[10px] text-[#94A3B8] uppercase tracking-wider">
                  Confidence
                </span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="w-full h-2 bg-[#141F36] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 transition-all duration-300 rounded-full"
                style={{ width: `${Math.round(activePreds[0].confidence * 100)}%` }}
              />
            </div>

            {/* Field Note Snippet */}
            <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
              <span className="text-[#F1F5F9] font-medium">Field Mark:</span> {activePreds[0].species.callDescription}
            </p>

            {/* Runner-up candidates (#2 & #3) */}
            {activePreds.length > 1 && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {activePreds.slice(1, 3).map((pred) => (
                  <button
                    key={pred.species.id}
                    onClick={() => onOpenSpeciesModal(pred.species)}
                    className="p-2.5 rounded-xl bg-[#121B2F] hover:bg-[#18243E] border border-[#1E2D4A] text-left transition"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono-tabular text-sky-400 font-semibold">
                        {Math.round(pred.confidence * 100)}%
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono-tabular">
                        {pred.species.code}
                      </span>
                    </div>
                    <p className="font-species text-xs font-medium text-[#F1F5F9] truncate">
                      {pred.species.commonName}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Save to Journal Action Button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleSaveSighting}
                disabled={isSaving || isSaved}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                  isSaved
                    ? 'bg-blue-950/80 border border-blue-800 text-sky-300'
                    : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-black hover:opacity-95 shadow-lg shadow-blue-950/60'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-sky-400" />
                    <span>Saved to Field Journal</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 fill-current" />
                    <span>{isSaving ? 'Logging...' : 'Save Sighting to Journal'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#0E1626]/80 border border-[#1E2D4A] p-4 text-center">
            <Radio className="w-5 h-5 text-sky-400/80 mx-auto mb-2" />
            <p className="text-xs text-[#F1F5F9] font-medium">
              Ready for Avian Calls
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Press the big glowing button when you hear singing in the trees.
            </p>
          </div>
        )}
      </div>

      {/* Simulated Bird Song Selector Modal (for indoor trial / testing) */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-t-3xl sm:rounded-2xl bg-[#0E1626] border border-[#1E2D4A] p-5 shadow-2xl text-[#F1F5F9] animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sky-400">
                <Sliders className="w-4 h-4" />
                <h3 className="text-sm font-semibold">Test Synthetic Bird Calls</h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-xs text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Select an authentic avian vocalization preset. The internal audio engine synthesizes the biological pitch and runs it through the on-device classifier:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {Object.values(SAMPLE_BIRD_SONGS).map((sample) => (
                <button
                  key={sample.speciesId}
                  onClick={() => handlePlaySimulatedSample(sample.speciesId)}
                  className="w-full p-2.5 rounded-xl bg-[#121B2F] hover:bg-[#18243E] border border-[#1E2D4A] flex items-center justify-between text-left transition"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-species text-xs font-semibold text-[#F1F5F9] truncate">
                      {sample.name}
                    </p>
                    <p className="text-[10px] text-[#94A3B8]">
                      {sample.syllableDurationSec}s phrase
                    </p>
                  </div>
                  <Play className="w-4 h-4 text-sky-400 shrink-0 fill-sky-400/20" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
