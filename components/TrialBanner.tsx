'use client';
import { useState, useEffect } from 'react';
import { getTrialDaysLeft, isPremium, isTrialExpired, store } from '@/lib/store';

interface TrialBannerProps {
  onShowPaywall: () => void;
}

export default function TrialBanner({ onShowPaywall }: TrialBannerProps) {
  const [daysLeft, setDaysLeft] = useState(-1);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isPremium()) return;
    const trialStart = store.get<number | null>('trial_start', null);
    if (!trialStart) return;

    const days = getTrialDaysLeft();
    setDaysLeft(days);
    setShow(true);

    if (isTrialExpired()) {
      onShowPaywall();
    }
  }, [onShowPaywall]);

  if (!show || isPremium()) return null;

  const endDate = new Date(store.get<number>('trial_start', Date.now()) + 7 * 24 * 60 * 60 * 1000);
  const dateStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="trial-banner" onClick={onShowPaywall} style={{ cursor: 'pointer' }}>
      ⭐ Your free trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''} ({dateStr})
      {daysLeft <= 2 && <span style={{ display: 'block', fontSize: 11, marginTop: 2, opacity: 0.8 }}>
        Tap to upgrade and keep your cosmic access
      </span>}
    </div>
  );
}
