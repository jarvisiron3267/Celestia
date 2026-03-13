'use client';

export const store = {
  get<T>(key: string, defaultVal: T): T {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const v = localStorage.getItem('cel_' + key);
      return v ? JSON.parse(v) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('cel_' + key, JSON.stringify(value));
    } catch { /* quota */ }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('cel_' + key);
  }
};

// Trial management
export function getTrialDaysLeft(): number {
  const start = store.get<number | null>('trial_start', null);
  if (!start) return -1; // no trial started
  const elapsed = Date.now() - start;
  const daysLeft = 7 - Math.floor(elapsed / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
}

export function startTrial(): void {
  if (!store.get<number | null>('trial_start', null)) {
    store.set('trial_start', Date.now());
  }
}

export function isTrialExpired(): boolean {
  const start = store.get<number | null>('trial_start', null);
  if (!start) return false;
  return Date.now() - start > 7 * 24 * 60 * 60 * 1000;
}

export function isPremium(): boolean {
  return store.get('subscription', null) !== null;
}
