import React, { useEffect, useState } from 'react';
import { Download, Check, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-[11px] font-medium text-sky-300">
        <Check className="w-3.5 h-3.5 text-sky-400" />
        <span>Installed App</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Install Trailnote on your device for airplane mode use"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 border border-sky-500/30 text-xs font-medium text-sky-300 transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span>Install PWA</span>
      </button>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#0E1626] border border-[#1E2D4A] p-5 shadow-2xl text-[#F1F5F9]">
            <div className="flex items-center gap-2 mb-3 text-sky-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-semibold">Install Trailnote on iOS</h3>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Install to your home screen to identify birds deep in the forest without cell reception:
            </p>
            <ol className="text-xs text-[#F1F5F9] space-y-2 mb-5 pl-4 list-decimal marker:text-sky-400">
              <li>Tap the <strong className="text-white">Share</strong> icon at the bottom of Safari.</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
              <li>Launch from your home screen anytime—even in <strong>Airplane Mode</strong>.</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-medium text-sky-200 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
