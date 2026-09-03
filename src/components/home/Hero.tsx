'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Starfield } from './Starfield';

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-primary">
      <Starfield />

      <motion.div
        className="container-content relative z-10 flex flex-col items-start lg:items-start text-left md:text-left"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="text-display-lg md:text-display-xl font-bold text-primary tracking-tight leading-none mb-4"
        >
          ACCRC
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="font-mono text-mono-sm tracking-widest uppercase text-text-tertiary mb-6"
        >
          ADAMJEE CANTONMENT COLLEGE ROBOTICS CLUB
        </motion.p>
        
        <motion.p
          variants={itemVariants}
          className="text-display-xs text-text-secondary max-w-2xl mb-10"
        >
          Engineering the future, one circuit at a time.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <Button href="/membership/" variant="primary" size="lg">
            Become a Member
          </Button>
          <Button href="/events/" variant="secondary" size="lg">
            View Events
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-text-tertiary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
}
