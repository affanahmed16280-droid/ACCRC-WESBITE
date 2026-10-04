
'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Starfield } from './Starfield';

export function Hero() {
  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.2 } } };
  const item = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } } };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#f6f0e7]">
      <Starfield />

      {/* Subtle grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#cfc9bc 1px, transparent 1px), linear-gradient(90deg, #cfc9bc 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          opacity: 0.18,
          maskImage: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.5) 70%, transparent)',
        }}
      />

      <motion.div
        className="container-content relative z-10 flex flex-col items-start"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={item} className="font-mono text-[0.72rem] font-bold tracking-[0.18em] uppercase text-[#6b6258] mb-5 flex items-center gap-2.5">
          <span className="inline-block w-5 h-px bg-[#c94030]" />
          EST. 2019 · DHAKA, BANGLADESH
        </motion.p>

        <motion.h1
          variants={item}
          className="font-black text-[#141210] leading-[0.88] tracking-[-0.06em] mb-6"
          style={{ fontSize: 'clamp(62px, 10.5vw, 168px)' }}
        >
          ACCRC
        </motion.h1>

        <motion.p
          variants={item}
          className="font-mono text-[0.8rem] font-bold tracking-[0.2em] uppercase text-[#6b6258] mb-7"
        >
          Adamjee Cantonment College Robotics Club
        </motion.p>

        <motion.p variants={item} className="text-[1.0625rem] leading-[1.75] text-[#3a3530] max-w-[400px] mb-10">
          Engineering the future, one circuit at a time.
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
          <Button href="/membership/" variant="primary" size="lg">
            Become a Member
          </Button>
          <Button href="/events/" variant="secondary" size="lg">
            View Events
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-[#9a9088]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
}
