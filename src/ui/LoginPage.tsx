import React, { useState } from 'react';
import { useAuth } from '../auth/authContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, signup, loginAsGuest } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailOrCallsign, setEmailOrCallsign] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [callsign, setCallsign] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [homeRegion, setHomeRegion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!emailOrCallsign.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email or call-sign and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(emailOrCallsign, password);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess?.();
    } else {
      setErrorMsg(result.error || 'Failed to sign in.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg('Please provide your name, email, and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup({
      name,
      email: signupEmail,
      callsign: callsign || name.split(' ')[0],
      password: signupPassword,
      homeRegion: homeRegion || 'Temperate Forest',
    });
    setIsSubmitting(false);

    if (result.success) {
      onSuccess?.();
    } else {
      setErrorMsg(result.error || 'Failed to create account.');
    }
  };

  const handleDemoFill = () => {
    setMode('signin');
    setEmailOrCallsign('skoushitha@gmail.com');
    setPassword('trail123');
    setErrorMsg(null);
  };

  const handleGuestEntry = () => {
    loginAsGuest('Trail Walker');
    onSuccess?.();
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-[#F1F5F9] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Subtle ambient radial glow behind hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Hero Emblem */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#121B2F] via-[#0E1626] to-[#070B12] border-2 border-sky-500/40 p-2 shadow-xl shadow-blue-950/50 flex items-center justify-center">
              <img
                src="/public/icon.svg"
                alt="Trailnote Icon"
                className="w-16 h-16 drop-shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {/* Glowing cyan ping ring */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
            </span>
          </div>

          <h1 className="font-species text-3xl font-bold tracking-tight text-[#F1F5F9] mb-1">
            Trailnote
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-xs mx-auto leading-relaxed">
            Offline-first avian sound identification and naturalist field journal.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl bg-[#0E1626] border border-[#1E2D4A] p-6 shadow-2xl shadow-black/80 backdrop-blur-xl">
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#09101D] rounded-xl border border-[#1E2D4A] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                mode === 'signin'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                mode === 'signup'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              New Naturalist
            </button>
          </div>

          {/* Error Message banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                  Email or Naturalist Call-Sign
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={emailOrCallsign}
                    onChange={(e) => setEmailOrCallsign(e.target.value)}
                    placeholder="e.g. skoushitha@gmail.com or RavenWatcher"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-sky-500/70 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                  Field Password / Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-sky-500/70 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9] p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-blue-950/60 active:scale-[0.98]"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Field Journal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 1-Click Demo Fill */}
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-2 rounded-xl bg-[#141F36] hover:bg-[#1C2C4E] border border-[#1E2D4A] text-[11px] font-medium text-sky-300 flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Auto-fill Demo Account (skoushitha@gmail.com)</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jane Goodall"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-sky-500/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="naturalist@trail.org"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-sky-500/70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                    Call Sign
                  </label>
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder="e.g. HawkRanger"
                    className="w-full px-3 py-2 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-sky-500/70"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-sky-500/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#94A3B8] mb-1">
                  Home Biome / Trail Region
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={homeRegion}
                    onChange={(e) => setHomeRegion(e.target.value)}
                    placeholder="e.g. Pacific Northwest Coniferous"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#09101D] border border-[#1E2D4A] text-xs text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-sky-500/70"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-blue-950/60 active:scale-[0.98] mt-2"
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Register Field Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E2D4A]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#94A3B8]">
              <span className="bg-[#0E1626] px-2">or on the trail</span>
            </div>
          </div>

          {/* Guest / Direct Trail Access */}
          <button
            type="button"
            onClick={handleGuestEntry}
            className="w-full py-2.5 rounded-xl bg-[#121B2F] hover:bg-[#18243E] border border-[#1E2D4A] text-xs font-medium text-[#F1F5F9] flex items-center justify-center gap-2 transition"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Continue in Offline Mode (No Account Required)</span>
          </button>
        </div>

        {/* Security / Privacy Seal */}
        <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-[#94A3B8]">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <span>100% On-Device AI · Audio never leaves your hardware</span>
        </div>
      </div>
    </div>
  );
};
