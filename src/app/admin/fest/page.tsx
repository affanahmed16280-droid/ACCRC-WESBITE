'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import {
  getFestSegments,
  createFestSegment,
  updateFestSegment,
  deleteFestSegment,
  getFestRegistrations,
  updateFestRegistrationStatus,
  deleteFestRegistration,
  getFestSchedule,
  createFestScheduleItem,
  deleteFestScheduleItem,
  getFestAnnouncements,
  createFestAnnouncement,
  deleteFestAnnouncement,
  type FestSegment,
  type FestRegistration,
  type FestScheduleItem,
  type FestAnnouncement,
} from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DeleteModal } from '@/components/admin/DeleteModal';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Users,
  Search,
  Loader2,
  Download,
} from 'lucide-react';

export default function AdminFest() {
  const [activeTab, setActiveTab] = useState<'registrations' | 'segments' | 'schedule' | 'announcements'>('registrations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [segments, setSegments] = useState<FestSegment[]>([]);
  const [registrations, setRegistrations] = useState<FestRegistration[]>([]);
  const [schedule, setSchedule] = useState<FestScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<FestAnnouncement[]>([]);

  // Filtering
  const [regSearch, setRegSearch] = useState('');
  const [regSegmentFilter, setRegSegmentFilter] = useState('ALL');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; type: 'segment' | 'registration' | 'schedule' | 'announcement' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Segment create/edit form
  const [isSegmentFormOpen, setIsSegmentFormOpen] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [segmentFormData, setSegmentFormData] = useState({
    title: '',
    category: 'Robotics',
    description: '',
    teamMin: '1',
    teamMax: '4',
    registrationFee: '1000',
    prizePool: '',
    rulesUrl: '',
    venue: '',
    scheduleTime: '',
    isOpen: true,
  });

  // Schedule create form
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    day: 'Day 1',
    time: '09:00 AM - 12:00 PM',
    segmentTitle: '',
    stage: 'Preliminary Round',
    venue: 'Main Arena',
    status: 'upcoming' as const,
  });

  // Announcement create form
  const [isAnnounceFormOpen, setIsAnnounceFormOpen] = useState(false);
  const [announceFormData, setAnnounceFormData] = useState({
    title: '',
    body: '',
    tag: 'Notice' as const,
  });

  useEffect(() => {
    fetchFestData();
  }, []);

  async function fetchFestData() {
    setLoading(true);
    setError(null);
    try {
      const [segs, regs, sch, ann] = await Promise.all([
        getFestSegments(),
        getFestRegistrations(),
        getFestSchedule(),
        getFestAnnouncements(),
      ]);
      setSegments(segs);
      setRegistrations(regs);
      setSchedule(sch);
      setAnnouncements(ann);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fest data');
    } finally {
      setLoading(false);
    }
  }

  // Segment handlers
  const handleSaveSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: segmentFormData.title.trim(),
        category: segmentFormData.category.trim(),
        description: segmentFormData.description.trim(),
        teamMin: parseInt(segmentFormData.teamMin, 10) || 1,
        teamMax: parseInt(segmentFormData.teamMax, 10) || 1,
        registrationFee: parseInt(segmentFormData.registrationFee, 10) || 0,
        prizePool: segmentFormData.prizePool.trim(),
        rulesUrl: segmentFormData.rulesUrl.trim(),
        venue: segmentFormData.venue.trim(),
        scheduleTime: segmentFormData.scheduleTime.trim(),
        isOpen: segmentFormData.isOpen,
      };

      if (editingSegmentId) {
        await updateFestSegment(editingSegmentId, payload);
      } else {
        await createFestSegment(payload);
      }
      setIsSegmentFormOpen(false);
      setEditingSegmentId(null);
      await fetchFestData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save segment');
    }
  };

  const handleEditSegment = (seg: FestSegment) => {
    setSegmentFormData({
      title: seg.title,
      category: seg.category,
      description: seg.description,
      teamMin: String(seg.teamMin),
      teamMax: String(seg.teamMax),
      registrationFee: String(seg.registrationFee),
      prizePool: seg.prizePool || '',
      rulesUrl: seg.rulesUrl || '',
      venue: seg.venue || '',
      scheduleTime: seg.scheduleTime || '',
      isOpen: seg.isOpen,
    });
    setEditingSegmentId(seg.id);
    setIsSegmentFormOpen(true);
  };

  // Schedule handler
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFestScheduleItem({
        day: scheduleFormData.day,
        time: scheduleFormData.time,
        segmentTitle: scheduleFormData.segmentTitle,
        stage: scheduleFormData.stage,
        venue: scheduleFormData.venue,
        status: scheduleFormData.status,
      });
      setIsScheduleFormOpen(false);
      await fetchFestData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule slot');
    }
  };

  // Announcement handler
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFestAnnouncement({
        title: announceFormData.title,
        body: announceFormData.body,
        tag: announceFormData.tag,
        isLive: true,
      });
      setIsAnnounceFormOpen(false);
      setAnnounceFormData({ title: '', body: '', tag: 'Notice' });
      await fetchFestData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post announcement');
    }
  };

  // Registration status toggle
  const handleUpdateRegStatus = async (id: string, status: FestRegistration['status']) => {
    try {
      await updateFestRegistrationStatus(id, status);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update registration status');
    }
  };

  // Delete modal confirm
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'segment') {
        await deleteFestSegment(deleteTarget.id);
        setSegments((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'registration') {
        await deleteFestRegistration(deleteTarget.id);
        setRegistrations((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'schedule') {
        await deleteFestScheduleItem(deleteTarget.id);
        setSchedule((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      } else if (deleteTarget.type === 'announcement') {
        await deleteFestAnnouncement(deleteTarget.id);
        setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.teamName.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.leaderName.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.institution.toLowerCase().includes(regSearch.toLowerCase()) ||
      (r.transactionId && r.transactionId.toLowerCase().includes(regSearch.toLowerCase()));
    const matchesSegment = regSegmentFilter === 'ALL' || r.segmentId === regSegmentFilter;
    const matchesStatus = regStatusFilter === 'ALL' || r.status === regStatusFilter;
    return matchesSearch && matchesSegment && matchesStatus;
  });

  return (
    <AdminGuard>
      <div className="pt-24 container-content min-h-screen pb-16 text-[#141210]">
        <div className="mb-6">
          <Link href="/admin" className="text-[#6b6258] hover:text-[#c94030] font-mono text-sm flex items-center inline-flex">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Admin Hub
          </Link>
        </div>

        {/* ═══ HEADER & STATS ═══ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-6 h-6 text-[#c94030]" />
              <h1 className="text-3xl font-sans font-bold text-[#141210]">Fest Management Portal</h1>
            </div>
            <p className="text-sm text-[#3a3530]">Coordinate competitions, team rosters, venue timetables, and live announcements.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#ede7da] border border-[#cfc9bc] px-4 py-2 text-center">
              <span className="font-mono text-xs text-[#6b6258] uppercase block">Teams</span>
              <strong className="text-lg font-bold text-[#141210]">{registrations.length}</strong>
            </div>
            <div className="bg-[#ede7da] border border-[#cfc9bc] px-4 py-2 text-center">
              <span className="font-mono text-xs text-emerald-700 uppercase block">Verified</span>
              <strong className="text-lg font-bold text-emerald-700">
                {registrations.filter((r) => r.status === 'verified').length}
              </strong>
            </div>
            <div className="bg-[#ede7da] border border-[#cfc9bc] px-4 py-2 text-center">
              <span className="font-mono text-xs text-[#c94030] uppercase block">Pending</span>
              <strong className="text-lg font-bold text-[#c94030]">
                {registrations.filter((r) => r.status === 'pending').length}
              </strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#c72c2c]/10 border border-[#c72c2c]/20 text-[#c72c2c] font-mono text-sm rounded">
            {error}
          </div>
        )}

        {/* ═══ TABS ═══ */}
        <div className="flex border-b border-[#cfc9bc] mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === 'registrations'
                ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]'
                : 'border-transparent text-[#6b6258] hover:text-[#141210]'
            }`}
          >
            Team Registrations ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === 'segments'
                ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]'
                : 'border-transparent text-[#6b6258] hover:text-[#141210]'
            }`}
          >
            Segments & Competitions ({segments.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === 'schedule'
                ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]'
                : 'border-transparent text-[#6b6258] hover:text-[#141210]'
            }`}
          >
            Event Schedule ({schedule.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === 'announcements'
                ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]'
                : 'border-transparent text-[#6b6258] hover:text-[#141210]'
            }`}
          >
            Announcements & Results ({announcements.length})
          </button>
        </div>

        {/* ═══ TAB 1: REGISTRATIONS ═══ */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-[#ede7da] border border-[#cfc9bc] p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#6b6258] absolute left-3 top-3" />
                <Input
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  placeholder="Search team, leader, institution, TrxID..."
                  className="pl-9 text-xs bg-[#f6f0e7] text-[#141210] w-full"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <select
                  value={regSegmentFilter}
                  onChange={(e) => setRegSegmentFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-mono bg-[#f6f0e7] border border-[#cfc9bc] text-[#141210]"
                >
                  <option value="ALL">All Segments</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>

                <select
                  value={regStatusFilter}
                  onChange={(e) => setRegStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-mono bg-[#f6f0e7] border border-[#cfc9bc] text-[#141210]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#c94030]" />
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#cfc9bc] bg-[#ede7da]">
                <Users className="w-8 h-8 mx-auto text-[#c94030] mb-2" />
                <p className="font-bold text-[#141210]">No team registrations found</p>
                <p className="text-xs font-mono text-[#6b6258] mt-1">Registrations submitted via the fest page will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#cfc9bc] bg-[#ede7da]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#141210] text-white uppercase">
                    <tr>
                      <th className="p-3">Team & Segment</th>
                      <th className="p-3">Institution</th>
                      <th className="p-3">Leader Contact</th>
                      <th className="p-3">Members</th>
                      <th className="p-3">Payment / TrxID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cfc9bc]">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#e6dfd1]/60 transition-colors">
                        <td className="p-3">
                          <strong className="text-sm font-sans font-bold text-[#141210] block">{reg.teamName}</strong>
                          <span className="text-[#c94030] font-semibold">{reg.segmentTitle}</span>
                        </td>
                        <td className="p-3 text-[#3a3530]">{reg.institution}</td>
                        <td className="p-3">
                          <div className="font-bold text-[#141210]">{reg.leaderName}</div>
                          <div className="text-[#6b6258]">{reg.leaderEmail}</div>
                          <div className="text-[#6b6258]">{reg.leaderPhone}</div>
                        </td>
                        <td className="p-3 text-[#3a3530]">
                          <span className="font-bold">{1 + (reg.members?.length || 0)} Total</span>
                          {reg.members && reg.members.length > 0 && (
                            <div className="text-[10px] text-[#6b6258] mt-1">
                              {reg.members.map((m) => m.name).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div>{reg.paymentMethod || 'N/A'}</div>
                          <div className="text-[#141210] font-bold">{reg.transactionId || 'None'}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              reg.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : reg.status === 'rejected'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {reg.status !== 'verified' && (
                              <button
                                onClick={() => handleUpdateRegStatus(reg.id!, 'verified')}
                                title="Approve & Verify Payment"
                                className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                            {reg.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateRegStatus(reg.id!, 'rejected')}
                                title="Reject Registration"
                                className="p-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  id: reg.id!,
                                  title: `Team ${reg.teamName}`,
                                  type: 'registration',
                                })
                              }
                              title="Delete Registration"
                              className="p-1.5 bg-[#c72c2c] text-white rounded hover:bg-[#a83228] transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 2: SEGMENTS ═══ */}
        {activeTab === 'segments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-sans text-[#141210]">Fest Segments & Competitions</h2>
              <Button
                onClick={() => {
                  setEditingSegmentId(null);
                  setSegmentFormData({
                    title: '',
                    category: 'Robotics',
                    description: '',
                    teamMin: '1',
                    teamMax: '4',
                    registrationFee: '1000',
                    prizePool: '',
                    rulesUrl: '',
                    venue: '',
                    scheduleTime: '',
                    isOpen: true,
                  });
                  setIsSegmentFormOpen(true);
                }}
              >
                <Plus size={16} className="mr-1" /> Add New Segment
              </Button>
            </div>

            {/* Segment Create / Edit Form */}
            {isSegmentFormOpen && (
              <div className="bg-[#ede7da] border border-[#cfc9bc] p-6 rounded shadow-xs">
                <h3 className="text-lg font-bold text-[#141210] mb-4 pb-2 border-b border-[#cfc9bc]">
                  {editingSegmentId ? 'Edit Segment' : 'Create New Fest Segment'}
                </h3>
                <form onSubmit={handleSaveSegment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Title *</label>
                      <Input
                        value={segmentFormData.title}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, title: e.target.value })}
                        required
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Category</label>
                      <Input
                        value={segmentFormData.category}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, category: e.target.value })}
                        placeholder="Robotics / Olympiad / CAD"
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Registration Fee (৳)</label>
                      <Input
                        type="number"
                        value={segmentFormData.registrationFee}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, registrationFee: e.target.value })}
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Min Team Size</label>
                      <Input
                        type="number"
                        value={segmentFormData.teamMin}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, teamMin: e.target.value })}
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Max Team Size</label>
                      <Input
                        type="number"
                        value={segmentFormData.teamMax}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, teamMax: e.target.value })}
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Prize Pool</label>
                      <Input
                        value={segmentFormData.prizePool}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, prizePool: e.target.value })}
                        placeholder="e.g. ৳ 30,000"
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Venue</label>
                      <Input
                        value={segmentFormData.venue}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, venue: e.target.value })}
                        placeholder="Gymnasium Arena A"
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Schedule Time</label>
                      <Input
                        value={segmentFormData.scheduleTime}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, scheduleTime: e.target.value })}
                        placeholder="Day 1 · 09:30 AM"
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Rulebook URL</label>
                      <Input
                        value={segmentFormData.rulesUrl}
                        onChange={(e) => setSegmentFormData({ ...segmentFormData, rulesUrl: e.target.value })}
                        placeholder="https://..."
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-[#141210]">Description *</label>
                    <textarea
                      value={segmentFormData.description}
                      onChange={(e) => setSegmentFormData({ ...segmentFormData, description: e.target.value })}
                      required
                      rows={3}
                      className="w-full bg-[#f6f0e7] border border-[#cfc9bc] p-2 text-xs text-[#141210]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isOpenCheckbox"
                      checked={segmentFormData.isOpen}
                      onChange={(e) => setSegmentFormData({ ...segmentFormData, isOpen: e.target.checked })}
                      className="accent-[#c94030]"
                    />
                    <label htmlFor="isOpenCheckbox" className="font-mono text-xs uppercase font-bold text-[#141210] cursor-pointer">
                      Registration Open for this segment
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setIsSegmentFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Segment</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Segments grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {segments.map((seg) => (
                <div key={seg.id} className="border border-[#cfc9bc] bg-[#ede7da] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#f6f0e7] border border-[#cfc9bc] text-[#c94030]">
                        {seg.category}
                      </span>
                      <span className={`font-mono text-xs font-bold ${seg.isOpen ? 'text-emerald-700' : 'text-[#c72c2c]'}`}>
                        {seg.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#141210]">{seg.title}</h3>
                    <p className="text-xs text-[#3a3530] my-2">{seg.description}</p>
                    <div className="text-xs font-mono text-[#6b6258] space-y-1 border-t border-[#cfc9bc] pt-2">
                      <div>Fee: ৳ {seg.registrationFee} · Team: {seg.teamMin}–{seg.teamMax}</div>
                      <div>Venue: {seg.venue || 'TBA'} · Time: {seg.scheduleTime || 'TBA'}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-[#cfc9bc] mt-4">
                    <Button variant="secondary" size="sm" onClick={() => handleEditSegment(seg)}>
                      <Edit2 size={14} className="mr-1" /> Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteTarget({ id: seg.id, title: seg.title, type: 'segment' })}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB 3: SCHEDULE ═══ */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-sans text-[#141210]">Event Timetable Slots</h2>
              <Button onClick={() => setIsScheduleFormOpen(true)}>
                <Plus size={16} className="mr-1" /> Add Timetable Slot
              </Button>
            </div>

            {isScheduleFormOpen && (
              <div className="bg-[#ede7da] border border-[#cfc9bc] p-6 rounded">
                <h3 className="text-lg font-bold text-[#141210] mb-4">Add Timetable Slot</h3>
                <form onSubmit={handleSaveSchedule} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Day</label>
                      <Input
                        value={scheduleFormData.day}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, day: e.target.value })}
                        placeholder="Day 1 / 2026-11-15"
                        required
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Time Window</label>
                      <Input
                        value={scheduleFormData.time}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                        placeholder="09:00 AM - 12:00 PM"
                        required
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Segment Title</label>
                      <Input
                        value={scheduleFormData.segmentTitle}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, segmentTitle: e.target.value })}
                        placeholder="Line Follower Robot"
                        required
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Stage</label>
                      <Input
                        value={scheduleFormData.stage}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, stage: e.target.value })}
                        placeholder="Preliminary / Final Round"
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Venue</label>
                      <Input
                        value={scheduleFormData.venue}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, venue: e.target.value })}
                        placeholder="Auditorium Main Stage"
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setIsScheduleFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Slot</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="border border-[#cfc9bc] bg-[#ede7da] divide-y divide-[#cfc9bc]">
              {schedule.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#6b6258]">No timetable slots added yet.</div>
              ) : (
                schedule.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#c94030] mr-3">{item.day} · {item.time}</span>
                      <strong className="text-sm font-sans font-bold text-[#141210]">{item.segmentTitle}</strong>
                      <span className="text-xs text-[#6b6258] font-mono ml-2">({item.stage} @ {item.venue})</span>
                    </div>
                    <button
                      onClick={() => setDeleteTarget({ id: item.id!, title: item.segmentTitle, type: 'schedule' })}
                      className="p-1.5 text-[#c72c2c] hover:bg-[#e6dfd1] rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB 4: ANNOUNCEMENTS ═══ */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-sans text-[#141210]">Fest Announcements & Live Results</h2>
              <Button onClick={() => setIsAnnounceFormOpen(true)}>
                <Plus size={16} className="mr-1" /> Post Announcement / Result
              </Button>
            </div>

            {isAnnounceFormOpen && (
              <div className="bg-[#ede7da] border border-[#cfc9bc] p-6 rounded">
                <h3 className="text-lg font-bold text-[#141210] mb-4">Post Announcement / Result</h3>
                <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Title *</label>
                      <Input
                        value={announceFormData.title}
                        onChange={(e) => setAnnounceFormData({ ...announceFormData, title: e.target.value })}
                        placeholder="e.g. LFR Preliminary Round Qualifiers Announced"
                        required
                        className="bg-[#f6f0e7] text-[#141210]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Tag</label>
                      <select
                        value={announceFormData.tag}
                        onChange={(e) => setAnnounceFormData({ ...announceFormData, tag: e.target.value as any })}
                        className="w-full h-10 px-3 bg-[#f6f0e7] border border-[#cfc9bc] text-xs font-mono text-[#141210]"
                      >
                        <option value="Notice">Notice</option>
                        <option value="Result">Result</option>
                        <option value="Schedule">Schedule</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-[#141210]">Body *</label>
                    <textarea
                      value={announceFormData.body}
                      onChange={(e) => setAnnounceFormData({ ...announceFormData, body: e.target.value })}
                      required
                      rows={4}
                      placeholder="Enter announcement details, qualified team IDs, or instructions..."
                      className="w-full bg-[#f6f0e7] border border-[#cfc9bc] p-2 text-xs text-[#141210]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setIsAnnounceFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Publish</Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#6b6258] border border-dashed border-[#cfc9bc]">
                  No announcements published yet.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="border border-[#cfc9bc] bg-[#ede7da] p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#c94030] text-white">
                          {ann.tag}
                        </span>
                        <span className="font-mono text-xs text-[#6b6258]">
                          {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#141210]">{ann.title}</h4>
                      <p className="text-xs text-[#3a3530] mt-1 whitespace-pre-wrap">{ann.body}</p>
                    </div>
                    <button
                      onClick={() => setDeleteTarget({ id: ann.id!, title: ann.title, type: 'announcement' })}
                      className="p-1.5 text-[#c72c2c] hover:bg-[#e6dfd1] rounded shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type}?`}
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.` : ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminGuard>
  );
}
