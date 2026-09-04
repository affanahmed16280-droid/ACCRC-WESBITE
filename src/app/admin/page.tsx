'use client';

import { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';
import { Event, News, getAllEvents, addEvent, updateEvent, deleteEvent, getPublishedNews, addNews, updateNews } from '@/lib/eventsDb';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    tag: '',
    title: '',
    venue: '',
    date: '',
    status: 'DRAFT' as const,
    published: false,
    description: '',
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadEvents();
    }
  }, [isLoggedIn]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    // Validate against hardcoded credentials
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@accrc.edu';
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
      setIsLoggedIn(true);
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEvents([]);
    setNews([]);
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEvent && editingEvent.id) {
        await updateEvent(editingEvent.id, formData);
      } else {
        await addEvent({ ...formData, date: new Date(formData.date) });
      }
      loadEvents();
      setShowForm(false);
      setEditingEvent(null);
      setFormData({ tag: '', title: '', venue: '', date: '', status: 'DRAFT', published: false, description: '' });
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      tag: event.tag,
      title: event.title,
      venue: event.venue,
      date: event.date instanceof Date ? event.date.toISOString().split('T')[0] : '',
      status: event.status,
      published: event.published,
      description: event.description || '',
    });
    setShowForm(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      await deleteEvent(id);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishEvent = async (id: string, published: boolean) => {
    setLoading(true);
    try {
      await updateEvent(id, { published: !published, status: !published ? 'PUBLISHED' : 'DRAFT' });
      loadEvents();
    } catch (error) {
      console.error('Error publishing event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>ADMIN DASHBOARD</h1>
          <p className="mono">ACCRC Management Portal</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <LogOut size={18} /> LOGOUT
        </button>
      </div>

      <div className="admin-nav">
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          EVENTS
        </button>
        <button
          className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          NEWS & UPDATES
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'events' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>UPCOMING EVENTS</h2>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setFormData({ tag: '', title: '', venue: '', date: '', status: 'DRAFT', published: false, description: '' });
                  setShowForm(!showForm);
                }}
                className="primary-button"
              >
                <Plus size={16} /> NEW EVENT
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmitEvent} className="admin-form">
                <input
                  type="text"
                  placeholder="Event Tag (e.g., Flagship Competition)"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Event Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <span>Publish to Website</span>
                </label>
                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={loading}>
                    {editingEvent ? 'UPDATE' : 'CREATE'} EVENT
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="outline-button"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}

            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-item-header">
                    <div>
                      <h3>{event.title}</h3>
                      <p className="mono" style={{ fontSize: '12px', color: '#999' }}>{event.tag}</p>
                    </div>
                    <div className="event-item-status">
                      <span className={`status-badge ${event.published ? 'published' : 'draft'}`}>
                        {event.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: '#aaa', marginTop: '8px' }}>{event.venue}</p>
                  <div className="event-item-actions">
                    <button
                      onClick={() => handlePublishEvent(event.id!, event.published)}
                      className="icon-button"
                      title={event.published ? 'Unpublish' : 'Publish'}
                    >
                      {event.published ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="icon-button"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id!)}
                      className="icon-button delete"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
