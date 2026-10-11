/**
 * On-device avian acoustic audio synthesizer.
 * Generates biologically modeled song patterns using Web Audio API frequency modulation,
 * dual-syrinx envelopes, and characteristic pitch contours.
 * Works 100% offline, zero network requests.
 */

export interface SampleBirdSong {
  speciesId: string;
  name: string;
  syllableDurationSec: number;
  play: (ctx: AudioContext, destination: AudioNode) => Promise<void>;
}

export const SAMPLE_BIRD_SONGS: Record<string, SampleBirdSong> = {
  'american-robin': {
    speciesId: 'american-robin',
    name: 'American Robin (Caroling phrase)',
    syllableDurationSec: 2.8,
    play: async (ctx, destination) => {
      const now = ctx.currentTime;
      // Robin cheerily carols 3-4 rising & falling syllables
      const phrases = [
        { start: 0.0, dur: 0.35, fStart: 2300, fPeak: 2900, fEnd: 2400 },
        { start: 0.55, dur: 0.4, fStart: 2800, fPeak: 3300, fEnd: 2700 },
        { start: 1.15, dur: 0.35, fStart: 2500, fPeak: 2950, fEnd: 2350 },
        { start: 1.7, dur: 0.45, fStart: 2700, fPeak: 3200, fEnd: 2600 },
      ];

      phrases.forEach(({ start, dur, fStart, fPeak, fEnd }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';

        const t0 = now + start;
        const tMid = t0 + dur * 0.5;
        const t1 = t0 + dur;

        osc.frequency.setValueAtTime(fStart, t0);
        osc.frequency.exponentialRampToValueAtTime(fPeak, tMid);
        osc.frequency.exponentialRampToValueAtTime(fEnd, t1);

        gain.gain.setValueAtTime(0.001, t0);
        gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.05);
        gain.gain.setValueAtTime(0.3, t1 - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t1);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(t0);
        osc.stop(t1);
      });
    },
  },

  'black-capped-chickadee': {
    speciesId: 'black-capped-chickadee',
    name: 'Black-capped Chickadee (Fee-Bee & Chatter)',
    syllableDurationSec: 2.4,
    play: async (ctx, destination) => {
      const now = ctx.currentTime;
      // "Fee" note: high pure whistle ~3800Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(3900, now);
      osc1.frequency.exponentialRampToValueAtTime(3800, now + 0.45);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.4, now + 0.04);
      gain1.gain.setValueAtTime(0.35, now + 0.4);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // "Bee" note: slightly lower ~3300Hz with subtle drop
      const tBee = now + 0.6;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3350, tBee);
      osc2.frequency.exponentialRampToValueAtTime(3200, tBee + 0.5);
      gain2.gain.setValueAtTime(0.001, tBee);
      gain2.gain.exponentialRampToValueAtTime(0.38, tBee + 0.04);
      gain2.gain.setValueAtTime(0.3, tBee + 0.45);
      gain2.gain.exponentialRampToValueAtTime(0.001, tBee + 0.5);
      osc2.connect(gain2);
      gain2.connect(destination);
      osc2.start(tBee);
      osc2.stop(tBee + 0.5);

      // Rapid "chick-a-dee-dee" chatter at end
      const chatterTimes = [1.3, 1.45, 1.6, 1.78, 1.95];
      chatterTimes.forEach((ct, idx) => {
        const oscC = ctx.createOscillator();
        const gainC = ctx.createGain();
        oscC.type = idx < 2 ? 'triangle' : 'sawtooth';
        const f = idx < 2 ? 6500 : 3600;
        oscC.frequency.setValueAtTime(f, now + ct);
        gainC.gain.setValueAtTime(0.001, now + ct);
        gainC.gain.exponentialRampToValueAtTime(0.18, now + ct + 0.015);
        gainC.gain.exponentialRampToValueAtTime(0.001, now + ct + 0.1);
        oscC.connect(gainC);
        gainC.connect(destination);
        oscC.start(now + ct);
        oscC.stop(now + ct + 0.1);
      });
    },
  },

  'song-sparrow': {
    speciesId: 'song-sparrow',
    name: 'Song Sparrow (Intro notes & trill)',
    syllableDurationSec: 2.7,
    play: async (ctx, destination) => {
      const now = ctx.currentTime;
      // 3 crisp sweet intro notes
      const intros = [0.0, 0.35, 0.7];
      intros.forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4200, now + t);
        osc.frequency.exponentialRampToValueAtTime(4500, now + t + 0.15);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.3, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.16);
        osc.connect(gain);
        gain.connect(destination);
        osc.start(now + t);
        osc.stop(now + t + 0.18);
      });

      // Rapid buzz/trill cluster around 4.5kHz - 6.5kHz
      const trillStart = now + 1.1;
      const oscTrill = ctx.createOscillator();
      const gainTrill = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      oscTrill.type = 'triangle';
      oscTrill.frequency.setValueAtTime(4800, trillStart);

      lfo.frequency.setValueAtTime(22, trillStart); // 22 Hz trill rate
      lfoGain.gain.setValueAtTime(1400, trillStart);
      lfo.connect(oscTrill.frequency);

      gainTrill.gain.setValueAtTime(0.001, trillStart);
      gainTrill.gain.exponentialRampToValueAtTime(0.28, trillStart + 0.05);
      gainTrill.gain.setValueAtTime(0.25, trillStart + 0.85);
      gainTrill.gain.exponentialRampToValueAtTime(0.001, trillStart + 1.0);

      oscTrill.connect(gainTrill);
      gainTrill.connect(destination);

      lfo.start(trillStart);
      oscTrill.start(trillStart);
      lfo.stop(trillStart + 1.0);
      oscTrill.stop(trillStart + 1.0);
    },
  },

  'wood-thrush': {
    speciesId: 'wood-thrush',
    name: 'Wood Thrush (Ee-oh-lay flute)',
    syllableDurationSec: 2.6,
    play: async (ctx, destination) => {
      const now = ctx.currentTime;
      // Opening flute phrases with dual-syrinx harmonic warmth
      const notes = [
        { t: 0.0, dur: 0.35, f1: 2200, f2: 3300 },
        { t: 0.45, dur: 0.4, f1: 2800, f2: 4200 },
        { t: 0.95, dur: 0.4, f1: 3400, f2: 5100 },
      ];

      notes.forEach(({ t, dur, f1, f2 }) => {
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        const gain = ctx.createGain();

        oscA.type = 'sine';
        oscB.type = 'sine';
        oscA.frequency.setValueAtTime(f1, now + t);
        oscB.frequency.setValueAtTime(f2, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.25, now + t + 0.04);
        gain.gain.setValueAtTime(0.2, now + t + dur - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

        oscA.connect(gain);
        oscB.connect(gain);
        gain.connect(destination);

        oscA.start(now + t);
        oscB.start(now + t);
        oscA.stop(now + t + dur);
        oscB.stop(now + t + dur);
      });

      // Shimmering harmonic bell-like coda
      const codaT = now + 1.5;
      const codaOsc = ctx.createOscillator();
      const codaGain = ctx.createGain();
      codaOsc.type = 'sine';
      codaOsc.frequency.setValueAtTime(4400, codaT);
      codaOsc.frequency.linearRampToValueAtTime(3200, codaT + 0.6);

      codaGain.gain.setValueAtTime(0.001, codaT);
      codaGain.gain.exponentialRampToValueAtTime(0.2, codaT + 0.05);
      codaGain.gain.exponentialRampToValueAtTime(0.001, codaT + 0.7);

      codaOsc.connect(codaGain);
      codaGain.connect(destination);
      codaOsc.start(codaT);
      codaOsc.stop(codaT + 0.7);
    },
  },

  'northern-cardinal': {
    speciesId: 'northern-cardinal',
    name: 'Northern Cardinal (Clear slurred whistle)',
    syllableDurationSec: 2.5,
    play: async (ctx, destination) => {
      const now = ctx.currentTime;
      // Distinctive downward slurred whistle "cheer-cheer"
      const slurs = [0.0, 0.5, 1.0, 1.5];
      slurs.forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200, now + t);
        osc.frequency.exponentialRampToValueAtTime(2100, now + t + 0.35);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.35, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.38);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(now + t);
        osc.stop(now + t + 0.4);
      });
    },
  },

  'barred-owl': {
    speciesId: 'barred-owl',
    name: 'Barred Owl (Who-cooks-for-you hoot)',
    syllableDurationSec: 3.2,
    play: async (ctx, destination) => {
      const now = ctx.currentTime;
      // Low resonant 8-note cadence
      const hoots = [
        { t: 0.0, dur: 0.2, f: 550 },
        { t: 0.3, dur: 0.2, f: 580 },
        { t: 0.6, dur: 0.22, f: 520 },
        { t: 0.9, dur: 0.35, f: 620 },
        { t: 1.5, dur: 0.2, f: 540 },
        { t: 1.8, dur: 0.2, f: 590 },
        { t: 2.1, dur: 0.22, f: 530 },
        { t: 2.4, dur: 0.55, f: 470 }, // trailing low whoo-all
      ];

      hoots.forEach(({ t, dur, f }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.4, now + t + 0.03);
        gain.gain.setValueAtTime(0.35, now + t + dur - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(now + t);
        osc.stop(now + t + dur);
      });
    },
  },
};
