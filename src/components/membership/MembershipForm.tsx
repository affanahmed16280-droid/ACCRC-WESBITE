'use client'

import { useState } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitRegistration } from '@/lib/firestore';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function MembershipForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', classSection: '', rollNumber: '', areaOfInterest: '', motivation: '' 
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = () => {
    // Basic client validation
    if (step === 1 && (!formData.name || !formData.email || !formData.phone)) return;
    if (step === 2 && (!formData.classSection || !formData.rollNumber || !formData.areaOfInterest)) return;
    setStep(s => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.motivation) return;
    
    setStatus('loading');
    try {
      await submitRegistration({ type: 'membership', ...formData });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 border border-border bg-secondary text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle className="w-16 h-16 text-accent mb-6" />
        </motion.div>
        <h3 className="text-2xl font-bold text-primary mb-3">Application Submitted</h3>
        <p className="text-text-secondary mb-8 max-w-md">
          Thank you for applying to ACCRC. We will review your application and contact you soon via email.
        </p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="border border-border bg-secondary p-6 md:p-10 w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border z-0" />
        {[1, 2, 3].map((num) => (
          <div key={num} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono transition-all duration-300
              ${step > num ? 'bg-accent text-primary border-accent' : 
                step === num ? 'bg-primary text-accent border-accent shadow-[0_0_10px_rgba(10,132,255,0.5)]' : 
                'bg-secondary text-text-tertiary border-border'} border`}
            >
              {num}
            </div>
            <span className={`text-xs absolute -bottom-6 whitespace-nowrap ${step >= num ? 'text-text-secondary' : 'text-text-tertiary'}`}>
              {num === 1 ? 'Personal' : num === 2 ? 'Academic' : 'Motivation'}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <Input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <Input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input required placeholder="Class/Section" value={formData.classSection} onChange={e => setFormData({...formData, classSection: e.target.value})} />
                <Input required placeholder="Roll Number" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
              </div>
              <Select 
                required 
                value={formData.areaOfInterest} 
                onChange={(e: any) => setFormData({...formData, areaOfInterest: e.target.value})}
                placeholder="Primary Area of Interest"
                options={[
                  { value: "Mechanical", label: "Mechanical" },
                  { value: "Electronics", label: "Electronics" },
                  { value: "Programming", label: "Programming" },
                  { value: "Design", label: "Design" }
                ]}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <Textarea 
                required 
                placeholder="Why do you want to join ACCRC? What do you hope to learn or build?" 
                rows={5} 
                value={formData.motivation} 
                onChange={e => setFormData({...formData, motivation: e.target.value})} 
              />
              {status === 'error' && <p className="text-danger text-sm">{errorMsg}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          <Button type="button" onClick={handleBack} disabled={step === 1 || status === 'loading'} className="opacity-50 hover:opacity-100 transition-opacity">
            Back
          </Button>
          
          {step < 3 ? (
            <Button type="button" onClick={handleNext}>Next Step</Button>
          ) : (
            <Button type="submit" disabled={status === 'loading'} className="min-w-[120px]">
              {status === 'loading' ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
