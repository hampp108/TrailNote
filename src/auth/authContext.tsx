/**
 * On-device Naturalist Authentication & Profile Store for Trailnote.
 * Supports persistent local accounts, offline field credentials, and guest mode.
 * Preserves 100% offline and airplane mode privacy.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NaturalistUser {
  id: string;
  name: string;
  email: string;
  callsign: string;
  homeRegion: string;
  createdAt: number;
  isGuest?: boolean;
}

interface AuthContextType {
  currentUser: NaturalistUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrCallsign: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    name: string;
    email: string;
    callsign: string;
    password: string;
    homeRegion: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (guestName?: string) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'trailnote_active_user';
const USERS_DB_KEY = 'trailnote_registered_users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default seed user for quick access
const DEFAULT_DEMO_USER: NaturalistUser = {
  id: 'user-naturalist-1',
  name: 'Skoushitha Trail Walker',
  email: 'skoushitha@gmail.com',
  callsign: 'RavenWatcher',
  homeRegion: 'Pacific Northwest Canopy',
  createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  isGuest: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<NaturalistUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there is an active session
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      }
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStoredUsers = (): Array<NaturalistUser & { passwordHash: string }> => {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY);
      if (!raw) return [{ ...DEFAULT_DEMO_USER, passwordHash: 'trail123' }];
      return JSON.parse(raw);
    } catch {
      return [{ ...DEFAULT_DEMO_USER, passwordHash: 'trail123' }];
    }
  };

  const login = async (
    emailOrCallsign: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmed = emailOrCallsign.trim().toLowerCase();
    const users = getStoredUsers();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        u.callsign.toLowerCase() === trimmed
    );

    if (!user) {
      return { success: false, error: 'No naturalist account found with that email or call sign.' };
    }

    if (user.passwordHash && user.passwordHash !== password) {
      return { success: false, error: 'Incorrect field password or passcode.' };
    }

    const sessionUser: NaturalistUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      callsign: user.callsign,
      homeRegion: user.homeRegion,
      createdAt: user.createdAt,
      isGuest: false,
    };

    setCurrentUser(sessionUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    return { success: true };
  };

  const signup = async (userData: {
    name: string;
    email: string;
    callsign: string;
    password: string;
    homeRegion: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!userData.name.trim() || !userData.email.trim() || !userData.password.trim()) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const users = getStoredUsers();
    const exists = users.some(
      (u) =>
        u.email.toLowerCase() === userData.email.trim().toLowerCase() ||
        u.callsign.toLowerCase() === userData.callsign.trim().toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'An account with this email or call sign already exists.' };
    }

    const newUser: NaturalistUser & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim(),
      callsign: userData.callsign.trim() || userData.name.split(' ')[0],
      homeRegion: userData.homeRegion.trim() || 'Temperate Woodland',
      createdAt: Date.now(),
      passwordHash: userData.password,
      isGuest: false,
    };

    users.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

    const { passwordHash: _, ...sessionUser } = newUser;
    setCurrentUser(sessionUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    return { success: true };
  };

  const loginAsGuest = (guestName: string = 'Field Naturalist') => {
    const guestUser: NaturalistUser = {
      id: `guest-${Date.now()}`,
      name: guestName,
      email: 'offline@trailnote.local',
      callsign: 'GuestHiker',
      homeRegion: 'Offline Trail Boundary',
      createdAt: Date.now(),
      isGuest: true,
    };
    setCurrentUser(guestUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        signup,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
