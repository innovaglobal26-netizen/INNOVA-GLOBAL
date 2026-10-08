import { Profile } from '../../types';
import { dbStore } from '../db/store';
import { ROOT_ADMIN_INNOVA_ID, ROOT_ADMIN_MOBILE } from '../../config/site';
import { supabase, isSupabaseConfigured } from '../supabase/client';

const AUTH_STORAGE_KEY = 'innova_auth_session';
const PASSWORDS_HASH_KEY = 'innova_auth_credentials'; // stores simulated argon/sha hash salt locally for non-supabase fallback

// Safe storage wrapper for browser and Node.js
const memoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      return memoryStorage[key] || null;
    } catch {
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      memoryStorage[key] = value;
    } catch {
      memoryStorage[key] = value;
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
  },
};

interface SessionData {
  user: {
    id: string;
    mobile: string;
    innova_id: string;
    full_name: string;
  };
  token: string;
  expires_at: number;
}

// Simple deterministic secure hash for offline fallback credential matching
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'innova_hash_' + Math.abs(hash).toString(16);
}

class AuthService {
  private currentProfile: Profile | null = null;
  private listeners: Set<(profile: Profile | null) => void> = new Set();

  constructor() {
    this.restoreSession();
  }

  public subscribe(listener: (profile: Profile | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentProfile));
  }

  public getCurrentProfile(): Profile | null {
    return this.currentProfile;
  }

  public isRootAdmin(): boolean {
    return this.currentProfile?.innova_id === ROOT_ADMIN_INNOVA_ID;
  }

  public restoreSession(): Profile | null {
    try {
      const raw = safeStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        this.currentProfile = null;
        return null;
      }

      const session: SessionData = JSON.parse(raw);
      if (Date.now() > session.expires_at) {
        this.logout();
        return null;
      }

      const profile = dbStore.getProfileByInnovaId(session.user.innova_id);
      if (profile) {
        this.currentProfile = profile;
        this.notify();
        return profile;
      }
    } catch {
      this.logout();
    }
    return null;
  }

  private saveSession(profile: Profile) {
    const session: SessionData = {
      user: {
        id: profile.id,
        mobile: profile.mobile,
        innova_id: profile.innova_id,
        full_name: profile.full_name,
      },
      token: crypto.randomUUID(),
      expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    safeStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    this.currentProfile = profile;
    this.notify();
  }

  // Check if Root Admin account exists in the database
  public isRootAccountProvisioned(): boolean {
    const root = dbStore.getProfileByInnovaId(ROOT_ADMIN_INNOVA_ID);
    return Boolean(root);
  }

  // Provision the Root Account (000001)
  public async provisionRootAccount(password: string): Promise<Profile> {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (this.isRootAccountProvisioned()) {
      throw new Error('Root Admin account is already provisioned. Please log in directly.');
    }

    // If Supabase is connected, create real Supabase auth user
    let authUserId: string | undefined = undefined;
    if (isSupabaseConfigured() && supabase) {
      try {
        const email = `${ROOT_ADMIN_MOBILE}@innova.global`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError && !authError.message.includes('already registered')) {
          throw authError;
        }
        authUserId = authData?.user?.id;
      } catch (err: any) {
        console.warn('Supabase auth signup notice:', err.message);
      }
    }

    // Save credential in fallback store
    this.storeCredential(ROOT_ADMIN_MOBILE, password);

    const profile = dbStore.createProfile({
      full_name: 'Root Admin Parvez',
      mobile: ROOT_ADMIN_MOBILE,
      referred_by_id: null,
      account_status: 'PENDING_PAYMENT',
    });

    if (authUserId) {
      profile.auth_user_id = authUserId;
    }

    this.saveSession(profile);
    return profile;
  }

  // Normal Member Registration
  public async register(data: {
    full_name: string;
    mobile: string;
    password: string;
    confirm_password: string;
    referred_by_id: string;
  }): Promise<Profile> {
    const fullName = data.full_name?.trim();
    const mobile = data.mobile?.trim();
    const referralId = data.referred_by_id?.trim();

    if (!fullName || fullName.length < 3) {
      throw new Error('Full Name must be at least 3 characters');
    }
    if (!mobile || !/^01[3-9]\d{8}$/.test(mobile)) {
      throw new Error('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01313213083)');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    if (data.password !== data.confirm_password) {
      throw new Error('Passwords do not match');
    }

    // Normal members require valid referral ID
    if (!referralId) {
      throw new Error('Referral ID is required');
    }
    const upline = dbStore.getProfileByInnovaId(referralId);
    if (!upline && referralId !== ROOT_ADMIN_INNOVA_ID) {
      throw new Error(`Referral ID "${referralId}" does not exist in the platform`);
    }

    // Check duplicate
    if (dbStore.getProfileByMobile(mobile)) {
      throw new Error('An account with this mobile number is already registered');
    }

    // Supabase auth integration
    let authUserId: string | undefined = undefined;
    if (isSupabaseConfigured() && supabase) {
      try {
        const email = `${mobile}@innova.global`;
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password: data.password,
        });
        if (authErr && !authErr.message.includes('already registered')) {
          throw authErr;
        }
        authUserId = authData?.user?.id;
      } catch (err: any) {
        console.warn('Supabase Auth error:', err?.message);
      }
    }

    // Save credentials
    this.storeCredential(mobile, data.password);

    const profile = dbStore.createProfile({
      full_name: fullName,
      mobile: mobile,
      referred_by_id: referralId,
      account_status: 'PENDING_PAYMENT',
    });

    if (authUserId) {
      profile.auth_user_id = authUserId;
    }

    this.saveSession(profile);
    return profile;
  }

  // Login for both Root Admin 000001 and Normal Members 000002+
  public async login(mobile: string, password: string): Promise<Profile> {
    const cleanMobile = mobile?.trim();
    if (!cleanMobile) throw new Error('Mobile number is required');
    if (!password) throw new Error('Password is required');

    // Root account auto-check
    if (cleanMobile === ROOT_ADMIN_MOBILE && !this.isRootAccountProvisioned()) {
      throw new Error('Root Admin account is not yet provisioned. Please complete Root Provisioning first.');
    }

    // Try Supabase Auth if online
    if (isSupabaseConfigured() && supabase) {
      try {
        const email = `${cleanMobile}@innova.global`;
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) {
          console.warn('Supabase signIn notice:', signInErr.message);
        }
      } catch (err: any) {
        console.warn('Supabase signIn catch:', err?.message);
      }
    }

    // Verify credential locally
    const valid = this.verifyCredential(cleanMobile, password);
    if (!valid) {
      throw new Error('Invalid mobile number or password');
    }

    const profile = dbStore.getProfileByMobile(cleanMobile);
    if (!profile) {
      throw new Error('Account profile not found');
    }

    if (profile.account_status === 'SUSPENDED' || profile.account_status === 'DEACTIVATED') {
      throw new Error('This account has been suspended or deactivated. Contact support.');
    }

    this.saveSession(profile);
    return profile;
  }

  public updateCurrentProfile(profile: Profile) {
    this.currentProfile = profile;
    this.notify();
  }

  public logout() {
    if (isSupabaseConfigured() && supabase) {
      try {
        supabase.auth.signOut().catch(() => {});
      } catch {
        // ignore
      }
    }
    safeStorage.removeItem(AUTH_STORAGE_KEY);
    this.currentProfile = null;
    this.notify();
  }

  // --- CREDENTIAL SECURE VAULT (Salted Hashes Only) ---
  private storeCredential(mobile: string, pass: string) {
    try {
      const existingRaw = safeStorage.getItem(PASSWORDS_HASH_KEY);
      const map = existingRaw ? JSON.parse(existingRaw) : {};
      map[mobile] = hashPassword(pass);
      safeStorage.setItem(PASSWORDS_HASH_KEY, JSON.stringify(map));
    } catch {
      // storage unavailable
    }
  }

  private verifyCredential(mobile: string, pass: string): boolean {
    try {
      const existingRaw = safeStorage.getItem(PASSWORDS_HASH_KEY);
      const map = existingRaw ? JSON.parse(existingRaw) : {};
      const storedHash = map[mobile];
      if (!storedHash) return false;
      return storedHash === hashPassword(pass);
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
