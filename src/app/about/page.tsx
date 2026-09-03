'use client';

import React from 'react';
import { SectionReveal } from '@/components/ui/SectionReveal';
import { Card } from '@/components/ui/Card';
import { Cpu, Code, Wrench, Palette, User } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="pt-24 section-padding container-content min-h-screen">
      {/* Hero Section */}
      <SectionReveal>
        <div className="mb-16">
          <div className="mono-label text-accent mb-2">ABOUT</div>
          <h1 className="text-display-md font-bold text-text-primary">The Story Behind ACCRC</h1>
        </div>
      </SectionReveal>

      {/* Mission & History Section */}
      <SectionReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-display-sm font-bold text-text-primary mb-4">Our History</h2>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              The Adamjee Cantonment College Robotics Club was founded by a group of students who believed that engineering skills should not wait until university. What started as informal tinkering sessions in a classroom has grown into one of the most active student-led technical clubs in Dhaka. Today, ACCRC competes in national robotics olympiads, runs hands-on workshops open to all students, and maintains a growing inventory of components, tools, and project platforms.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '50+', label: 'Active Members' },
              { value: '10+', label: 'Competitions' },
              { value: '20+', label: 'Workshops Held' },
              { value: '3', label: 'Years Running' },
            ].map((stat, i) => (
              <Card key={i} className="p-6 flex flex-col justify-center items-center text-center">
                <div className="text-display-md font-bold text-accent mb-2">{stat.value}</div>
                <div className="mono-label text-text-tertiary">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* What We Do Section */}
      <SectionReveal>
        <div className="mb-24">
          <h2 className="text-display-sm font-bold text-text-primary mb-8">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <Cpu className="text-accent w-8 h-8" />
              <h3 className="text-display-xs font-bold text-text-primary mt-4">Electronics</h3>
              <p className="text-body-sm text-text-secondary mt-2">
                Circuit design, sensor integration, PCB prototyping, and embedded systems programming.
              </p>
            </Card>
            <Card className="p-6">
              <Code className="text-accent w-8 h-8" />
              <h3 className="text-display-xs font-bold text-text-primary mt-4">Programming</h3>
              <p className="text-body-sm text-text-secondary mt-2">
                Robot control algorithms, computer vision, path planning, and competition strategy.
              </p>
            </Card>
            <Card className="p-6">
              <Wrench className="text-accent w-8 h-8" />
              <h3 className="text-display-xs font-bold text-text-primary mt-4">Mechanical</h3>
              <p className="text-body-sm text-text-secondary mt-2">
                CAD modeling, 3D printing, chassis design, and mechanism prototyping.
              </p>
            </Card>
            <Card className="p-6">
              <Palette className="text-accent w-8 h-8" />
              <h3 className="text-display-xs font-bold text-text-primary mt-4">Design</h3>
              <p className="text-body-sm text-text-secondary mt-2">
                UI/UX for control dashboards, branding, presentation design, and documentation.
              </p>
            </Card>
          </div>
        </div>
      </SectionReveal>

      {/* Team Section */}
      <SectionReveal>
        <div>
          <div className="mono-label text-accent mb-2">LEADERSHIP</div>
          <h2 className="text-display-sm font-bold text-text-primary mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: '[President Name]', role: 'PRESIDENT', bio: 'Leads club strategy and external partnerships.' },
              { name: '[VP Name]', role: 'VICE PRESIDENT', bio: 'Oversees operations and event coordination.' },
              { name: '[Tech Lead]', role: 'TECHNICAL LEAD', bio: 'Guides all technical projects and R&D.' },
              { name: '[Secretary]', role: 'SECRETARY', bio: 'Manages communications and documentation.' },
            ].map((member, i) => (
              <Card key={i} className="p-6 text-center flex flex-col items-center">
                {/* CUSTOMIZE: Replace with real team data */}
                <div className="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center border border-border mb-4">
                  <User className="text-text-tertiary w-8 h-8" />
                </div>
                <h3 className="font-bold text-body-md text-text-primary">{member.name}</h3>
                <div className="font-mono text-mono-sm text-accent mt-1">{member.role}</div>
                <p className="text-body-xs text-text-secondary mt-2">
                  {member.bio}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </SectionReveal>
    </main>
  );
}
