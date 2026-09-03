'use client'

import { useState, useEffect } from 'react';
import { getEvents } from '@/lib/firestore';
import { EventCard } from '@/components/events/EventCard';
import { motion } from 'framer-motion';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getEvents().then(res => {
      setEvents(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError(true);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now);
  const past = events.filter(e => new Date(e.date) < now);

  return (
    <div className="pt-24 min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="font-mono text-xs tracking-widest text-accent mb-4 block uppercase">EVENTS</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Competitions, Workshops & Meetups</h1>
        </motion.div>
        
        {loading ? (
          <div className="animate-pulse space-y-8">
             <div className="h-64 bg-secondary border border-border w-full"></div>
             <div className="h-64 bg-secondary border border-border w-full"></div>
          </div>
        ) : error ? (
          <p className="text-danger">Failed to load events. Please try again later.</p>
        ) : events.length === 0 ? (
          <p className="text-text-secondary">No events scheduled at this time. Check back later.</p>
        ) : (
          <div className="space-y-16">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-primary">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
            
            {past.length > 0 && (
              <section className="opacity-80">
                <h2 className="text-2xl font-bold mb-6 text-text-secondary">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {past.map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
