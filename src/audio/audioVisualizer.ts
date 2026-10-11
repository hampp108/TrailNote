/**
 * Canvas renderer for Trailnote audio visualization.
 * Renders smooth natural waveforms, frequency spectrum bands, and avian vocalization meters.
 * Uses black-blue palette: #070B12 canvas, #38BDF8 cyan, #3B82F6 electric blue, #60A5FA ice blue.
 */

export type VisualizerMode = 'waveform' | 'spectrogram';

export class AudioVisualizerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: VisualizerMode = 'waveform';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2D context from canvas');
    this.ctx = context;
  }

  public setMode(mode: VisualizerMode) {
    this.mode = mode;
  }

  public getMode(): VisualizerMode {
    return this.mode;
  }

  public clear() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Draw peaceful idle ambient line in subtle navy
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#1E2D4A';
    this.ctx.lineWidth = 1.5;
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();
  }

  public render(freqData: Uint8Array, timeData: Uint8Array, peakKhz: number = 0, rmsDbfs: number = -60) {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    if (this.mode === 'waveform') {
      this.renderWaveform(timeData, width, height, peakKhz, rmsDbfs);
    } else {
      this.renderSpectrogramBars(freqData, width, height, peakKhz);
    }
  }

  private renderWaveform(
    timeData: Uint8Array,
    width: number,
    height: number,
    peakKhz: number,
    rmsDbfs: number
  ) {
    const ctx = this.ctx;
    const sliceWidth = width / timeData.length;
    const centerY = height / 2;

    // Background grid lines indicating sound pressure
    ctx.strokeStyle = '#141E33';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.moveTo(0, centerY - height * 0.35);
    ctx.lineTo(width, centerY - height * 0.35);
    ctx.moveTo(0, centerY + height * 0.35);
    ctx.lineTo(width, centerY + height * 0.35);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing wave path
    ctx.beginPath();
    ctx.lineWidth = 2.5;

    // Linear gradient for audio wave: cyan to electric blue with icy highlights
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#38BDF8');
    grad.addColorStop(0.5, rmsDbfs > -35 ? '#93C5FD' : '#60A5FA');
    grad.addColorStop(1, '#38BDF8');

    ctx.strokeStyle = grad;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    ctx.shadowBlur = rmsDbfs > -45 ? 14 : 5;

    let x = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 128.0; // [0, 2] -> 1 is center
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw peak frequency indicator if avian audio detected
    if (peakKhz >= 1.5 && peakKhz <= 8.5 && rmsDbfs > -55) {
      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`Peak: ${peakKhz.toFixed(1)} kHz`, 12, 20);
    }
  }

  private renderSpectrogramBars(
    freqData: Uint8Array,
    width: number,
    height: number,
    peakKhz: number
  ) {
    const ctx = this.ctx;
    const barCount = 48;
    const barWidth = (width / barCount) * 0.75;
    const gap = (width / barCount) * 0.25;

    // Focus on avian song range (bins corresponding to ~500 Hz to ~8000 Hz)
    const step = Math.floor((freqData.length * 0.4) / barCount);

    for (let i = 0; i < barCount; i++) {
      const binIdx = Math.min(freqData.length - 1, Math.floor(i * step));
      const value = freqData[binIdx] / 255;
      const barHeight = Math.max(3, value * (height - 24));

      const x = i * (barWidth + gap);
      const y = height - barHeight;

      // Color based on height and frequency region (deep blue to bright cyan)
      const grad = ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, '#1D4ED8');
      grad.addColorStop(0.65, '#38BDF8');
      grad.addColorStop(1, value > 0.7 ? '#E0F2FE' : '#60A5FA');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
      ctx.fill();
    }

    if (peakKhz > 0) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${peakKhz.toFixed(1)} kHz Dominant`, 12, 16);
    }
  }
}
