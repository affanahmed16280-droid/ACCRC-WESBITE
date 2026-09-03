'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { getEvents, createEvent, updateEvent, deleteEvent, getRegistrations, FirestoreEvent, Registration } from '@/lib/firestore';
import { getEventStatus } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, Registration[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    registrationOpensAt: '',
    registrationClosesAt: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }

  async function loadRegistrations(eventId: string) {
    if (registrations[eventId]) {
      setExpandedEventId(expandedEventId === eventId ? null : eventId);
      return;
    }
    
    try {
      const regs = await getRegistrations({ eventId });
      setRegistrations(prev => ({ ...prev, [eventId]: regs }));
      setExpandedEventId(expandedEventId === eventId ? null : eventId);
    } catch (err) {
      console.error('Failed to load registrations', err);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      location: '',
      registrationOpensAt: '',
      registrationClosesAt: '',
      imageUrl: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const toDatetimeLocal = (date: Date) => {
    if (!date) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const handleEdit = (event: FirestoreEvent) => {
    setFormData({
      name: event.name,
      description: event.description,
      date: toDatetimeLocal(event.date),
      location: event.location,
      registrationOpensAt: event.registrationOpensAt ? toDatetimeLocal(event.registrationOpensAt) : '',
      registrationClosesAt: event.registrationClosesAt ? toDatetimeLocal(event.registrationClosesAt) : '',
      imageUrl: event.imageUrl || ''
    });
    setEditingId(event.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(id);
        setEvents(events.filter(e => e.id !== id));
      } catch (err: any) {
        alert('Failed to delete event: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date),
        registrationOpensAt: new Date(formData.registrationOpensAt),
        registrationClosesAt: new Date(formData.registrationClosesAt)
      };

      if (editingId) {
        await updateEvent(editingId, payload);
      } else {
        await createEvent(payload);
      }
      await fetchEvents();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="pt-24 container-content min-h-screen pb-16 text-primary">
        <div className="mb-6">
          <Link href="/admin" className="text-secondary hover:text-accent font-mono text-sm flex items-center inline-flex">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-sans font-bold">Manage Events</h1>
          <Button onClick={() => setIsFormOpen(!isFormOpen)} variant={isFormOpen ? 'secondary' : 'primary'}>
            {isFormOpen ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Create New Event</>}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger font-mono text-sm">
            {error}
          </div>
        )}

        {isFormOpen && (
          <div className="bg-secondary border border-border p-6 mb-8">
            <h2 className="text-xl font-sans font-bold mb-4 border-b border-border pb-2">
              {editingId ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-secondary uppercase">Name</label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} required className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-secondary uppercase">Location</label>
                  <Input name="location" value={formData.location} onChange={handleInputChange} required className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-secondary uppercase">Event Date/Time</label>
                  <Input type="datetime-local" name="date" value={formData.date} onChange={handleInputChange} required className="w-full bg-secondary border-border text-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-secondary uppercase">Image URL (Optional)</label>
                  <Input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-secondary uppercase">Registration Opens</label>
                  <Input type="datetime-local" name="registrationOpensAt" value={formData.registrationOpensAt} onChange={handleInputChange} className="w-full bg-secondary border-border text-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-secondary uppercase">Registration Closes</label>
                  <Input type="datetime-local" name="registrationClosesAt" value={formData.registrationClosesAt} onChange={handleInputChange} className="w-full bg-secondary border-border text-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-secondary uppercase">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full h-32 bg-primary border border-border p-3 text-primary focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {formLoading ? 'Saving...' : 'Save Event'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-10 text-secondary border border-border bg-secondary">
                No events found. Create one to get started.
              </div>
            ) : (
              events.map((event) => {
                const statusInfo = getEventStatus(event.registrationOpensAt, event.registrationClosesAt);
                const isExpanded = expandedEventId === event.id;
                const eventRegs = registrations[event.id] || [];

                return (
                  <div key={event.id} className="border border-border bg-secondary overflow-hidden">
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-sans font-bold text-accent">{event.name}</h3>
                        <div className="text-sm text-secondary font-mono mt-1 space-x-4">
                          <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                          <span>Status: <span className="text-primary">{statusInfo.label}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => loadRegistrations(event.id)}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                          {isExpanded ? 'Hide Regs' : 'View Regs'}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(event)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm" className="text-danger border-danger/50 hover:bg-danger/10" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border bg-primary p-4">
                        <h4 className="font-mono text-sm uppercase text-secondary mb-3">Registrations ({eventRegs.length})</h4>
                        {eventRegs.length === 0 ? (
                          <div className="text-sm text-tertiary italic">No registrations yet.</div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs font-mono uppercase bg-secondary text-secondary">
                                <tr>
                                  <th className="px-4 py-2 border-b border-border">Name</th>
                                  <th className="px-4 py-2 border-b border-border">Email</th>
                                  <th className="px-4 py-2 border-b border-border">Class/Sec</th>
                                  <th className="px-4 py-2 border-b border-border">Submitted</th>
                                </tr>
                              </thead>
                              <tbody>
                                {eventRegs.map((reg) => (
                                  <tr key={reg.id} className="border-b border-border/50 hover:bg-secondary/50 font-mono text-xs">
                                    <td className="px-4 py-2 text-primary">{reg.name}</td>
                                    <td className="px-4 py-2 text-secondary">{reg.email}</td>
                                    <td className="px-4 py-2 text-secondary">{reg.classSection || '-'}</td>
                                    <td className="px-4 py-2 text-tertiary">
                                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
