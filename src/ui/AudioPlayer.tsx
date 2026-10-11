import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioBlob?: Blob | null;
  durationSec?: number;
  label?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBlob,
  durationSec = 2.5,
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.warn('Audio play failed:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (!audioBlob && !audioUrl) {
    return (
      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]/60 italic py-1">
        <Volume2 className="w-3.5 h-3.5" />
        <span>Field clip omitted</span>
      </div>
    );
  }

  const duration = audioRef.current?.duration || durationSec || 1;
  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-[#F1F5F9]">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio recording' : 'Play audio recording'}
        className="w-8 h-8 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 flex items-center justify-center shrink-0 border border-sky-500/30 transition active:scale-95"
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {label && (
          <p className="text-[10px] text-[#94A3B8] truncate mb-1">
            {label}
          </p>
        )}
        <div className="w-full h-1.5 bg-[#141F36] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 transition-[width] duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <span className="text-[11px] font-mono-tabular text-[#94A3B8] shrink-0">
        {currentTime.toFixed(1)}s / {durationSec.toFixed(1)}s
      </span>
    </div>
  );
};
