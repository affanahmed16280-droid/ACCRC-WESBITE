import { MapPin, Mail, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary border-t border-border">
      <div className="container-content py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="ACCRC Logo"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-bold text-text-primary text-lg tracking-display">
                  ACCRC
                </h3>
                <p className="font-mono text-[10px] text-text-tertiary tracking-widest uppercase">
                  Adamjee Cantonment College Robotics Club
                </p>
              </div>
            </div>
            <p className="text-text-secondary text-body-sm leading-relaxed max-w-sm">
              Building the next generation of innovators, engineers, and problem
              solvers through robotics, electronics, and computational thinking.
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
                { href: "/portal/", label: "Portal" },
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
                  Adamjee Cantonment College, Dhaka Cantonment, Dhaka 1206, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-body-sm text-text-secondary">
                <Mail size={16} className="text-text-tertiary shrink-0" />
                {/* CUSTOMIZE: Replace with actual club email */}
                <a href="mailto:accrc@example.com" className="hover:text-accent transition-colors">
                  accrc@example.com
                </a>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {/* CUSTOMIZE: Replace # with actual social links */}
              {[
                { icon: FaFacebook, href: "#", label: "Facebook" },
                { icon: FaInstagram, href: "#", label: "Instagram" },
                { icon: FaLinkedin, href: "#", label: "LinkedIn" },
                { icon: FaGithub, href: "#", label: "GitHub" },
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
            © {currentYear} ACCRC — Adamjee Cantonment College Robotics Club
          </p>
          <p className="font-mono text-mono-sm text-text-tertiary">
            Dhaka, Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
