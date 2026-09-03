'use client'

import { useState } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitRegistration } from '@/lib/firestore';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function EventRegistrationForm({ eventId, eventName }: { eventId: string, eventName: string }) {
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', class: '', roll: '', interest: '', motivation: '' 
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitRegistration({ type: 'event', eventId, ...formData });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during registration. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 border border-border bg-secondary text-center"
      >
        <CheckCircle className="w-12 h-12 text-success mb-4" />
        <h3 className="text-xl font-bold text-primary mb-2">Registration Submitted Successfully</h3>
        <p className="text-text-secondary">We look forward to seeing you at {eventName}.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl border border-border p-6 md:p-8 bg-secondary">
      <div>
        <h3 className="text-xl font-bold mb-1">Register for {eventName}</h3>
        <p className="text-sm text-text-secondary mb-6">Please fill out all required fields below.</p>
      </div>

      <Input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <Input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
      <Input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      
      <div className="grid grid-cols-2 gap-4">
        <Input required placeholder="Class/Section" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
        <Input required placeholder="Roll Number" value={formData.roll} onChange={e => setFormData({...formData, roll: e.target.value})} />
      </div>

      <Select required value={formData.interest} onChange={(e: any) => setFormData({...formData, interest: e.target.value})}>
        <option value="" disabled>Area of Interest</option>
        <option value="Mechanical">Mechanical</option>
        <option value="Electronics">Electronics</option>
        <option value="Programming">Programming</option>
        <option value="Design">Design</option>
      </Select>

      <Textarea required placeholder="Motivation (Why do you want to join?)" rows={4} value={formData.motivation} onChange={e => setFormData({...formData, motivation: e.target.value})} />
      
      {status === 'error' && <p className="text-danger text-sm">{errorMsg}</p>}
      
      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Submitting...' : 'Complete Registration'}
      </Button>
    </form>
  );
}
