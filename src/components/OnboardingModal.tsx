'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Rocket, CalendarDays, UserCheck, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'hasSeenOnboarding';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  accentLabel: string;
}

const steps: Step[] = [
  {
    icon: Rocket,
    title: 'Welcome to ACCRC',
    description:
      'Adamjee Cantonment College Robotics Club — a student-led robotics community where we innovate, build hardware prototypes, and compete nationally and globally.',
    accentLabel: '01 / INTRO',
  },
  {
    icon: CalendarDays,
    title: 'Events & National Fest',
    description:
      'Browse upcoming workshops, bootcamps, and National Robotics Fest segments. Teams can register directly online, inspect timetables, and follow live match results.',
    accentLabel: '02 / EVENTS & FEST',
  },
  {
    icon: UserCheck,
    title: 'Membership & Leadership',
    description:
      'Apply anytime through the Membership section. When recruitment opens, submit your application for Executive, Sub-Executive, or Prefect roles via the Leadership tab.',
    accentLabel: '03 / GET INVOLVED',
  },
  {
    icon: ShieldCheck,
    title: 'Stay Connected',
    description:
      'Get instant announcements on Facebook and Instagram. Check the News tab for articles, club project highlights, and national achievement updates.',
    accentLabel: '04 / CONNECT',
  },
];

interface OnboardingModalProps {
  /** Force the modal open (e.g., when the user clicks the Help button). */
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingModal({ forceOpen = false, onClose }: OnboardingModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  /* Auto-open on first visit */
  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
      setStep(0);
      return;
    }
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setIsVisible(true);
    } catch {
      /* localStorage unavailable in SSR/private mode — skip */
    }
  }, [forceOpen]);

  const handleClose = useCallback(() => {
    if (dontShowAgain || !forceOpen) {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch { /* ignore */ }
    }
    setIsVisible(false);
    onClose?.();
  }, [dontShowAgain, forceOpen, onClose]);

  const handleGetStarted = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch { /* ignore */ }
    setIsVisible(false);
    onClose?.();
  };

  /* Keyboard: Escape closes, arrows navigate */
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight' && step < steps.length - 1) setStep((s) => s + 1);
      if (e.key === 'ArrowLeft' && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, step, handleClose]);

  const StepIcon = steps[step].icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-[#141210]/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal card — centered on desktop, bottom-sheet on mobile */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Site onboarding guide"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={[
              'fixed z-[1000]',
              /* Mobile: bottom drawer */
              'bottom-0 left-0 right-0',
              /* Desktop: centered card */
              'sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2',
              'w-full sm:max-w-lg',
              'bg-[#f6f0e7] border border-[#cfc9bc]',
              'sm:rounded sm:shadow-[0_24px_64px_rgba(20,18,16,0.18)]',
              /* Mobile: rounded top corners */
              'rounded-t-2xl sm:rounded-b',
              'outline-none',
            ].join(' ')}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 pt-6 pb-0">
              <span className="font-mono text-[0.65rem] font-bold tracking-[0.16em] uppercase text-[#c94030]">
                {steps[step].accentLabel}
              </span>
              <button
                onClick={handleClose}
                className="p-1.5 text-[#6b6258] hover:text-[#141210] transition-colors rounded"
                aria-label="Close guide"
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="px-6 pt-6 pb-2 min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ede7da] border border-[#cfc9bc] mb-5">
                    <StepIcon className="w-5 h-5 text-[#c94030]" aria-hidden />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#141210] leading-snug mb-3">
                    {steps[step].title}
                  </h2>
                  <p className="text-[#3a3530] leading-relaxed text-[0.9375rem] overflow-wrap-anywhere">
                    {steps[step].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Step dots ── */}
            <div className="flex items-center gap-1.5 px-6 py-4">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === step
                      ? 'bg-[#c94030] w-5'
                      : 'bg-[#cfc9bc] w-1.5 hover:bg-[#9a9088]'
                  }`}
                />
              ))}
              <span className="ml-auto font-mono text-[0.65rem] text-[#9a9088] tracking-wider">
                {step + 1} of {steps.length}
              </span>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-[#cfc9bc] px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Don't show again */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#c94030] cursor-pointer"
                />
                <span className="font-mono text-[0.68rem] uppercase tracking-wider text-[#6b6258]">
                  Don&apos;t show again
                </span>
              </label>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#3a3530] border border-[#cfc9bc] bg-[#ede7da] hover:border-[#141210] transition-colors rounded-sm"
                  >
                    <ChevronLeft size={14} />
                    Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 font-mono text-xs uppercase tracking-wider bg-[#c94030] text-white hover:bg-[#a83228] transition-colors rounded-sm"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex items-center gap-1.5 px-5 py-2 font-mono text-xs uppercase tracking-wider bg-[#141210] text-white hover:bg-[#3a3530] transition-colors rounded-sm"
                  >
                    Get Started
                    <Rocket size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile drag handle */}
            <div className="flex justify-center pb-3 sm:hidden">
              <div className="w-10 h-1 bg-[#cfc9bc] rounded-full" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
