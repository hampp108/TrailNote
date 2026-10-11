import { SPECIES_CATALOG, BirdSpecies } from './speciesDatabase';

export interface AcousticFeatureVector {
  peakFrequencyHz: number;
  spectralCentroidHz: number;
  energyLow: number;    // 300 - 1500 Hz
  energyMidLow: number; // 1500 - 3000 Hz
  energyMidHigh: number;// 3000 - 5500 Hz
  energyHigh: number;   // 5500 - 9000 Hz
  spectralRolloffHz: number;
  spectralFlatness: number;
  rmsAmplitude: number;
}

export interface SpeciesPrediction {
  species: BirdSpecies;
  confidence: number; // 0 to 1 (percentage)
  matchReason: string;
  peakFreqKhz: number;
}

export interface ClassificationResult {
  topPredictions: SpeciesPrediction[];
  dominantFrequencyKhz: number;
  rmsDbfs: number;
  confidenceScore: number;
  isBirdVocalizationDetected: boolean;
  timestamp: number;
}

/**
 * Extracts acoustic features from frequency domain data (FFT bins) and sample rate.
 */
export function extractAcousticFeatures(
  freqData: Uint8Array,
  sampleRate: number = 44100,
  fftSize: number = 2048
): AcousticFeatureVector {
  const binResolution = sampleRate / fftSize;
  const numBins = freqData.length;

  let maxMagnitude = 0;
  let peakBin = 0;
  let totalEnergy = 0;
  let weightedSum = 0;

  let energyLow = 0;
  let energyMidLow = 0;
  let energyMidHigh = 0;
  let energyHigh = 0;

  let geometricMeanAcc = 0;
  let activeBins = 0;

  for (let i = 1; i < numBins; i++) {
    const mag = freqData[i] / 255;
    const freq = i * binResolution;

    totalEnergy += mag * mag;
    weightedSum += freq * mag * mag;

    if (mag > maxMagnitude) {
      maxMagnitude = mag;
      peakBin = i;
    }

    if (freq >= 300 && freq < 1500) energyLow += mag * mag;
    else if (freq >= 1500 && freq < 3000) energyMidLow += mag * mag;
    else if (freq >= 3000 && freq < 5500) energyMidHigh += mag * mag;
    else if (freq >= 5500 && freq < 9000) energyHigh += mag * mag;

    if (mag > 0.001) {
      geometricMeanAcc += Math.log(mag + 1e-6);
      activeBins++;
    }
  }

  const peakFrequencyHz = peakBin * binResolution;
  const spectralCentroidHz = totalEnergy > 0 ? weightedSum / totalEnergy : 0;

  // Spectral rolloff (frequency below which 85% of energy sits)
  let cumulative = 0;
  let spectralRolloffHz = 0;
  const threshold85 = totalEnergy * 0.85;
  for (let i = 1; i < numBins; i++) {
    const mag = freqData[i] / 255;
    cumulative += mag * mag;
    if (cumulative >= threshold85) {
      spectralRolloffHz = i * binResolution;
      break;
    }
  }

  // Spectral flatness: geometric mean / arithmetic mean
  const arithmeticMean = totalEnergy / Math.max(1, numBins);
  const geometricMean = activeBins > 0 ? Math.exp(geometricMeanAcc / activeBins) : 0;
  const spectralFlatness = arithmeticMean > 0 ? Math.min(1, geometricMean / arithmeticMean) : 0;

  const rmsAmplitude = Math.sqrt(totalEnergy / numBins);

  return {
    peakFrequencyHz,
    spectralCentroidHz,
    energyLow,
    energyMidLow,
    energyMidHigh,
    energyHigh,
    spectralRolloffHz,
    spectralFlatness,
    rmsAmplitude,
  };
}

/**
 * On-device Bird classifier.
 * Evaluates spectral acoustic vectors against avian signatures with noise suppression.
 */
export function classifyAcousticSpectrum(
  freqData: Uint8Array,
  sampleRate: number = 44100,
  fftSize: number = 2048,
  minDecibels: number = -65
): ClassificationResult {
  const features = extractAcousticFeatures(freqData, sampleRate, fftSize);
  const peakKhz = features.peakFrequencyHz / 1000;
  const totalBandsEnergy =
    features.energyLow + features.energyMidLow + features.energyMidHigh + features.energyHigh;

  // Calculate approximate dBFS
  const rmsDbfs = features.rmsAmplitude > 0 ? 20 * Math.log10(features.rmsAmplitude) : -100;
  const isBirdVocalizationDetected = rmsDbfs > minDecibels && peakKhz >= 0.4 && peakKhz <= 9.0;

  // Compute similarity score for each species
  const scores = SPECIES_CATALOG.map((species) => {
    let score = 0;

    // 1. Peak Frequency alignment
    const [minF, maxF] = species.primaryFreqKhz;
    if (peakKhz >= minF && peakKhz <= maxF) {
      score += 0.45;
      const distFromPeak = Math.abs(peakKhz - species.peakFreqKhz);
      const proximity = Math.max(0, 1 - distFromPeak / 1.5);
      score += proximity * 0.25;
    } else {
      const dist = peakKhz < minF ? minF - peakKhz : peakKhz - maxF;
      score += Math.max(0, 0.25 - dist * 0.15);
    }

    // 2. Harmonic Band Energy alignment
    if (totalBandsEnergy > 0) {
      if (species.peakFreqKhz < 1.5) {
        score += (features.energyLow / totalBandsEnergy) * 0.3;
      } else if (species.peakFreqKhz < 3.0) {
        score += (features.energyMidLow / totalBandsEnergy) * 0.3;
      } else if (species.peakFreqKhz < 5.5) {
        score += (features.energyMidHigh / totalBandsEnergy) * 0.3;
      } else {
        score += (features.energyHigh / totalBandsEnergy) * 0.3;
      }
    }

    // 3. Spectral pattern resonance
    if (species.callPattern === 'whistle' && features.spectralFlatness < 0.2) {
      score += 0.1; // Pure tonal whistles have low spectral flatness
    } else if (species.callPattern === 'chatter' && features.spectralFlatness > 0.25) {
      score += 0.1; // Raspy chatters have wider spectrum
    } else if (species.callPattern === 'hoot' && peakKhz < 1.2) {
      score += 0.15;
    }

    // Add tiny deterministic hash based on species ID to prevent exact ties
    const tieBreaker = (species.id.charCodeAt(0) % 5) * 0.005;
    score += tieBreaker;

    return {
      species,
      score: Math.max(0.01, score),
    };
  });

  // Softmax normalization with temperature
  const temperature = 0.35;
  const maxScore = Math.max(...scores.map((s) => s.score));
  const expScores = scores.map((s) => Math.exp((s.score - maxScore) / temperature));
  const expSum = expScores.reduce((acc, v) => acc + v, 0);

  const normalized = scores
    .map((s, idx) => ({
      species: s.species,
      confidence: expScores[idx] / expSum,
      matchReason: `Acoustic match at ${peakKhz.toFixed(1)} kHz · ${s.species.callPattern} cadence`,
      peakFreqKhz: peakKhz,
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const top3 = normalized.slice(0, 3);
  const topConfidence = top3[0]?.confidence || 0;

  return {
    topPredictions: top3,
    dominantFrequencyKhz: peakKhz,
    rmsDbfs,
    confidenceScore: topConfidence,
    isBirdVocalizationDetected,
    timestamp: Date.now(),
  };
}
