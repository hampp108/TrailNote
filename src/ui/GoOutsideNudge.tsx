import React, { useEffect, useState } from 'react';
import { EyeOff, Volume2, TreePine, X } from 'lucide-react';

interface GoOutsideNudgeProps {
  onEnterPocketMode?: () => void;
}

export const GoOutsideNudge: React.FC<GoOutsideNudgeProps> = ({ onEnterPocketMode }) => {
  const [secondsOnScreen, setSecondsOnScreen] = useState(0);
  const [dismissedUntil, setDismissedUntil] = useState<number>(0);
  const [isPocketMode, setIsPocketMode] = useState(false);

  useEffect(() => {
    // Increment timer every second when document is visible
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSecondsOnScreen((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show after 120 seconds (2 minutes)
  const isPastThreshold = secondsOnScreen >= 120;
  const isSnoozed = Date.now() < dismissedUntil;
  const shouldShowNudge = isPastThreshold && !isSnoozed && !isPocketMode;

  const handleSnooze = () => {
    // Snooze for another 3 minutes
    setDismissedUntil(Date.now() + 180 * 1000);
  };

  const handlePocketMode = () => {
    setIsPocketMode(true);
    onEnterPocketMode?.();
  };

  if (isPocketMode) {
    return (
      <div 
        onClick={() => setIsPocketMode(false)}
        className="fixed inset-0 z-50 bg-[#04060A] flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none transition-colors"
      >
        <div className="w-16 h-16 rounded-full bg-blue-950/60 border border-blue-800/40 flex items-center justify-center mb-6">
          <Volume2 className="w-7 h-7 text-sky-400 animate-pulse" />
        </div>
        <h3 className="font-species text-xl text-[#F1F5F9] mb-2 font-normal">
          Pocket Standby Mode
        </h3>
        <p className="text-xs text-[#94A3B8] max-w-xs leading-relaxed mb-8">
          The microphone is listening quietly in the background. Put your phone in your pocket and let the woods sing.
        </p>
        <p className="text-[11px] text-sky-400/80 uppercase tracking-widest font-mono-tabular">
          Tap anywhere to return to screen
        </p>
      </div>
    );
  }

  if (!shouldShowNudge) {
    return null;
  }

  const minutes = Math.floor(secondsOnScreen / 60);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="rounded-2xl bg-[#0E1626]/95 backdrop-blur-md border border-[#1E2D4A] p-4 shadow-2xl shadow-black/90 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center shrink-0 mt-0.5">
          <TreePine className="w-4 h-4 text-sky-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#F1F5F9] font-medium leading-relaxed">
            You&apos;ve been on screen for {minutes} min. Put the phone away and listen.
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">
            The forest is happening right now around you.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handlePocketMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-[11px] font-medium text-sky-300 border border-sky-500/30 transition"
            >
              <EyeOff className="w-3 h-3" />
              <span>Pocket Standby</span>
            </button>
            <button
              onClick={handleSnooze}
              className="px-2.5 py-1.5 rounded-lg text-[11px] text-[#94A3B8] hover:text-[#F1F5F9] transition"
            >
              I&apos;m listening
            </button>
          </div>
        </div>

        <button
          onClick={handleSnooze}
          className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 -mr-1 -mt-1 transition"
          aria-label="Dismiss nudge"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
