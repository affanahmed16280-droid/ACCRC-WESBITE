'use client';

import React, { useEffect, useState } from 'react';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { Card } from '@/components/ui/Card';
import { ApplicationForm } from '@/components/portal/ApplicationForm';
import { subscribeToPortalConfig, type PortalConfig } from '@/lib/firestore';
import { Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_SUB_EXEC_ROLES = [
  'Sub-Executive (Electronics)',
  'Sub-Executive (Programming)',
  'Sub-Executive (Mechanical)',
  'Sub-Executive (Design)',
  'Sub-Executive (Media & PR)'
];

const DEFAULT_EXEC_ROLES = [
  'President',
  'Vice President',
  'General Secretary',
  'Treasurer',
  'Technical Director'
];

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<'sub-executive' | 'executive'>('sub-executive');
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPortalConfig((data) => {
      setConfig(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSuccess = () => {
    setSuccess(true);
    // Reset success state after a while or leave it
  };

  const isSubExecOpen = config?.subExecOpen ?? false;
  const isExecOpen = config?.execOpen ?? false;

  const currentRoles = activeTab === 'sub-executive' 
    ? (config?.subExecRoles?.length ? config.subExecRoles : DEFAULT_SUB_EXEC_ROLES)
    : (config?.execRoles?.length ? config.execRoles : DEFAULT_EXEC_ROLES);
    
  const isOpen = activeTab === 'sub-executive' ? isSubExecOpen : isExecOpen;

  return (
    <main className="pt-24 section-padding container-content min-h-screen">
      <SectionReveal>
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <div className="mono-label text-accent mb-2">PORTAL</div>
          <h1 className="text-display-md font-bold text-text-primary mb-4">Executive Applications</h1>
          <p className="text-body-lg text-text-secondary">
            Apply for leadership positions within ACCRC. Executive and sub-executive roles are open during specific application windows.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal>
        <div className="max-w-2xl mx-auto">
          {/* Tabs */}
          <div className="flex border-b border-border mb-8">
            <button
              onClick={() => { setActiveTab('sub-executive'); setSuccess(false); }}
              className={`flex-1 py-4 text-center font-bold text-body-md transition-colors ${
                activeTab === 'sub-executive' 
                  ? 'border-b-2 border-accent text-text-primary' 
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Sub-Executive
            </button>
            <button
              onClick={() => { setActiveTab('executive'); setSuccess(false); }}
              className={`flex-1 py-4 text-center font-bold text-body-md transition-colors ${
                activeTab === 'executive' 
                  ? 'border-b-2 border-accent text-text-primary' 
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Executive
            </button>
          </div>

          <Card className="p-6 sm:p-8">
            {loading ? (
              <div className="text-center py-12 text-text-secondary animate-pulse">
                Loading configuration...
              </div>
            ) : success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-display-xs font-bold text-text-primary mb-2">Application Submitted!</h3>
                <p className="text-body-sm text-text-secondary">
                  Thank you for applying. We will review your application and get back to you soon.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-accent hover:underline text-body-sm"
                >
                  Submit another application
                </button>
              </motion.div>
            ) : !isOpen ? (
              <div className="text-center py-16">
                <Lock className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-display-xs font-bold text-text-primary mb-2">Applications Closed</h3>
                <p className="text-body-sm text-text-secondary max-w-md mx-auto">
                  Applications for {activeTab} positions are currently closed. Check back when the next application window opens.
                </p>
              </div>
            ) : (
              <ApplicationForm 
                type={activeTab} 
                roles={currentRoles} 
                onSuccess={handleSuccess} 
              />
            )}
          </Card>
        </div>
      </SectionReveal>
    </main>
  );
}
