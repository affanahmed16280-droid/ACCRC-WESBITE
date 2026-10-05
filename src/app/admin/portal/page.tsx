'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { getPortalConfig, updatePortalConfig, getApplications, getRegistrations, deleteApplication, deleteRegistration, PortalConfig, Application, Registration } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft, Plus, X, ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { DeleteModal } from '@/components/admin/DeleteModal';

export default function AdminPortal() {
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [memberships, setMemberships] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sub-executive' | 'executive' | 'prefect' | 'membership'>('sub-executive');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'application' | 'membership' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [configSaving, setConfigSaving] = useState<string | null>(null);

  const [newRoles, setNewRoles] = useState({
    subExecRoles: '',
    execRoles: '',
    prefectRoles: '',
  });

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'membership' || tabParam === 'executive' || tabParam === 'prefect' || tabParam === 'sub-executive') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab: 'sub-executive' | 'executive' | 'prefect' | 'membership') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
  };

  async function fetchData() {
    try {
      setLoading(true);
      const [conf, apps, mems] = await Promise.all([
        getPortalConfig(),
        getApplications(),
        getRegistrations({ type: 'membership' })
      ]);
      setConfig(conf);
      setApplications(apps);
      setMemberships(mems);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portal data');
    } finally {
      setLoading(false);
    }
  }

  const handleConfigChange = async (section: 'subExecOpen' | 'execOpen' | 'prefectOpen', value: boolean) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      [section]: value
    };
    setConfig(newConfig);
    setConfigSaving(section);
    setError(null);
    try {
      await updatePortalConfig(newConfig);
    } catch (err: any) {
      setError('Failed to update application status: ' + err.message);
      // Revert on error
      fetchData();
    } finally {
      setConfigSaving(null);
    }
  };

  const addRole = async (section: 'subExecRoles' | 'execRoles' | 'prefectRoles') => {
    if (!config) return;
    
    const roleToAdd = newRoles[section].trim();
    if (!roleToAdd) return;
    
    if (config[section].includes(roleToAdd)) {
      setError('That role is already listed.');
      return;
    }
    
    const newConfig = {
      ...config,
      [section]: [...config[section], roleToAdd]
    };
    
    setConfig(newConfig);
    setNewRoles((current) => ({ ...current, [section]: '' }));
    setConfigSaving(section);
    setError(null);
    try {
      await updatePortalConfig(newConfig);
    } catch (err: any) {
      setError('Failed to add role: ' + err.message);
      fetchData();
    } finally {
      setConfigSaving(null);
    }
  };

  const removeRole = async (section: 'subExecRoles' | 'execRoles' | 'prefectRoles', roleToRemove: string) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      [section]: config[section].filter(r => r !== roleToRemove)
    };
    
    setConfig(newConfig);
    setConfigSaving(section);
    setError(null);
    try {
      await updatePortalConfig(newConfig);
    } catch (err: any) {
      setError('Failed to remove role: ' + err.message);
      fetchData();
    } finally {
      setConfigSaving(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const deletedRecord = deleteTarget;
    setIsDeleting(true);
    if (deletedRecord.type === 'application') {
      setApplications((prev) => prev.filter((application) => application.id !== deletedRecord.id));
    } else {
      setMemberships((prev) => prev.filter((membership) => membership.id !== deletedRecord.id));
    }
    try {
      if (deletedRecord.type === 'application') {
        await deleteApplication(deletedRecord.id);
      } else {
        await deleteRegistration(deletedRecord.id);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      await fetchData();
      setError(err.message || 'Failed to delete record');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredApps = applications.filter(a => a.type === activeTab);

  return (
    <AdminGuard>
      <div className="pt-24 container-content min-h-screen pb-16 text-[#141210]">
        <div className="mb-6">
          <Link href="/admin" className="text-[#6b6258] hover:text-[#c94030] font-mono text-sm flex items-center inline-flex">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-sans font-bold mb-8 text-[#141210]">Manage Portal</h1>

        {error && (
          <div className="mb-6 p-4 bg-[#c72c2c]/10 border border-[#c72c2c]/20 text-[#c72c2c] font-mono text-sm rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#c94030]" />
          </div>
        ) : !config ? (
          <div className="border border-[#c72c2c]/30 bg-[#c72c2c]/10 p-6 text-[#c72c2c]" role="alert">
            Portal settings could not be loaded. Please refresh and try again.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Config Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sub-Executive Config */}
              <div className="border border-[#cfc9bc] bg-[#ede7da] p-6">
                <div className="flex justify-between items-center mb-6 border-b border-[#cfc9bc] pb-4">
                  <h2 className="text-xl font-sans font-bold text-[#141210]">Sub-Executive Portal</h2>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={config.subExecOpen} 
                        disabled={configSaving !== null}
                        aria-label="Toggle sub-executive applications"
                        onChange={(e) => void handleConfigChange('subExecOpen', e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${config.subExecOpen ? 'bg-[#c94030]' : 'bg-[#cfc9bc]'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.subExecOpen ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 font-mono text-sm uppercase text-[#141210] font-semibold">
                      {config.subExecOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#141210] font-bold mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {config.subExecRoles.map(role => (
                      <div key={role} className="bg-[#f6f0e7] border border-[#cfc9bc] px-3 py-1 flex items-center text-sm text-[#141210] font-mono">
                        <span>{role}</span>
                        <button type="button" disabled={configSaving !== null} onClick={() => void removeRole('subExecRoles', role)} className="ml-2 text-[#6b6258] hover:text-[#c72c2c] disabled:cursor-wait" aria-label={`Remove ${role}`}>
                          {configSaving === 'subExecRoles' ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden /> : <X className="w-3 h-3" aria-hidden />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newRoles.subExecRoles}
                      onChange={(e) => setNewRoles((current) => ({ ...current, subExecRoles: e.target.value }))}
                      placeholder="Add new role..." 
                      className="flex-1 text-[#141210]"
                      onKeyDown={(e) => e.key === 'Enter' && addRole('subExecRoles')}
                      disabled={configSaving !== null}
                    />
                    <Button type="button" onClick={() => void addRole('subExecRoles')} variant="secondary" loading={configSaving === 'subExecRoles'} disabled={configSaving !== null}>Add</Button>
                  </div>
                </div>
              </div>

              {/* Executive Config */}
              <div className="border border-[#cfc9bc] bg-[#ede7da] p-6">
                <div className="flex justify-between items-center mb-6 border-b border-[#cfc9bc] pb-4">
                  <h2 className="text-xl font-sans font-bold text-[#141210]">Executive Portal</h2>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={config.execOpen} 
                        disabled={configSaving !== null}
                        aria-label="Toggle executive applications"
                        onChange={(e) => void handleConfigChange('execOpen', e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${config.execOpen ? 'bg-[#c94030]' : 'bg-[#cfc9bc]'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.execOpen ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 font-mono text-sm uppercase text-[#141210] font-semibold">
                      {config.execOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#141210] font-bold mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {config.execRoles.map(role => (
                      <div key={role} className="bg-[#f6f0e7] border border-[#cfc9bc] px-3 py-1 flex items-center text-sm text-[#141210] font-mono">
                        <span>{role}</span>
                        <button type="button" disabled={configSaving !== null} onClick={() => void removeRole('execRoles', role)} className="ml-2 text-[#6b6258] hover:text-[#c72c2c] disabled:cursor-wait" aria-label={`Remove ${role}`}>
                          {configSaving === 'execRoles' ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden /> : <X className="w-3 h-3" aria-hidden />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newRoles.execRoles}
                      onChange={(e) => setNewRoles((current) => ({ ...current, execRoles: e.target.value }))}
                      placeholder="Add new role..." 
                      className="flex-1 text-[#141210]"
                      onKeyDown={(e) => e.key === 'Enter' && addRole('execRoles')}
                      disabled={configSaving !== null}
                    />
                    <Button type="button" onClick={() => void addRole('execRoles')} variant="secondary" loading={configSaving === 'execRoles'} disabled={configSaving !== null}>Add</Button>
                  </div>
                </div>
              </div>

              {/* Prefect Config */}
              <div className="border border-[#cfc9bc] bg-[#ede7da] p-6">
                <div className="flex justify-between items-center mb-6 border-b border-[#cfc9bc] pb-4">
                  <h2 className="text-xl font-sans font-bold text-[#141210]">Prefect Application</h2>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={config.prefectOpen}
                        disabled={configSaving !== null}
                        aria-label="Toggle prefect applications"
                        onChange={(e) => void handleConfigChange('prefectOpen', e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${config.prefectOpen ? 'bg-[#c94030]' : 'bg-[#cfc9bc]'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.prefectOpen ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 font-mono text-sm uppercase text-[#141210] font-semibold">
                      {config.prefectOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>
                </div>

                <div className="mb-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#141210] font-bold mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {config.prefectRoles.map(role => (
                      <div key={role} className="bg-[#f6f0e7] border border-[#cfc9bc] px-3 py-1 flex items-center text-sm text-[#141210] font-mono">
                        <span>{role}</span>
                        <button type="button" disabled={configSaving !== null} onClick={() => void removeRole('prefectRoles', role)} className="ml-2 text-[#6b6258] hover:text-[#c72c2c] disabled:cursor-wait" aria-label={`Remove ${role}`}>
                          {configSaving === 'prefectRoles' ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden /> : <X className="w-3 h-3" aria-hidden />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newRoles.prefectRoles}
                      onChange={(e) => setNewRoles((current) => ({ ...current, prefectRoles: e.target.value }))}
                      placeholder="Add new role..."
                      className="flex-1 text-[#141210]"
                      onKeyDown={(e) => e.key === 'Enter' && addRole('prefectRoles')}
                      disabled={configSaving !== null}
                    />
                    <Button type="button" onClick={() => void addRole('prefectRoles')} variant="secondary" loading={configSaving === 'prefectRoles'} disabled={configSaving !== null}>Add</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="border border-[#cfc9bc] bg-[#ede7da] mt-12">
              <div className="flex overflow-x-auto border-b border-[#cfc9bc]" role="tablist" aria-label="Application type">
                <button 
                  role="tab"
                  aria-selected={activeTab === 'sub-executive'}
                  className={`shrink-0 px-4 py-4 font-mono text-xs uppercase tracking-wider sm:px-6 sm:text-sm font-semibold transition-colors ${activeTab === 'sub-executive' ? 'bg-[#141210] text-[#c94030] border-b-2 border-[#c94030]' : 'text-[#6b6258] hover:text-[#141210] hover:bg-[#e6dfd1]'}`}
                  onClick={() => handleTabChange('sub-executive')}
                >
                  Sub-Executive Apps
                </button>
                <button 
                  role="tab"
                  aria-selected={activeTab === 'executive'}
                  className={`shrink-0 px-4 py-4 font-mono text-xs uppercase tracking-wider sm:px-6 sm:text-sm font-semibold transition-colors ${activeTab === 'executive' ? 'bg-[#141210] text-[#c94030] border-b-2 border-[#c94030]' : 'text-[#6b6258] hover:text-[#141210] hover:bg-[#e6dfd1]'}`}
                  onClick={() => handleTabChange('executive')}
                >
                  Executive Apps
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'prefect'}
                  className={`shrink-0 px-4 py-4 font-mono text-xs uppercase tracking-wider sm:px-6 sm:text-sm font-semibold transition-colors ${activeTab === 'prefect' ? 'bg-[#141210] text-[#c94030] border-b-2 border-[#c94030]' : 'text-[#6b6258] hover:text-[#141210] hover:bg-[#e6dfd1]'}`}
                  onClick={() => handleTabChange('prefect')}
                >
                  Prefect Apps
                </button>
                <button 
                  role="tab"
                  aria-selected={activeTab === 'membership'}
                  className={`shrink-0 px-4 py-4 font-mono text-xs uppercase tracking-wider sm:px-6 sm:text-sm font-semibold transition-colors ${activeTab === 'membership' ? 'bg-[#141210] text-[#c94030] border-b-2 border-[#c94030]' : 'text-[#6b6258] hover:text-[#141210] hover:bg-[#e6dfd1]'}`}
                  onClick={() => handleTabChange('membership')}
                >
                  Membership Requests ({memberships.length})
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {(activeTab === 'sub-executive' || activeTab === 'executive' || activeTab === 'prefect') && (
                  filteredApps.length === 0 ? (
                    <div className="text-center py-12 text-[#6b6258] font-mono text-sm">No applications received yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs font-mono uppercase bg-[#141210] text-white">
                          <tr>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Applicant</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">ID / Section</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">WhatsApp</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Role Applied</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Submitted</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApps.map(app => (
                            <React.Fragment key={app.id}>
                              <tr className="border-b border-[#cfc9bc] hover:bg-[#e6dfd1]/60 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-bold text-[#141210]">{app.name || 'Name not provided'}</div>
                                  <div className="mt-0.5 text-xs text-[#6b6258]">{app.email}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-[#3a3530]">
                                  {app.idNumber}<br/>{app.section}
                                </td>
                                <td className="px-4 py-3 font-mono text-[#3a3530] text-xs">
                                  {app.whatsapp || '—'}
                                </td>
                                <td className="px-4 py-3 text-[#c94030] font-bold">{app.roleApplyingFor}</td>
                                <td className="px-4 py-3 text-[#6b6258] font-mono text-xs">
                                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setExpandedAppId(expandedAppId === app.id ? null : (app.id || null))}
                                    >
                                      {expandedAppId === app.id ? 'Hide' : 'View'}
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      aria-label={`Delete application from ${app.name || app.email}`}
                                      onClick={() => setDeleteTarget({ id: app.id!, name: app.name || app.email, type: 'application' })}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                              {expandedAppId === app.id && (
                                <tr className="bg-[#e6dfd1]/40">
                                  <td colSpan={6} className="px-6 py-4 border-b border-[#cfc9bc]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#141210]">
                                      <div>
                                        <h4 className="font-mono text-xs uppercase font-bold text-[#141210] mb-2">Contact details</h4>
                                        <div className="bg-[#ede7da] p-3 border border-[#cfc9bc] text-sm leading-relaxed">
                                          <p><span className="font-semibold text-[#6b6258]">Email:</span> {app.email}</p>
                                          <p><span className="font-semibold text-[#6b6258]">WhatsApp:</span> {app.whatsapp || 'Not provided'}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-mono text-xs uppercase font-bold text-[#141210] mb-2">Experience</h4>
                                        <div className="bg-[#ede7da] p-3 border border-[#cfc9bc] whitespace-pre-wrap text-sm text-[#3a3530]">
                                          {app.pastExperience || 'None specified'}
                                        </div>
                                      </div>
                                      <div className="md:col-span-2">
                                        <h4 className="font-mono text-xs uppercase font-bold text-[#141210] mb-2">Vision Statement</h4>
                                        <div className="bg-[#ede7da] p-3 border border-[#cfc9bc] whitespace-pre-wrap text-sm text-[#3a3530]">
                                          {app.visionStatement || 'None specified'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {activeTab === 'membership' && (
                  memberships.length === 0 ? (
                    <div className="text-center py-12 text-[#6b6258] font-mono text-sm">No membership registrations received yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs font-mono uppercase bg-[#141210] text-white">
                          <tr>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Name</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Email</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">WhatsApp</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Class / Section</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">College ID</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Reason for joining</th>
                            <th className="px-4 py-3 border-b border-[#cfc9bc]">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberships.map(mem => (
                            <tr key={mem.id} className="border-b border-[#cfc9bc] hover:bg-[#e6dfd1]/60 transition-colors">
                              <td className="px-4 py-3 font-bold text-[#141210]">{mem.name}</td>
                              <td className="px-4 py-3 text-[#3a3530]">{mem.email}</td>
                              <td className="px-4 py-3 font-mono text-[#3a3530] text-xs">{mem.whatsapp || '—'}</td>
                              <td className="px-4 py-3 text-[#3a3530]">{mem.classSection}</td>
                              <td className="px-4 py-3 font-mono text-[#141210] font-semibold">{mem.collegeId || mem.rollNumber || 'N/A'}</td>
                              <td className="px-4 py-3 text-[#3a3530] max-w-sm whitespace-pre-wrap leading-relaxed">{mem.motivation || 'N/A'}</td>
                              <td className="px-4 py-3">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  aria-label={`Delete membership application from ${mem.name}`}
                                  onClick={() => setDeleteTarget({ id: mem.id!, name: mem.name, type: 'membership' })}
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <DeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'application' ? 'Delete application?' : 'Delete membership?'}
        description={deleteTarget ? `Are you sure you want to permanently delete the record for "${deleteTarget.name}"? This action cannot be undone.` : ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminGuard>
  );
}
