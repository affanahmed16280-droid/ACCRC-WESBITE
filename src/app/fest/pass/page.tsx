'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getFestRegistrationById,
  getFestRegistrationByParticipantId,
  type FestRegistration,
} from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ChevronLeft, ExternalLink, Link2, Loader2, Search, Users } from 'lucide-react';

function TeamRegistrationContent() {
  const searchParams = useSearchParams();
  const queryPid = searchParams.get('pid') || searchParams.get('id');
  const [inputValue, setInputValue] = useState(queryPid || '');
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<FestRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryPid) void loadTeam(queryPid);
  }, [queryPid]);

  const loadTeam = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);

    try {
      let found = await getFestRegistrationByParticipantId(idToSearch.trim());
      if (!found && idToSearch.length > 15) found = await getFestRegistrationById(idToSearch.trim());

      if (!found) {
        setTeam(null);
        setError(`No registration was found for "${idToSearch}". Please check the Participant ID.`);
      } else {
        setTeam(found);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to look up this registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-content min-h-screen flex flex-col pt-28 pb-10 max-w-4xl mx-auto">
      <Link href="/fest" className="inline-flex w-fit items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#6b6258] hover:text-[#c94030] transition-colors">
        <ChevronLeft size={16} /> Back to Fest Competitions
      </Link>

      <div className="mt-6 mb-8 border-b border-[#cfc9bc] pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#c94030] font-bold block mb-1">ACCRC Fest</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141210] break-words">Team Registration Lookup</h1>
        <p className="text-sm leading-relaxed text-[#3a3530] mt-2 max-w-2xl">
          Enter the Participant ID from your confirmation to review your team registration and submitted presentation link.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void loadTeam(inputValue);
        }}
        className="mb-8 bg-[#ede7da] p-4 border border-[#cfc9bc] rounded"
      >
        <label className="block text-xs font-mono font-bold uppercase text-[#141210] mb-2" htmlFor="participant-id">
          Participant ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6b6258] absolute left-3 top-3" />
            <input
              id="participant-id"
              type="text"
              placeholder="e.g. ACCRC-FEST26-TM-ABC123DEF456"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm font-mono uppercase bg-[#f6f0e7] border border-[#cfc9bc] rounded text-[#141210] placeholder:text-[#9a9088]"
            />
          </div>
          <Button type="submit" disabled={loading || !inputValue.trim()} className="font-mono text-xs uppercase tracking-wider shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : <Search size={16} className="mr-1" />}
            Find Team
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-8 p-4 bg-[#c72c2c]/10 border border-[#c72c2c]/20 text-[#c72c2c] text-xs font-mono rounded flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {team && (
        <section className="flex-grow border border-[#cfc9bc] bg-[#ede7da] p-5 sm:p-8 rounded space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#cfc9bc] pb-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#c94030] font-bold">Registered Team</span>
              <h2 className="text-2xl font-bold text-[#141210] mt-1 break-words">{team.teamName}</h2>
              <p className="text-sm text-[#6b6258] mt-1">{team.segmentTitle} · {team.institution}</p>
            </div>
            <span className="inline-flex w-fit px-2.5 py-1 rounded border border-[#cfc9bc] bg-[#f6f0e7] text-xs font-mono text-[#3a3530] uppercase">
              {team.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-[#f6f0e7] border border-[#cfc9bc] p-4 rounded">
              <span className="font-mono text-[10px] uppercase text-[#6b6258]">Participant ID</span>
              <strong className="mt-1 block font-mono break-all text-[#c94030]">{team.participantId}</strong>
            </div>
            <div className="bg-[#f6f0e7] border border-[#cfc9bc] p-4 rounded">
              <span className="font-mono text-[10px] uppercase text-[#6b6258]">Team Leader</span>
              <strong className="mt-1 block text-[#141210]">{team.leaderName}</strong>
              <span className="block text-xs text-[#6b6258] mt-1 break-words">{team.leaderEmail}</span>
            </div>
          </div>

          <div className="border border-[#cfc9bc] bg-[#f6f0e7] p-4 rounded">
            <div className="flex items-start gap-3">
              <Link2 className="w-5 h-5 shrink-0 text-[#c94030] mt-0.5" />
              <div className="min-w-0">
                <h3 className="font-bold text-[#141210]">Project / Presentation Link</h3>
                {team.submissionLink ? (
                  <a href={team.submissionLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-mono font-bold text-[#c94030] hover:underline">
                    Open submitted link <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="mt-1 text-xs leading-relaxed text-[#6b6258]">No presentation link was required or submitted for this segment.</p>
                )}
              </div>
            </div>
          </div>

          {team.members.length > 0 && (
            <div>
              <h3 className="font-mono text-xs uppercase font-bold text-[#141210] flex items-center gap-1.5 mb-3"><Users size={14} /> Additional Members</h3>
              <ul className="space-y-2">
                {team.members.map((member, index) => <li key={`${member.name}-${index}`} className="text-sm text-[#3a3530]">{member.name}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function TeamRegistrationPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><TeamRegistrationContent /></Suspense>;
}
