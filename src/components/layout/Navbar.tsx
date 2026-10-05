
"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToPortalConfig, type PortalConfig } from "@/lib/firestore";

const standardNavLinks = [
  { href: "/", label: "Home" },
  { href: "/events/", label: "Events" },
  { href: "/fest/", label: "Fest" },
  { href: "/#achievements", label: "Achievements" },
  { href: "/membership/", label: "Membership" },
  { href: "/news/", label: "News" },
  { href: "/about/", label: "About" },
];

export function Navbar({
  onHelpClick,
  topOffset = 0,
}: {
  onHelpClick?: () => void;
  topOffset?: number;
} = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => subscribeToPortalConfig(setPortalConfig), []);

  const leadershipApplicationsOpen = Boolean(
    portalConfig?.execOpen || portalConfig?.prefectOpen || portalConfig?.subExecOpen
  );
  const navLinks = leadershipApplicationsOpen
    ? [...standardNavLinks, { href: "/portal/", label: "Leadership" }]
    : standardNavLinks;

  return (
    <header
      style={{ top: `${topOffset}px` }}
      className={`fixed left-0 right-0 z-[90] transition-all duration-200 ${
        scrolled
          ? "bg-[#f6f0e7]/95 backdrop-blur-md border-b border-[#cfc9bc] shadow-[0_1px_4px_rgba(20,18,16,0.08)]"
          : "bg-transparent"
      }`}
    >
      <nav className="container-content flex items-center justify-between h-[68px] md:h-[76px]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group" aria-label="ACCRC Home">
          <img
            src="/accrc-logo.png"
            alt="ACCRC Logo"
            width={44}
            height={44}
            className="h-10 w-10 md:h-11 md:w-11 rounded-full object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-[#141210] text-[15px] md:text-[17px] tracking-[0.08em] leading-none">
              ACCRC
            </span>
            <span className="font-mono text-[9px] md:text-[10px] font-bold text-[#1e1b18] tracking-[0.06em] uppercase mt-[3px] leading-tight">
              Adamjee Cantonment College<br className="sm:hidden" /> Robotics Club
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2.5 text-[0.8125rem] font-semibold tracking-[0.03em] text-[#3a3530] hover:text-[#c94030] transition-colors duration-150 relative group"
            >
              {link.label}
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-[#c94030] transition-all duration-200 group-hover:w-2/3" />
            </a>
          ))}
          {onHelpClick && (
            <button
              onClick={onHelpClick}
              aria-label="How it works — open site guide"
              title="How it works"
              className="ml-1 p-2 text-[#6b6258] hover:text-[#c94030] transition-colors rounded-full"
            >
              <HelpCircle size={18} />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#3a3530] hover:text-[#141210] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ top: `${topOffset + 68}px` }}
            className="md:hidden fixed inset-x-0 bottom-0 bg-[#f6f0e7] z-[90] border-b border-[#cfc9bc] shadow-[0_8px_24px_rgba(20,18,16,0.1)]"
          >
            <div className="container-content pt-4 pb-6 flex flex-col">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.18 }}
                  className="text-[1rem] font-bold tracking-[0.03em] text-[#141210] py-3.5 border-b border-[#cfc9bc] last:border-0 hover:text-[#c94030] transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              {onHelpClick && (
                <motion.button
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.04, duration: 0.18 }}
                  onClick={() => { setIsOpen(false); onHelpClick(); }}
                  className="flex items-center gap-2 text-[1rem] font-bold tracking-[0.03em] text-[#6b6258] py-3.5 border-t border-[#cfc9bc] hover:text-[#c94030] transition-colors"
                >
                  <HelpCircle size={18} />
                  How it Works
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
