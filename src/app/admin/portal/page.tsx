'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { getPortalConfig, updatePortalConfig, getApplications, getRegistrations, PortalConfig, Application, Registration } from '@/lib/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronLeft, Plus, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function AdminPortal() {
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [memberships, setMemberships] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sub-executive' | 'executive' | 'membership'>('sub-executive');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  // New role inputs
  const [newSubExecRole, setNewSubExecRole] = useState('');
  const [newExecRole, setNewExecRole] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleConfigChange = async (section: 'subExecOpen' | 'execOpen', value: boolean) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      [section]: value
    };
    
    setConfig(newConfig);
    try {
      await updatePortalConfig(newConfig);
    } catch (err: any) {
      alert('Failed to update config: ' + err.message);
      // Revert on error
      fetchData();
    }
  };

  const addRole = async (section: 'subExecRoles' | 'execRoles') => {
    if (!config) return;
    
    const roleToAdd = section === 'subExecRoles' ? newSubExecRole.trim() : newExecRole.trim();
    if (!roleToAdd) return;
    
    if (config[section].includes(roleToAdd)) {
      alert('Role already exists');
      return;
    }
    
    const newConfig = {
      ...config,
      [section]: [...config[section], roleToAdd]
    };
    
    setConfig(newConfig);
    if (section === 'subExecRoles') setNewSubExecRole('');
    else setNewExecRole('');
    
    try {
      await updatePortalConfig(newConfig);
    } catch (err: any) {
      alert('Failed to update config: ' + err.message);
      fetchData();
    }
  };

  const removeRole = async (section: 'subExecRoles' | 'execRoles', roleToRemove: string) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      [section]: config[section].filter(r => r !== roleToRemove)
    };
    
    setConfig(newConfig);
    try {
      await updatePortalConfig(newConfig);
    } catch (err: any) {
      alert('Failed to update config: ' + err.message);
      fetchData();
    }
  };

  const filteredApps = applications.filter(a => a.type === activeTab);

  return (
    <AdminGuard>
      <div className="pt-24 container-content min-h-screen pb-16 text-primary">
        <div className="mb-6">
          <Link href="/admin" className="text-secondary hover:text-accent font-mono text-sm flex items-center inline-flex">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-sans font-bold mb-8">Manage Portal</h1>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger font-mono text-sm">
            {error}
          </div>
        )}

        {loading || !config ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Config Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sub-Executive Config */}
              <div className="border border-border bg-secondary p-6">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                  <h2 className="text-xl font-sans font-bold">Sub-Executive Portal</h2>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={config.subExecOpen} 
                        onChange={(e) => handleConfigChange('subExecOpen', e.target.checked)} 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${config.subExecOpen ? 'bg-success' : 'bg-border'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-primary w-4 h-4 rounded-full transition-transform ${config.subExecOpen ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 font-mono text-sm uppercase text-secondary">
                      {config.subExecOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-mono text-sm uppercase text-secondary mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {config.subExecRoles.map(role => (
                      <div key={role} className="bg-primary border border-border px-3 py-1 flex items-center text-sm">
                        <span>{role}</span>
                        <button onClick={() => removeRole('subExecRoles', role)} className="ml-2 text-secondary hover:text-danger">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newSubExecRole} 
                      onChange={(e) => setNewSubExecRole(e.target.value)} 
                      placeholder="Add new role..." 
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && addRole('subExecRoles')}
                    />
                    <Button onClick={() => addRole('subExecRoles')} variant="secondary">Add</Button>
                  </div>
                </div>
              </div>

              {/* Executive Config */}
              <div className="border border-border bg-secondary p-6">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                  <h2 className="text-xl font-sans font-bold">Executive Portal</h2>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={config.execOpen} 
                        onChange={(e) => handleConfigChange('execOpen', e.target.checked)} 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${config.execOpen ? 'bg-success' : 'bg-border'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-primary w-4 h-4 rounded-full transition-transform ${config.execOpen ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 font-mono text-sm uppercase text-secondary">
                      {config.execOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-mono text-sm uppercase text-secondary mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {config.execRoles.map(role => (
                      <div key={role} className="bg-primary border border-border px-3 py-1 flex items-center text-sm">
                        <span>{role}</span>
                        <button onClick={() => removeRole('execRoles', role)} className="ml-2 text-secondary hover:text-danger">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newExecRole} 
                      onChange={(e) => setNewExecRole(e.target.value)} 
                      placeholder="Add new role..." 
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && addRole('execRoles')}
                    />
                    <Button onClick={() => addRole('execRoles')} variant="secondary">Add</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="border border-border bg-secondary mt-12">
              <div className="flex border-b border-border">
                <button 
                  className={`px-6 py-4 font-mono text-sm uppercase tracking-wider ${activeTab === 'sub-executive' ? 'bg-primary text-accent border-b-2 border-accent' : 'text-secondary hover:bg-primary/50'}`}
                  onClick={() => setActiveTab('sub-executive')}
                >
                  Sub-Executive Apps
                </button>
                <button 
                  className={`px-6 py-4 font-mono text-sm uppercase tracking-wider ${activeTab === 'executive' ? 'bg-primary text-accent border-b-2 border-accent' : 'text-secondary hover:bg-primary/50'}`}
                  onClick={() => setActiveTab('executive')}
                >
                  Executive Apps
                </button>
                <button 
                  className={`px-6 py-4 font-mono text-sm uppercase tracking-wider ${activeTab === 'membership' ? 'bg-primary text-accent border-b-2 border-accent' : 'text-secondary hover:bg-primary/50'}`}
                  onClick={() => setActiveTab('membership')}
                >
                  Memberships
                </button>
              </div>

              <div className="p-4">
                {(activeTab === 'sub-executive' || activeTab === 'executive') && (
                  filteredApps.length === 0 ? (
                    <div className="text-center py-10 text-secondary">No applications received yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs font-mono uppercase bg-primary text-secondary">
                          <tr>
                            <th className="px-4 py-3 border-b border-border">Applicant</th>
                            <th className="px-4 py-3 border-b border-border">ID / Section</th>
                            <th className="px-4 py-3 border-b border-border">Role Applied</th>
                            <th className="px-4 py-3 border-b border-border">Submitted</th>
                            <th className="px-4 py-3 border-b border-border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApps.map(app => (
                            <React.Fragment key={app.id}>
                              <tr className="border-b border-border hover:bg-primary/50">
                                <td className="px-4 py-3">
                                  <div className="font-bold">{app.email}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-secondary">
                                  {app.idNumber}<br/>{app.section}
                                </td>
                                <td className="px-4 py-3 text-accent font-bold">{app.roleApplyingFor}</td>
                                <td className="px-4 py-3 text-tertiary font-mono text-xs">
                                  {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    onClick={() => setExpandedAppId(expandedAppId === app.id ? null : (app.id || null))}
                                  >
                                    {expandedAppId === app.id ? 'Hide Details' : 'View Details'}
                                  </Button>
                                </td>
                              </tr>
                              {expandedAppId === app.id && (
                                <tr className="bg-primary/30">
                                  <td colSpan={5} className="px-6 py-4 border-b border-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h4 className="font-mono text-xs uppercase text-secondary mb-2">Experience</h4>
                                        <div className="bg-secondary p-3 border border-border whitespace-pre-wrap text-sm">
                                          {app.pastExperience}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-mono text-xs uppercase text-secondary mb-2">Vision Statement</h4>
                                        <div className="bg-secondary p-3 border border-border whitespace-pre-wrap text-sm">
                                          {app.visionStatement}
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
                    <div className="text-center py-10 text-secondary">No membership registrations received yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs font-mono uppercase bg-primary text-secondary">
                          <tr>
                            <th className="px-4 py-3 border-b border-border">Name</th>
                            <th className="px-4 py-3 border-b border-border">Email</th>
                            <th className="px-4 py-3 border-b border-border">Phone</th>
                            <th className="px-4 py-3 border-b border-border">Class / Section</th>
                            <th className="px-4 py-3 border-b border-border">Blood Group</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberships.map(mem => (
                            <tr key={mem.id} className="border-b border-border hover:bg-primary/50">
                              <td className="px-4 py-3 font-bold">{mem.name}</td>
                              <td className="px-4 py-3 text-secondary">{mem.email}</td>
                              <td className="px-4 py-3 font-mono text-secondary">{mem.phone}</td>
                              <td className="px-4 py-3 text-secondary">{mem.classSection}</td>
                              <td className="px-4 py-3 text-danger">{mem.bloodGroup || 'N/A'}</td>
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
    </AdminGuard>
  );
}
