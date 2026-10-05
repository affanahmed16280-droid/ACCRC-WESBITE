'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import AdminGuard from '@/components/admin/AdminGuard';

type OrganizationPortal = 'sub-executive' | 'executive' | 'prefect';

const portalDetails: Record<OrganizationPortal, { title: string; description: string; managerLabel: string }> = {
  'sub-executive': {
    title: 'Sub-Executive Portal',
    description: 'Review sub-executive applications and prepare the team workspace for the next intake.',
    managerLabel: 'Manage sub-executive applications',
  },
  executive: {
    title: 'Executive Portal',
    description: 'Coordinate executive applications, role availability, and leadership recruitment.',
    managerLabel: 'Manage executive applications',
  },
  prefect: {
    title: 'Prefect Portal',
    description: 'Manage prefect applications and the roles that support club operations.',
    managerLabel: 'Manage prefect applications',
  },
};

export function OrganizationPortal({ portal }: { portal: OrganizationPortal }) {
  const details = portalDetails[portal];

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f6f0e7] px-4 py-20 text-[#141210] sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/admin/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#6b6258] transition-colors hover:text-[#c94030]">
            <ArrowLeft size={16} aria-hidden /> Back to portals
          </Link>

          <section className="mt-10 border border-[#cfc9bc] bg-[#ede7da] p-7 sm:p-10">
            <div className="flex items-start justify-between gap-6 border-b border-[#cfc9bc] pb-7">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#c94030]">Secure workspace</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{details.title}</h1>
              </div>
              <ShieldCheck className="h-8 w-8 shrink-0 text-[#c94030]" aria-hidden />
            </div>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#3a3530]">{details.description}</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#6b6258]">
              Firebase authentication is required for this workspace.
            </p>

            <Link href={`/admin/portal/?tab=${portal}`} className="mt-9 inline-flex items-center gap-2 border border-[#c94030] bg-[#c94030] px-5 py-3 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-[#a83228] hover:border-[#a83228]">
              {details.managerLabel} <ArrowUpRight size={16} aria-hidden />
            </Link>
          </section>
        </div>
      </main>
    </AdminGuard>
  );
}
