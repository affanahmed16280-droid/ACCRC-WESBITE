'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AdminGuard from '@/components/admin/AdminGuard';
import { getEvents, getRegistrations, getNewsPosts, getApplications } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Calendar, Users, FileText, Briefcase, LogOut, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    events: 0,
    registrations: 0,
    news: 0,
    applications: 0
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [events, regs, news, apps] = await Promise.all([
          getEvents(),
          getRegistrations(),
          getNewsPosts(),
          getApplications()
        ]);
        
        setCounts({
          events: events.length,
          registrations: regs.length,
          news: news.length,
          applications: apps.length
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/admin/login');
    }
  };

  return (
    <AdminGuard>
      <div className="pt-24 container-content min-h-screen text-primary pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-sans font-bold">Admin Dashboard</h1>
            <p className="text-secondary font-mono mt-1">Manage ACCRC portal contents</p>
          </div>
          <Button variant="secondary" onClick={handleSignOut} className="border-border">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-danger/10 border border-danger/20 text-danger font-mono text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="bg-secondary border border-border p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 text-secondary">
                  <span className="font-mono text-xs uppercase tracking-wider">Total Events</span>
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-4xl font-sans font-bold text-accent">{counts.events}</div>
              </div>
              
              <div className="bg-secondary border border-border p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 text-secondary">
                  <span className="font-mono text-xs uppercase tracking-wider">Registrations</span>
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-4xl font-sans font-bold text-accent">{counts.registrations}</div>
              </div>
              
              <div className="bg-secondary border border-border p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 text-secondary">
                  <span className="font-mono text-xs uppercase tracking-wider">News Posts</span>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-4xl font-sans font-bold text-accent">{counts.news}</div>
              </div>
              
              <div className="bg-secondary border border-border p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 text-secondary">
                  <span className="font-mono text-xs uppercase tracking-wider">Applications</span>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-4xl font-sans font-bold text-accent">{counts.applications}</div>
              </div>
            </div>

            <h2 className="text-xl font-sans font-bold mb-4 border-b border-border pb-2">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin/events">
                <Button className="bg-secondary hover:bg-tertiary border border-border text-primary">Manage Events</Button>
              </Link>
              <Link href="/admin/news">
                <Button className="bg-secondary hover:bg-tertiary border border-border text-primary">Manage News</Button>
              </Link>
              <Link href="/admin/portal">
                <Button className="bg-secondary hover:bg-tertiary border border-border text-primary">Manage Portal</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
