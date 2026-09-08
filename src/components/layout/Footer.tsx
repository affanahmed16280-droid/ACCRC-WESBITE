"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { subscribeToPortalConfig, type PortalConfig } from "@/lib/firestore";
import { club } from "@/lib/club";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);

  useEffect(() => subscribeToPortalConfig(setPortalConfig), []);

  const leadershipApplicationsOpen = Boolean(
    portalConfig?.execOpen || portalConfig?.prefectOpen || portalConfig?.subExecOpen
  );

  return (
    <footer className="site-footer bg-primary border-t border-border">
      <div className="container-content py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/accrc-logo.png"
                alt="ACCRC Logo"
                className="h-10 w-10 rounded-full object-cover border border-accent"
              />
              <div>
                <h3 className="font-bold text-text-primary text-lg tracking-display">
                  ACCRC
                </h3>
                <p className="font-mono text-[10px] text-text-tertiary tracking-widest uppercase">
                  {club.name} · Adamjee Cantonment College
                </p>
              </div>
            </div>
            <p className="text-text-secondary text-body-sm leading-relaxed max-w-sm">
              A student-led robotics community where we build, learn, and compete
              together through robotics, electronics, and computational thinking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="mono-label mb-4">Navigation</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/events/", label: "Events" },
                { href: "/membership/", label: "Membership" },
                { href: "/news/", label: "News" },
                { href: "/about/", label: "About" },
                { href: "/admin/", label: "Portals" },
                ...(leadershipApplicationsOpen ? [{ href: "/portal/", label: "Leadership" }] : []),
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-body-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="mono-label mb-4">Contact</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                <MapPin size={16} className="mt-0.5 text-text-tertiary shrink-0" />
                <span>
                  {club.location}
                </span>
              </li>
              <li className="text-body-sm text-text-secondary">
                <a
                  href={club.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Message {club.name} on Instagram
                </a>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: FaFacebook, href: club.socials.facebook, label: `${club.name} on Facebook` },
                { icon: FaInstagram, href: club.socials.instagram, label: `${club.name} on Instagram` },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-tertiary hover:text-accent border border-border hover:border-accent/30 rounded-sm transition-all duration-200"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-mono-sm text-text-tertiary">
            © {currentYear} {club.shortName} — {club.name}
          </p>
          <p className="font-mono text-mono-sm text-text-tertiary">
            Dhaka, Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
