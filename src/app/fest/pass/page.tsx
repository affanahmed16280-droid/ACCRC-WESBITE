'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getFestRegistrationByParticipantId,
  getFestRegistrationById,
  type FestRegistration,
} from '@/lib/firestore';
import { ParticipantPassCard } from '@/components/fest/ParticipantPassCard';
import { TeamSubmissionModule } from '@/components/fest/TeamSubmissionModule';
import { Button } from '@/components/ui/Button';
import {
  QrCode,
  Search,
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

function TeamPassContent() {
  const searchParams = useSearchParams();
  const queryPid = searchParams.get('pid') || searchParams.get('id');

  const [inputVal, setInputVal] = useState(queryPid || '');
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<FestRegistration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'pass' | 'submissions'>('pass');

  useEffect(() => {
    if (queryPid) {
      loadTeam(queryPid);
    }
  }, [queryPid]);

  const loadTeam = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);

    try {
      let found = await getFestRegistrationByParticipantId(idToSearch.trim());
      if (!found && idToSearch.length > 15) {
        found = await getFestRegistrationById(idToSearch.trim());
      }

      if (!found) {
        setError(`No registration found matching "${idToSearch}". Please check your Participant ID or contact support.`);
        setTeam(null);
      } else {
        setTeam(found);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to look up team registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTeam(inputVal);
  };

  return (
    <div className="container-content pt-28 pb-20 max-w-4xl mx-auto min-h-screen">
      <div className="mb-6">
        <Link
          href="/fest"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#6b6258] hover:text-[#c94030] transition-colors"
        >
          <ChevronLeft size={16} /> Back to Fest Competitions
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 text-center sm:text-left border-b border-[#cfc9bc] pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#c94030] font-bold block mb-1">
          Adamjee Cantonment College Robotics Club
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141210]">
          Participant Pass & Team Dashboard
        </h1>
        <p className="text-sm text-[#3a3530] mt-1 max-w-2xl">
          Retrieve your digital QR pass, download your competitor badge, and upload your project abstracts, slide decks, or code repositories.
        </p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-8 bg-[#ede7da] p-4 border border-[#cfc9bc] rounded">
        <label className="block text-xs font-mono font-bold uppercase text-[#141210] mb-2">
          Find Your Team Pass (Enter Participant ID)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6b6258] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. ACCRC-FEST26-TM-1420"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm font-mono uppercase bg-[#f6f0e7] border border-[#cfc9bc] rounded text-[#141210] placeholder:text-[#9a9088]"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="font-mono text-xs uppercase tracking-wider shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : <Search size={16} className="mr-1" />}
            Retrieve Pass
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-[#c72c2c]/10 border border-[#c72c2c]/20 text-[#c72c2c] text-xs font-mono rounded flex items-center gap-2 mb-8">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Team Loaded Experience */}
      {team && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-[#cfc9bc] gap-2">
            <button
              onClick={() => setActiveSubTab('pass')}
              className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeSubTab === 'pass'
                  ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]'
                  : 'border-transparent text-[#6b6258] hover:text-[#141210]'
              }`}
            >
              <QrCode size={16} /> Digital QR Pass
            </button>
            <button
              onClick={() => setActiveSubTab('submissions')}
              className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 flex items-center gap-2 ${
                activeSubTab === 'submissions'
                  ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]'
                  : 'border-transparent text-[#6b6258] hover:text-[#141210]'
              }`}
            >
              <UploadCloud size={16} /> Team Submissions ({team.submittedFiles?.length || 0})
            </button>
          </div>

          {/* Subtab 1: Pass Card */}
          {activeSubTab === 'pass' && (
            <div className="pt-2">
              <ParticipantPassCard registration={team} />
            </div>
          )}

          {/* Subtab 2: Submissions Module */}
          {activeSubTab === 'submissions' && (
            <div className="pt-2">
              <TeamSubmissionModule
                registrationId={team.id || ''}
                participantId={team.participantId || ''}
                existingFiles={team.submittedFiles || []}
                onFilesUpdated={(newFiles) => {
                  setTeam({ ...team, submittedFiles: newFiles });
                }}
              />
            </div>
          )}
        </div>
      )}

      {!team && !loading && (
        <div className="border border-dashed border-[#cfc9bc] bg-[#ede7da] p-8 text-center rounded space-y-3">
          <QrCode className="w-12 h-12 text-[#c94030] mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-[#141210]">Already Registered?</h3>
          <p className="text-xs text-[#3a3530] max-w-md mx-auto leading-relaxed">
            Enter your 16-character Participant ID from your confirmation screen or confirmation WhatsApp/email to download your pass badge and manage project decks.
          </p>
          <div className="pt-2">
            <Link href="/fest">
              <Button variant="outline" size="sm" className="font-mono text-xs uppercase">
                Browse Competitions & Register
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPassPage() {
  return (
    <Suspense fallback={<div className="container-content pt-32 text-center text-[#6b6258] font-mono text-xs">Loading Pass Portal...</div>}>
      <TeamPassContent />
    </Suspense>
  );
}
