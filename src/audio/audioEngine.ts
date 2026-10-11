/**
 * Audio Engine for Trailnote.
 * Manages Web Audio API graph, microphone stream, analysis nodes, and sighting clip recording.
 * Purely client-side: audio never leaves the device.
 */

export interface AudioEngineCallbacks {
  onFrame?: (freqData: Uint8Array, timeData: Uint8Array, sampleRate: number) => void;
  onAudioClipReady?: (blob: Blob, durationSec: number) => void;
  onError?: (error: Error) => void;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private synthGainNode: GainNode | null = null;
  private animFrameId: number | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime = 0;
  private isListening = false;
  private callbacks: AudioEngineCallbacks = {};

  constructor(callbacks: AudioEngineCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: AudioEngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public async getAudioContext(): Promise<AudioContext> {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Start listening via device microphone
   */
  public async startMicrophone(): Promise<void> {
    if (this.isListening) return;

    try {
      const ctx = await this.getAudioContext();

      // Request raw naturalist microphone feed without aggressive voice speech compression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
      });

      this.micStream = stream;
      this.sourceNode = ctx.createMediaStreamSource(stream);

      this.setupAnalyserAndGraph(ctx, this.sourceNode);
      this.startClipRecording(stream);

      this.isListening = true;
      this.startAnalysisLoop();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  /**
   * Start listening with an internal synthetic bird call (for simulation / testing)
   */
  public async playSyntheticBirdCall(
    playFn: (ctx: AudioContext, destination: AudioNode) => Promise<void>
  ): Promise<void> {
    const ctx = await this.getAudioContext();

    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.65;
    }

    if (!this.synthGainNode) {
      this.synthGainNode = ctx.createGain();
      this.synthGainNode.gain.setValueAtTime(0.7, ctx.currentTime);
      this.synthGainNode.connect(this.analyser);
      // Connect to speakers so user can hear the test songbird call
      this.analyser.connect(ctx.destination);
    }

    // Start recording synthetic clip via Web Audio destination if MediaStream is supported
    this.startSyntheticClipRecording(ctx, this.synthGainNode);

    this.isListening = true;
    this.startAnalysisLoop();

    await playFn(ctx, this.synthGainNode);
  }

  private setupAnalyserAndGraph(ctx: AudioContext, source: AudioNode) {
    if (!this.analyser) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.72;
      this.analyser.minDecibels = -95;
      this.analyser.maxDecibels = -10;
    }

    source.connect(this.analyser);
    // Note: We do NOT connect microphone directly to speakers to prevent audio acoustic feedback howl outdoors
  }

  private startClipRecording(stream: MediaStream) {
    try {
      this.recordedChunks = [];
      this.recordingStartTime = Date.now();

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const durationSec = (Date.now() - this.recordingStartTime) / 1000;
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.callbacks.onAudioClipReady?.(blob, Math.max(1, durationSec));
      };

      this.mediaRecorder.start(250);
    } catch (e) {
      console.warn('MediaRecorder not available or failed to start:', e);
    }
  }

  private startSyntheticClipRecording(ctx: AudioContext, source: AudioNode) {
    try {
      this.recordedChunks = [];
      this.recordingStartTime = Date.now();

      const dest = ctx.createMediaStreamDestination();
      source.connect(dest);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(dest.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const durationSec = (Date.now() - this.recordingStartTime) / 1000;
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.callbacks.onAudioClipReady?.(blob, Math.max(1, durationSec));
      };

      this.mediaRecorder.start(200);
    } catch (e) {
      console.warn('Synthetic recording destination unsupported:', e);
    }
  }

  private startAnalysisLoop() {
    if (this.animFrameId) return;

    const freqBuffer = new Uint8Array(this.analyser ? this.analyser.frequencyBinCount : 1024);
    const timeBuffer = new Uint8Array(this.analyser ? this.analyser.fftSize : 2048);

    const loop = () => {
      if (!this.isListening || !this.analyser || !this.ctx) {
        this.animFrameId = null;
        return;
      }

      this.analyser.getByteFrequencyData(freqBuffer);
      this.analyser.getByteTimeDomainData(timeBuffer);

      this.callbacks.onFrame?.(freqBuffer, timeBuffer, this.ctx.sampleRate);
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.isListening = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}
