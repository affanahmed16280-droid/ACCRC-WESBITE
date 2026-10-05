'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Calendar,
  MapPin,
  Trophy,
  Users,
  ChevronRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  X,
  Plus,
  Trash2,
  Bell,
} from 'lucide-react';
import {
  getFestSegments,
  subscribeToFestSegments,
  submitFestRegistration,
  getFestSchedule,
  subscribeToFestAnnouncements,
  type FestSegment,
  type FestRegistration,
  type FestScheduleItem,
  type FestAnnouncement,
  type FestMember,
} from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function FestPage() {
  const [segments, setSegments] = useState<FestSegment[]>([]);
  const [schedule, setSchedule] = useState<FestScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<FestAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'segments' | 'schedule' | 'announcements'>('segments');

  // Registration modal state
  const [selectedSegment, setSelectedSegment] = useState<FestSegment | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Registration form
  const [teamName, setTeamName] = useState('');
  const [institution, setInstitution] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderWhatsapp, setLeaderWhatsapp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [members, setMembers] = useState<FestMember[]>([]);

  useEffect(() => {
    setLoading(true);
    const unsubSegments = subscribeToFestSegments((data) => {
      setSegments(data);
      setLoading(false);
    });

    const unsubAnnouncements = subscribeToFestAnnouncements((data) => {
      setAnnouncements(data);
    });

    getFestSchedule().then((sch) => {
      setSchedule(sch);
    });

    return () => {
      unsubSegments();
      unsubAnnouncements();
    };
  }, []);

  const openRegistration = (segment: FestSegment) => {
    setSelectedSegment(segment);
    setTeamName('');
    setInstitution('');
    setLeaderName('');
    setLeaderEmail('');
    setLeaderPhone('');
    setLeaderWhatsapp('');
    setTransactionId('');
    setPaymentMethod('bKash');
    setMembers([]);
    setRegSuccess(false);
    setRegError(null);
  };

  const addMember = () => {
    if (!selectedSegment) return;
    const maxAllowed = Math.max(0, selectedSegment.teamMax - 1);
    if (members.length < maxAllowed) {
      setMembers([...members, { name: '', institution: '', phone: '', email: '' }]);
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof FestMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSegment) return;

    // Basic sanitization & validations
    if (!teamName.trim() || !institution.trim() || !leaderName.trim() || !leaderEmail.trim() || !leaderPhone.trim()) {
      setRegError('Please fill in all required fields marked with *.');
      return;
    }

    if (selectedSegment.registrationFee > 0 && !transactionId.trim()) {
      setRegError('Please provide the bKash/Nagad/Rocket Transaction ID (TrxID) for verification.');
      return;
    }

    setRegSubmitting(true);
    setRegError(null);

    try {
      await submitFestRegistration({
        segmentId: selectedSegment.id,
        segmentTitle: selectedSegment.title,
        teamName: teamName.trim(),
        institution: institution.trim(),
        leaderName: leaderName.trim(),
        leaderEmail: leaderEmail.trim(),
        leaderPhone: leaderPhone.trim(),
        leaderWhatsapp: leaderWhatsapp.trim() || leaderPhone.trim(),
        members: members.filter((m) => m.name.trim().length > 0),
        transactionId: transactionId.trim(),
        paymentMethod: selectedSegment.registrationFee > 0 ? paymentMethod : 'Free',
        status: 'pending',
      });
      setRegSuccess(true);
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Registration failed. Please check your network and try again.');
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f0e7] pt-24 pb-20 text-[#141210]">
      {/* ═══ HERO SECTION ═══ */}
      <section className="container-content mb-12">
        <div className="border border-[#cfc9bc] bg-[#ede7da] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#c94030]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#c94030]/10 border border-[#c94030]/20 rounded-full mb-4">
              <Flame className="w-4 h-4 text-[#c94030]" aria-hidden />
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#c94030]">
                National Robotics & Tech Fest 2026
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#141210] leading-[1.05] mb-4">
              Ignite the Future.<br />
              <span className="text-[#c94030]">Build & Compete.</span>
            </h1>
            <p className="text-base md:text-lg text-[#3a3530] leading-relaxed max-w-2xl mb-8">
              Welcome to the flagship robotics competition organized by Adamjee Cantonment College Robotics Club.
              Bringing together innovators, robot builders, and tech minds from colleges and universities across Bangladesh.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider text-[#6b6258]">
              <div className="flex items-center gap-2 bg-[#f6f0e7] px-3.5 py-2 border border-[#cfc9bc]">
                <MapPin className="w-4 h-4 text-[#c94030]" />
                <span>Adamjee Cantonment College, Dhaka</span>
              </div>
              <div className="flex items-center gap-2 bg-[#f6f0e7] px-3.5 py-2 border border-[#cfc9bc]">
                <Trophy className="w-4 h-4 text-[#c94030]" />
                <span>Prize Pool: ৳ 1,50,000+</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LIVE NOTICES / TICKER (IF ANY) ═══ */}
      {announcements.length > 0 && (
        <section className="container-content mb-8">
          <div className="border border-[#c94030]/30 bg-[#c94030]/5 p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#c94030] shrink-0 animate-pulse" />
            <div className="text-sm font-mono overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="font-bold text-[#c94030] mr-2">[{announcements[0].tag}]:</span>
              <span className="text-[#141210]">{announcements[0].title} — {announcements[0].body}</span>
            </div>
          </div>
        </section>
      )}

      {/* ═══ NAVIGATION TABS ═══ */}
      <section className="container-content mb-8">
        <div className="flex border-b border-[#cfc9bc] gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('segments')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === 'segments'
                ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]/60'
                : 'border-transparent text-[#6b6258] hover:text-[#141210]'
            }`}
          >
            Competitions & Segments ({segments.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === 'schedule'
                ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]/60'
                : 'border-transparent text-[#6b6258] hover:text-[#141210]'
            }`}
          >
            Event Timetable
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === 'announcements'
                ? 'border-[#c94030] text-[#c94030] bg-[#ede7da]/60'
                : 'border-transparent text-[#6b6258] hover:text-[#141210]'
            }`}
          >
            Notices & Results ({announcements.length})
          </button>
        </div>
      </section>

      {/* ═══ TAB CONTENT: SEGMENTS ═══ */}
      {activeTab === 'segments' && (
        <section className="container-content">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#c94030]" />
            </div>
          ) : segments.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#cfc9bc] bg-[#ede7da]">
              <p className="font-mono text-sm text-[#6b6258]">No fest segments are currently listed. Please check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="border border-[#cfc9bc] bg-[#ede7da] p-6 flex flex-col justify-between hover:border-[#c94030] transition-colors relative group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#f6f0e7] border border-[#cfc9bc] text-[#c94030]">
                        {segment.category}
                      </span>
                      <span className={`text-[11px] font-mono font-semibold ${segment.isOpen ? 'text-emerald-700' : 'text-[#c72c2c]'}`}>
                        {segment.isOpen ? '● Registration Open' : '● Closed'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#141210] mb-2 leading-snug group-hover:text-[#c94030] transition-colors">
                      {segment.title}
                    </h3>
                    <p className="text-xs text-[#3a3530] leading-relaxed mb-4">
                      {segment.description}
                    </p>

                    <div className="space-y-1.5 border-t border-[#cfc9bc]/60 pt-3 text-xs font-mono text-[#6b6258]">
                      <div className="flex justify-between">
                        <span>Team Size:</span>
                        <strong className="text-[#141210]">
                          {segment.teamMin === segment.teamMax ? `${segment.teamMin} member` : `${segment.teamMin}–${segment.teamMax} members`}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Registration Fee:</span>
                        <strong className="text-[#141210]">
                          {segment.registrationFee === 0 ? 'FREE' : `৳ ${segment.registrationFee}`}
                        </strong>
                      </div>
                      {segment.prizePool && (
                        <div className="flex justify-between">
                          <span>Prize Pool:</span>
                          <strong className="text-[#c94030]">{segment.prizePool}</strong>
                        </div>
                      )}
                      {segment.venue && (
                        <div className="flex justify-between">
                          <span>Venue:</span>
                          <span className="text-[#141210]">{segment.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#cfc9bc] flex items-center justify-between gap-3">
                    {segment.rulesUrl ? (
                      <a
                        href={segment.rulesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#6b6258] hover:text-[#141210] transition-colors"
                      >
                        <Download size={14} /> Rulebook
                      </a>
                    ) : (
                      <span className="text-[11px] font-mono text-[#9a9088]">Rules on venue</span>
                    )}

                    <Button
                      onClick={() => openRegistration(segment)}
                      disabled={!segment.isOpen}
                      size="sm"
                      className="font-mono text-xs uppercase tracking-wider"
                    >
                      Register Team <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ═══ TAB CONTENT: SCHEDULE ═══ */}
      {activeTab === 'schedule' && (
        <section className="container-content">
          {schedule.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#cfc9bc] bg-[#ede7da]">
              <Clock className="w-8 h-8 mx-auto text-[#c94030] mb-3" />
              <p className="font-bold text-[#141210] text-base mb-1">Official Timetable Announcing Soon</p>
              <p className="font-mono text-xs text-[#6b6258]">Event schedules and arena slots will be published prior to competition day.</p>
            </div>
          ) : (
            <div className="border border-[#cfc9bc] bg-[#ede7da] divide-y divide-[#cfc9bc]">
              {schedule.map((item, idx) => (
                <div key={item.id || idx} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#f6f0e7] border border-[#cfc9bc] px-3 py-2 text-center min-w-[90px]">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#c94030] block">{item.day}</span>
                      <span className="font-mono text-xs font-bold text-[#141210] block">{item.time}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#141210]">{item.segmentTitle}</h4>
                      <p className="text-xs text-[#6b6258] font-mono mt-0.5">
                        Stage: <strong className="text-[#3a3530]">{item.stage}</strong> · Venue: <span className="text-[#3a3530]">{item.venue}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 font-mono text-[10px] uppercase tracking-wider font-semibold border border-[#cfc9bc] bg-[#f6f0e7] text-[#3a3530]">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ═══ TAB CONTENT: ANNOUNCEMENTS ═══ */}
      {activeTab === 'announcements' && (
        <section className="container-content">
          {announcements.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#cfc9bc] bg-[#ede7da]">
              <p className="font-mono text-sm text-[#6b6258]">No announcements posted yet. Check back during the fest!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((post) => (
                <div key={post.id} className="border border-[#cfc9bc] bg-[#ede7da] p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold bg-[#c94030] text-white">
                      {post.tag}
                    </span>
                    <span className="font-mono text-xs text-[#6b6258]">
                      {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#141210] mb-2">{post.title}</h3>
                  <p className="text-sm text-[#3a3530] leading-relaxed whitespace-pre-wrap">{post.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ═══ REGISTRATION MODAL ═══ */}
      {selectedSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#ede7da] border border-[#cfc9bc] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-xl">
            <button
              onClick={() => setSelectedSegment(null)}
              className="absolute top-6 right-6 text-[#6b6258] hover:text-[#141210] p-1 rounded transition-colors"
              aria-label="Close registration modal"
            >
              <X size={20} />
            </button>

            {regSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-bold text-[#141210]">Team Registration Submitted!</h3>
                <p className="text-sm text-[#3a3530] max-w-md mx-auto leading-relaxed">
                  Thank you for registering team <strong className="text-[#141210]">{teamName}</strong> for{' '}
                  <strong className="text-[#c94030]">{selectedSegment.title}</strong>.
                  Our coordinators will verify your payment details and reach out via WhatsApp/email with your team ID.
                </p>
                <div className="pt-4">
                  <Button onClick={() => setSelectedSegment(null)}>Done</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 border-b border-[#cfc9bc] pb-4">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#c94030]">
                    Registration Form
                  </span>
                  <h2 className="text-2xl font-bold text-[#141210] mt-1">{selectedSegment.title}</h2>
                  <p className="text-xs text-[#6b6258] font-mono mt-1">
                    Fee: {selectedSegment.registrationFee === 0 ? 'FREE' : `৳ ${selectedSegment.registrationFee}`} · Team Size: up to {selectedSegment.teamMax}
                  </p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 bg-[#c72c2c]/10 border border-[#c72c2c]/20 text-[#c72c2c] text-xs font-mono rounded flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Team Name *</label>
                      <Input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. RoboSpark ACC"
                        required
                        className="text-[#141210] bg-[#f6f0e7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase text-[#141210]">Institution / College *</label>
                      <Input
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. Adamjee Cantonment College"
                        required
                        className="text-[#141210] bg-[#f6f0e7]"
                      />
                    </div>
                  </div>

                  {/* Leader Details */}
                  <div className="border-t border-[#cfc9bc] pt-3">
                    <h4 className="font-mono text-xs uppercase font-bold text-[#c94030] mb-2">Team Leader Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono uppercase text-[#6b6258]">Leader Name *</label>
                        <Input
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          placeholder="Full Name"
                          required
                          className="text-[#141210] bg-[#f6f0e7]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono uppercase text-[#6b6258]">Email *</label>
                        <Input
                          type="email"
                          value={leaderEmail}
                          onChange={(e) => setLeaderEmail(e.target.value)}
                          placeholder="email@example.com"
                          required
                          className="text-[#141210] bg-[#f6f0e7]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono uppercase text-[#6b6258]">Phone (WhatsApp) *</label>
                        <Input
                          value={leaderPhone}
                          onChange={(e) => {
                            setLeaderPhone(e.target.value);
                            if (!leaderWhatsapp) setLeaderWhatsapp(e.target.value);
                          }}
                          placeholder="+880 1XXX-XXXXXX"
                          required
                          className="text-[#141210] bg-[#f6f0e7]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Members */}
                  {selectedSegment.teamMax > 1 && (
                    <div className="border-t border-[#cfc9bc] pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-mono text-xs uppercase font-bold text-[#141210]">
                          Additional Members ({members.length}/{selectedSegment.teamMax - 1})
                        </h4>
                        {members.length < selectedSegment.teamMax - 1 && (
                          <button
                            type="button"
                            onClick={addMember}
                            className="inline-flex items-center gap-1 font-mono text-xs text-[#c94030] hover:underline"
                          >
                            <Plus size={14} /> Add Member
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {members.map((mem, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-[#f6f0e7] p-2 border border-[#cfc9bc]">
                            <Input
                              value={mem.name}
                              onChange={(e) => updateMember(idx, 'name', e.target.value)}
                              placeholder={`Member ${idx + 2} Name`}
                              className="text-xs bg-white text-[#141210] flex-1"
                              required
                            />
                            <Input
                              value={mem.phone || ''}
                              onChange={(e) => updateMember(idx, 'phone', e.target.value)}
                              placeholder="Phone (optional)"
                              className="text-xs bg-white text-[#141210] w-36"
                            />
                            <button
                              type="button"
                              onClick={() => removeMember(idx)}
                              className="text-[#c72c2c] p-1.5 hover:bg-[#ede7da]"
                              aria-label="Remove member"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Verification */}
                  {selectedSegment.registrationFee > 0 && (
                    <div className="border-t border-[#cfc9bc] pt-3 bg-[#f6f0e7] p-4 border border-dashed">
                      <h4 className="font-mono text-xs uppercase font-bold text-[#c94030] mb-2">Payment Verification</h4>
                      <p className="text-xs text-[#3a3530] mb-3 leading-relaxed">
                        Send registration fee <strong>৳ {selectedSegment.registrationFee}</strong> to our merchant/personal bKash/Nagad number:{' '}
                        <strong className="text-[#141210] font-mono">+880 1700-000000</strong> (Send Money / Payment) and enter the Transaction ID below:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono uppercase text-[#6b6258] block mb-1">Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full h-10 px-3 border border-[#cfc9bc] bg-white text-xs font-mono text-[#141210]"
                          >
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-mono uppercase text-[#6b6258] block mb-1">Transaction ID (TrxID) *</label>
                          <Input
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. 9J4K2L8MN"
                            required
                            className="text-xs font-mono bg-white text-[#141210]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end gap-3 border-t border-[#cfc9bc]">
                    <Button type="button" variant="secondary" onClick={() => setSelectedSegment(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={regSubmitting}>
                      {regSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                      {regSubmitting ? 'Submitting...' : 'Submit Registration'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
