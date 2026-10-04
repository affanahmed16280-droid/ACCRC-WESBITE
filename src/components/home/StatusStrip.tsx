'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { subscribeToEvents } from '@/lib/firestore';
import { getEventStatus, formatCountdown } from '@/lib/utils';
import type { FirestoreEvent } from '@/lib/firestore';

export function StatusStrip() {
  const [nextEvent, setNextEvent] = useState<FirestoreEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');
  const [statusLabel, setStatusLabel] = useState<string>('');

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = subscribeToEvents((events) => {
        const now = new Date();
        const futureEvents = events
          .filter(e => e.date >= now || getEventStatus(e.registrationOpensAt, e.registrationClosesAt).status === 'open')
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
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
      const statusObj = getEventStatus(nextEvent.registrationOpensAt, nextEvent.registrationClosesAt);
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
      <div className="w-full bg-[#ede7da] border-y border-[#cfc9bc] py-4">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="h-4 bg-border w-32 rounded"></div>
          <div className="h-4 bg-border w-48 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#ede7da] border-y border-[#cfc9bc] py-4">
      <div className="container-content flex flex-col md:flex-row items-center justify-between gap-3">
        {nextEvent ? (
          <>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.75rem] text-[#6b6258] uppercase tracking-wider">NEXT EVENT</span>
              <span className="font-bold text-[#141210]">{nextEvent.name}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[0.75rem]">
              <Badge 
                status={statusLabel === 'UPCOMING' ? 'upcoming' : statusLabel === 'REGISTRATION OPEN' ? 'open' : 'closed'} 
                label={statusLabel} 
              />
              {countdown && (
                <span className="text-[#c94030] min-w-[120px] text-right">
                  T-MINUS {countdown}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="w-full text-center font-mono text-[0.75rem] text-[#6b6258] tracking-widest">
            NO UPCOMING EVENTS
          </div>
        )}
      </div>
    </div>
  );
}
