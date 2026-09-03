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

  const handleConfigChange = async (section: 'subExecutive' | 'executive', field: 'isOpen', value: boolean) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
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

  const addRole = async (section: 'subExecutive' | 'executive') => {
    if (!config) return;
    
    const roleToAdd = section === 'subExecutive' ? newSubExecRole.trim() : newExecRole.trim();
    if (!roleToAdd) return;
    
    if (config[section].roles.includes(roleToAdd)) {
      alert('Role already exists');
      return;
    }
    
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        roles: [...config[section].roles, roleToAdd]
      }
    };
    
    setConfig(newConfig);
    if (section === 'subExecutive') setNewSubExecRole('');
    else setNewExecRole('');
    
    try {
      await updatePortalConfig(newConfig);
    } catch (err: any) {
      alert('Failed to update config: ' + err.message);
      fetchData();
    }
  };

  const removeRole = async (section: 'subExecutive' | 'executive', roleToRemove: string) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      [section]: {
        ...config[section],
        roles: config[section].roles.filter(r => r !== roleToRemove)
      }
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
                        checked={config.subExecutive.isOpen} 
                        onChange={(e) => handleConfigChange('subExecutive', 'isOpen', e.target.checked)} 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${config.subExecutive.isOpen ? 'bg-success' : 'bg-border'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-primary w-4 h-4 rounded-full transition-transform ${config.subExecutive.isOpen ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 font-mono text-sm uppercase text-secondary">
                      {config.subExecutive.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-mono text-sm uppercase text-secondary mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {config.subExecutive.roles.map(role => (
                      <div key={role} className="bg-primary border border-border px-3 py-1 flex items-center text-sm">
                        <span>{role}</span>
                        <button onClick={() => removeRole('subExecutive', role)} className="ml-2 text-secondary hover:text-danger">
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
                      onKeyDown={(e) => e.key === 'Enter' && addRole('subExecutive')}
                    />
                    <Button onClick={() => addRole('subExecutive')} variant="outline">Add</Button>
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
                        checked={config.executive.isOpen} 
                        onChange={(e) => handleConfigChange('executive', 'isOpen', e.target.checked)} 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${config.executive.isOpen ? 'bg-success' : 'bg-border'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-primary w-4 h-4 rounded-full transition-transform ${config.executive.isOpen ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="ml-3 font-mono text-sm uppercase text-secondary">
                      {config.executive.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-mono text-sm uppercase text-secondary mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {config.executive.roles.map(role => (
                      <div key={role} className="bg-primary border border-border px-3 py-1 flex items-center text-sm">
                        <span>{role}</span>
                        <button onClick={() => removeRole('executive', role)} className="ml-2 text-secondary hover:text-danger">
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
                      onKeyDown={(e) => e.key === 'Enter' && addRole('executive')}
                    />
                    <Button onClick={() => addRole('executive')} variant="outline">Add</Button>
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
                                  <div className="font-bold">{app.name}</div>
                                  <div className="text-secondary text-xs">{app.email}</div>
                                  <div className="text-secondary text-xs">{app.phone}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-secondary">
                                  {app.studentId}<br/>{app.classInfo} / {app.section}
                                </td>
                                <td className="px-4 py-3 text-accent font-bold">{app.role}</td>
                                <td className="px-4 py-3 text-tertiary font-mono text-xs">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
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
                                          {app.experience}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-mono text-xs uppercase text-secondary mb-2">Vision Statement</h4>
                                        <div className="bg-secondary p-3 border border-border whitespace-pre-wrap text-sm">
                                          {app.vision}
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
                              <td className="px-4 py-3 text-secondary">{mem.classInfo} / {mem.section}</td>
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
