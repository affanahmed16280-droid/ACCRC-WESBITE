
"use client";

import { useEffect, useState } from "react";
import { MapPin, Mail } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { subscribeToPortalConfig, type PortalConfig } from "@/lib/firestore";
import { club } from "@/lib/club";

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);

  useEffect(() => subscribeToPortalConfig(setPortalConfig), []);
  useEffect(() => { setCurrentYear(new Date().getFullYear()); }, []);

  const leadershipApplicationsOpen = Boolean(
    portalConfig?.execOpen || portalConfig?.prefectOpen || portalConfig?.subExecOpen
  );

  return (
    <footer className="site-footer bg-[#ede7da] border-t border-[#cfc9bc]">
      <div className="container-content py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <img src="/accrc-logo.png" alt="Adamjee Cantonment College Robotics Club Logo" className="h-10 w-10 rounded-full object-cover border-[1.5px] border-[#c94030]" />
              <div>
                <h3 className="font-extrabold text-[#141210] text-[16px] tracking-[0.1em]">ACCRC</h3>
                <p className="font-mono text-[9px] text-[#6b6258] tracking-[0.06em] uppercase m-0 mt-[3px]">{club.name}</p>
              </div>
            </div>
            <p className="text-[#3a3530] text-[0.9375rem] leading-relaxed max-w-sm m-0">
              A student-led robotics community where we build, learn, and compete
              together through robotics, electronics, and computational thinking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-[#6b6258] mb-4 font-mono">Navigation</h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/events/", label: "Events" },
                { href: "/fest/", label: "Fest" },
                { href: "/#achievements", label: "Achievements" },
                { href: "/membership/", label: "Membership" },
                { href: "/news/", label: "News" },
                { href: "/about/", label: "About" },
                ...(leadershipApplicationsOpen ? [{ href: "/portal/", label: "Leadership" }] : []),
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[0.9375rem] text-[#6b6258] hover:text-[#c94030] transition-colors duration-150">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-[#6b6258] mb-4 font-mono">Contact</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-[0.9375rem] text-[#6b6258]">
                <MapPin size={15} className="mt-0.5 text-[#9a9088] shrink-0" />
                <span>{club.location}</span>
              </li>
              <li className="flex items-center gap-2.5 text-[0.9375rem] text-[#6b6258]">
                <Mail size={15} className="text-[#9a9088] shrink-0" />
                <a href={`mailto:${club.officialEmail}`} className="hover:text-[#c94030] transition-colors break-all">
                  {club.officialEmail}
                </a>
              </li>
              <li className="text-[0.9375rem] text-[#6b6258]">
                <a href={club.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#c94030] transition-colors">
                  Message on Instagram
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: FaFacebook, href: club.socials.facebook, label: `Adamjee Cantonment College Robotics Club on Facebook` },
                { icon: FaInstagram, href: club.socials.instagram, label: `Adamjee Cantonment College Robotics Club on Instagram` },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-[#6b6258] hover:text-[#c94030] border border-[#cfc9bc] hover:border-[#c94030] rounded transition-all duration-200"
                >
                  <social.icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#cfc9bc] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[0.7rem] text-[#9a9088] tracking-[0.06em] uppercase m-0">
            © {currentYear ? `${currentYear} ` : ''}{club.fullName}. All rights reserved.
          </p>
          <p className="font-mono text-[0.7rem] text-[#9a9088] tracking-[0.06em] uppercase m-0">
            Dhaka, Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
