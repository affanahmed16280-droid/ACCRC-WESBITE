'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { subscribeToEvents } from '@/lib/firestore';
import { getEventStatus, formatCountdown } from '@/lib/utils';
import type { ACCRCEvent } from '@/types';

export function StatusStrip() {
  const [nextEvent, setNextEvent] = useState<ACCRCEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');
  const [statusLabel, setStatusLabel] = useState<string>('');

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToEvents((events) => {
        const now = new Date();
        const futureEvents = events
          .filter(e => e.date.toDate() >= now || getEventStatus(e).status === 'open')
          .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
        
        if (futureEvents.length > 0) {
          setNextEvent(futureEvents[0]);
        } else {
          setNextEvent(null);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!nextEvent) return;

    const updateStatus = () => {
      const statusObj = getEventStatus(nextEvent);
      setStatusLabel(statusObj.label);
      if (statusObj.timeRemaining !== undefined) {
        setCountdown(formatCountdown(statusObj.timeRemaining));
      } else {
        setCountdown('');
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [nextEvent]);

  if (loading) {
    return (
      <div className="w-full bg-secondary border-y border-border py-4">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="h-4 bg-border w-32 rounded"></div>
          <div className="h-4 bg-border w-48 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-secondary border-y border-border py-4">
      <div className="container-content flex flex-col md:flex-row items-center justify-between gap-3">
        {nextEvent ? (
          <>
            <div className="flex items-center gap-3">
              <span className="font-mono text-mono-sm text-text-tertiary uppercase tracking-wider">NEXT EVENT</span>
              <span className="font-bold text-primary">{nextEvent.title}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-mono-sm">
              <Badge variant={statusLabel === 'UPCOMING' ? 'warning' : statusLabel === 'OPEN' ? 'success' : 'neutral'}>
                {statusLabel}
              </Badge>
              {countdown && (
                <span className="text-accent min-w-[120px] text-right">
                  T-MINUS {countdown}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="w-full text-center font-mono text-mono-sm text-text-tertiary tracking-widest">
            NO UPCOMING EVENTS
          </div>
        )}
      </div>
    </div>
  );
}
