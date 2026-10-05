'use client';

import React, { useEffect, useState } from 'react';
import { getNewsPosts, subscribeToEvents, type FirestoreNews, type FirestoreEvent } from '@/lib/firestore';
import { NewsCard } from '@/components/news/NewsCard';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { EventBanner } from '@/components/home/EventBanner';

export default function NewsPage() {
  const [news, setNews] = useState<FirestoreNews[]>([]);
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const posts = await getNewsPosts();
        setNews(posts);
      } catch (err: any) {
        console.error('Failed to fetch news', err);
        setError('Failed to load news updates. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToEvents(setEvents);
    return () => unsubscribe();
  }, []);

  return (
    <main className="pt-24 section-padding container-content min-h-screen">
      <EventBanner events={events} />
      <SectionReveal>
        <div className="mb-12">
          <div className="mono-label text-[#c94030] mb-2">NEWS & UPDATES</div>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold text-[#141210]">Stay in the Loop</h1>
        </div>
      </SectionReveal>

      <SectionReveal>
        {loading ? (
          <div className="text-[#3a3530] animate-pulse">Loading updates...</div>
        ) : error ? (
          <div className="text-[#c72c2c]">{error}</div>
        ) : news.length === 0 ? (
          <div className="text-[#3a3530]">No updates posted yet. Check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((post) => (
              <NewsCard key={post.id} news={post} />
            ))}
          </div>
        )}
      </SectionReveal>
    </main>
  );
}
