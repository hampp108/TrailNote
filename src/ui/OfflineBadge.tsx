import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plane } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* 100% on-device badge */}
      <div 
        title="All audio processing and AI classification happen 100% on your device. Zero cloud uploads."
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0E1626] border border-[#1E2D4A] text-[11px] font-medium text-[#94A3B8]"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span className="text-[#F1F5F9]">100% on-device</span>
      </div>

      {/* Airplane mode / Network status */}
      {!isOnline ? (
        <div 
          title="Airplane mode active: Running fully offline with local model & cached storage."
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/50 border border-blue-800/40 text-[11px] font-medium text-sky-300"
        >
          <Plane className="w-3 h-3 text-sky-400 shrink-0" />
          <span>Airplane mode</span>
        </div>
      ) : (
        <div 
          title="Ready for offline use once cached"
          className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] text-[#94A3B8]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400/80"></span>
          <span>Offline ready</span>
        </div>
      )}
    </div>
  );
};
