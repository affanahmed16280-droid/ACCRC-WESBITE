'use client';

import { useEffect, useMemo, useState } from 'react';
import { getFacebookEvents, type FacebookEvent } from '@/lib/facebook-events';
import { subscribeToEvents, type FirestoreEvent } from '@/lib/firestore';
import { EventCard, type PublicEvent } from '@/components/events/EventCard';
import { FacebookTimeline } from '@/components/events/FacebookTimeline';
import { motion } from 'framer-motion';

export default function EventsPage() {
  const [clubEvents, setClubEvents] = useState<FirestoreEvent[]>([]);
  const [facebookEvents, setFacebookEvents] = useState<FacebookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToEvents(
      (events) => {
        setClubEvents(events);
        setLoading(false);
      },
      (eventError) => {
        console.error('Failed to load events', eventError);
        setError(true);
        setLoading(false);
      }
    );

    getFacebookEvents()
      .then(setFacebookEvents)
      // Facebook automatic import is optional; the embedded official timeline
      // remains available even when its server-side credentials are not set.
      .catch(() => setFacebookEvents([]));

    return () => unsubscribe();
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const allEvents: PublicEvent[] = [...clubEvents, ...facebookEvents];
    const ordered = allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    return {
      upcoming: ordered.filter((event) => event.date >= now),
      past: ordered.filter((event) => event.date < now).reverse(),
    };
  }, [clubEvents, facebookEvents]);

  return (
    <div className="pt-24 min-h-screen bg-[#f6f0e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="font-mono text-xs tracking-widest text-[#c94030] mb-4 block uppercase">EVENTS</span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#141210]">Competitions, workshops & meetups</h1>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
          <div>
            {loading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-64 bg-[#ede7da] border border-[#cfc9bc] w-full" />
                <div className="h-64 bg-[#ede7da] border border-[#cfc9bc] w-full" />
              </div>
            ) : error ? (
              <p className="text-[#c72c2c]">Events could not be loaded. Please try again later.</p>
            ) : upcoming.length === 0 ? (
              <section className="border border-[#cfc9bc] bg-[#ede7da] p-8 sm:p-12 text-center">
                <p className="font-mono text-xs tracking-widest text-[#c94030] uppercase mb-3">Calendar clear</p>
                <h2 className="text-2xl font-bold text-[#141210] mb-3">No upcoming events right now.</h2>
                <p className="text-[#3a3530]">Stay tuned! New events will appear here as soon as the club publishes them.</p>
              </section>
            ) : (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-[#141210]">Upcoming events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section className="mt-16 opacity-80">
                <h2 className="text-2xl font-bold mb-6 text-[#3a3530]">Past events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {past.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              </section>
            )}
          </div>

          <FacebookTimeline />
        </div>
      </div>
    </div>
  );
}
