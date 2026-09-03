'use client';

import React, { useEffect, useState } from 'react';
import { getNewsPosts, type FirestoreNews } from '@/lib/firestore';
import { NewsCard } from '@/components/news/NewsCard';
import { SectionReveal } from '@/components/ui/SectionReveal';

export default function NewsPage() {
  const [news, setNews] = useState<FirestoreNews[]>([]);
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

  return (
    <main className="pt-24 section-padding container-content min-h-screen">
      <SectionReveal>
        <div className="mb-12">
          <div className="mono-label text-accent mb-2">NEWS & UPDATES</div>
          <h1 className="text-display-md font-bold text-text-primary">Stay in the Loop</h1>
        </div>
      </SectionReveal>

      <SectionReveal>
        {loading ? (
          <div className="text-text-secondary animate-pulse">Loading updates...</div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : news.length === 0 ? (
          <div className="text-text-secondary">No updates posted yet. Check back soon.</div>
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
