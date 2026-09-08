'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  ArrowRight,
  ChevronRight,
  CalendarDays,
  Menu,
  X,
  Send,
  Terminal,
} from 'lucide-react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import {
  submitRegistration,
  subscribeToEvents,
  subscribeToPortalConfig,
  type FirestoreEvent,
  type PortalConfig,
} from '@/lib/firestore';

/* ─── particle field data (60 dots) ─── */
const particles = Array.from({ length: 60 }, (_, i) => ({
  left: `${((i * 37) % 100)}%`,
  top: `${((i * 61) % 100)}%`,
  width: i % 10 === 0 ? '2px' : '1px',
  height: i % 10 === 0 ? '2px' : '1px',
  animationDelay: `${(i % 8) * 0.45}s`,
}));

const news = [
  {
    date: '18.08.26',
    cat: 'ANNOUNCEMENT',
    title: 'ACCRC is now accepting new members for 2026\u201327',
    desc: 'Build, compete, and learn alongside the next generation of Dhaka\u2019s robotics community.',
  },
  {
    date: '02.08.26',
    cat: 'FIELD NOTES',
    title: 'Inside the lab: tuning our autonomous line follower',
    desc: 'A look at the small decisions that turn a good prototype into a reliable machine.',
  },
  {
    date: '19.07.26',
    cat: 'COMMUNITY',
    title: 'Five teams. One weekend. Zero sleep.',
    desc: 'What we learned from our first inter-college build sprint.',
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [portalConfig, setPortalConfig] = useState<PortalConfig | null>(null);

  useEffect(() => {
    const unsubscribeEvents = subscribeToEvents(setEvents);
    const unsubscribePortal = subscribeToPortalConfig(setPortalConfig);

    return () => {
      unsubscribeEvents();
      unsubscribePortal();
    };
  }, []);

  const upcomingEvents = events
    .filter((event) => event.date.getTime() >= Date.now())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const nextEvent = upcomingEvents[0];
  const activeLeadershipApplications = [
    portalConfig?.execOpen ? 'Executive Panel' : null,
    portalConfig?.prefectOpen ? 'Prefect Application' : null,
    portalConfig?.subExecOpen ? 'Sub-Executive Application' : null,
  ].filter(Boolean) as string[];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setFormError('');

    try {
      await submitRegistration({
        type: 'membership',
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        classSection: String(formData.get('classSection') ?? ''),
        collegeId: String(formData.get('collegeId') ?? ''),
        motivation: String(formData.get('motivation') ?? ''),
      });
      form.reset();
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit membership application', error);
      setFormError('We could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      {/* ═══ NAVBAR ═══ */}
      <nav className="nav">
        <a className="wordmark" href="#top">
          <img className="wordmark-logo" src="/accrc-logo.png" alt="ACCRC logo" />
          <span>
            ACCRC
            <small>ADAMJEE CANTONMENT COLLEGE<br />ROBOTICS CLUB</small>
          </span>
        </a>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#mission" onClick={() => setMenuOpen(false)}>Mission</a>
          <a href="#events" onClick={() => setMenuOpen(false)}>Events</a>
          <a href="#news" onClick={() => setMenuOpen(false)}>Updates</a>
          <a href="#join" onClick={() => setMenuOpen(false)}>Join us</a>
          {activeLeadershipApplications.length > 0 && (
            <a href="/portal/" onClick={() => setMenuOpen(false)}>Leadership</a>
          )}
        </div>

        <a href="#join" className="nav-cta">
          APPLY <ArrowRight size={15} aria-hidden />
        </a>

        <button
          className="menu-button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
        </button>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero" id="top">
        <div className="particle-field" aria-hidden="true">
          {particles.map((p, i) => (
            <i key={i} style={p} />
          ))}
        </div>
        <div className="hero-grid" />

        <div className="hero-content">
          <p className="eyebrow">
            <span /> EST. 2024 &middot; DHAKA, BANGLADESH
          </p>
          <h1>
            BUILD<br />
            <em>WHAT&apos;S NEXT.</em>
          </h1>
          <p className="hero-copy">
            A student-led robotics club building intelligent machines, fearless
            teams, and a future we can all engineer.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#join">
              BECOME A MEMBER <ArrowRight size={17} aria-hidden />
            </a>
            <a className="outline-button" href="#events">
              VIEW EVENTS <CalendarDays size={16} aria-hidden />
            </a>
          </div>
        </div>

        <div className="hero-coordinates mono">
          23&deg;49&apos;N<br />90&deg;25&apos;E
        </div>

        <div className="scroll-cue mono">
          SCROLL TO EXPLORE <ChevronRight size={15} aria-hidden />
        </div>
      </section>

      {/* ═══ STATUS STRIP ═══ */}
      <section className="status-strip">
        <div className="status-label">
          <span className="live-dot" /> LIVE STATUS
        </div>
        <div className="status-event">
          <span className="mono muted">NEXT EVENT</span>
          {nextEvent ? (
            <>
              <strong>{nextEvent.name}</strong>
              <span className="muted">{nextEvent.date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </>
          ) : (
            <strong>No upcoming events</strong>
          )}
        </div>
        <div className="status-open">
          <span className="mono">{nextEvent ? 'EVENT DETAILS' : 'STAY TUNED'}</span>
          <strong>{nextEvent?.location || 'Follow ACCRC on Facebook'}</strong>
        </div>
        <a href="/events/" className="status-arrow" aria-label="View events">
          <ArrowRight size={24} aria-hidden />
        </a>
      </section>

      {/* ═══ MISSION ═══ */}
      <section className="section mission" id="mission">
        <div className="section-index mono">01 / 04</div>
        <div>
          <p className="eyebrow accent">OUR MISSION</p>
          <h2>
            Curiosity is our<br />
            <span>operating system.</span>
          </h2>
        </div>
        <div className="mission-body">
          <p>
            ACCRC is where students turn questions into working prototypes. We
            learn by building &mdash; and build things that make the world a
            little more capable.
          </p>
          <a href="#join" className="text-button" style={{ marginTop: 28 }}>
            MEET THE CLUB <ArrowRight size={16} aria-hidden />
          </a>
        </div>
      </section>

      {/* ═══ EVENTS ═══ */}
      <section className="section events" id="events">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">CALENDAR / LIVE</p>
            <h2>
              UPCOMING<br />
              <span>MISSIONS.</span>
            </h2>
          </div>
          <a className="text-button" href="/events/">
            ALL EVENTS <ArrowRight size={16} aria-hidden />
          </a>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="event-empty">
            <CalendarDays size={24} aria-hidden />
            <div>
              <h3>No upcoming events right now.</h3>
              <p>Stay tuned! Follow ACCRC on Facebook for the latest announcements.</p>
            </div>
            <a className="text-button" href="https://www.facebook.com/accroboticsclub" target="_blank" rel="noopener noreferrer">
              FACEBOOK <ArrowRight size={16} aria-hidden />
            </a>
          </div>
        ) : (
          <div className="event-list">
            {upcomingEvents.slice(0, 3).map((event, index) => (
              <a className="event-row" href={`/events/detail/?id=${event.id}`} key={event.id}>
                <div className="event-number mono">{String(index + 1).padStart(2, '0')}</div>
                <div className="event-info">
                  <p className="mono accent">{event.registrationOpensAt ? 'CLUB EVENT' : 'EVENT DETAILS'}</p>
                  <h3>{event.name}</h3>
                  <p className="muted">{event.location}</p>
                </div>
                <div className="event-date">
                  <strong>{event.date.toLocaleDateString(undefined, { day: '2-digit' })}</strong>
                  <span>{event.date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase()}</span>
                </div>
                <div className="event-action">
                  <span className="mono status-chip">
                    {event.registrationOpensAt && event.registrationOpensAt > new Date() ? 'REGISTRATION OPENS SOON' : 'VIEW DETAILS'}
                  </span>
                  <ChevronRight size={24} aria-hidden />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ═══ NEWS ═══ */}
      <section className="section news" id="news">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">SIGNAL / UPDATES</p>
            <h2>
              FROM THE<br />
              <span>WORKSHOP.</span>
            </h2>
          </div>
          <a className="text-button" href="#news">
            VIEW ALL UPDATES <ArrowRight size={16} aria-hidden />
          </a>
        </div>

        <div className="news-grid">
          {news.map((n, i) => (
            <article className="news-card" key={i}>
              <div className="news-meta mono">
                <span>{n.date}</span>
                <span>{n.cat}</span>
              </div>
              <h3>{n.title}</h3>
              <p className="muted">{n.desc}</p>
              <a href="#join" aria-label={`Read ${n.title}`}>
                <ArrowRight size={24} aria-hidden />
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ JOIN ═══ */}
      <section className="join-section" id="join">
        <div className="join-intro">
          <p className="eyebrow accent">OPEN CALL / 2026\u201327</p>
          <h2>
            YOUR NEXT<br />
            <span>BUILD STARTS HERE.</span>
          </h2>
          <p className="muted">
            No experience required. Just a question you can&apos;t stop asking,
            and the willingness to figure it out.
          </p>

          {activeLeadershipApplications.length > 0 && (
            <a className="portal-note" href="/portal/">
              <Terminal size={18} aria-hidden />
              <div>
                <p className="mono">LEADERSHIP APPLICATIONS OPEN</p>
                <p className="muted">{activeLeadershipApplications.join(' · ')}</p>
              </div>
            </a>
          )}
        </div>

        <div className="join-form-wrap">
          <p className="mono form-label">MEMBERSHIP APPLICATION / ALWAYS OPEN</p>

          {submitted ? (
            <div className="confirmation">
              <Send size={28} aria-hidden />
              <h3>Application received.</h3>
              <p className="muted">
                We&apos;ll review your submission and reach out soon. Welcome to the build.
              </p>
            </div>
          ) : (
            <form className="member-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  FULL NAME
                  <input name="name" required placeholder="Your name" autoComplete="name" />
                </label>
                <label>
                  EMAIL ADDRESS
                  <input name="email" required type="email" placeholder="you@example.com" autoComplete="email" />
                </label>
                <label>
                  SECTION
                  <input name="classSection" required placeholder="XI · Science A" />
                </label>
                <label>
                  COLLEGE ID
                  <input name="collegeId" required placeholder="Your college ID" />
                </label>
              </div>
              <label>
                WHY DO YOU WANT TO JOIN?
                <textarea name="motivation" required rows={4} placeholder="Tell us why you want to join ACCRC..." />
              </label>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting ? 'SENDING...' : 'SEND APPLICATION'} <Send size={16} aria-hidden />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="footer-top">
          <a className="wordmark" href="#top">
            <img className="wordmark-logo" src="/accrc-logo.png" alt="ACCRC logo" />
            <span>
              ACCRC
              <small>ADAMJEE CANTONMENT COLLEGE<br />ROBOTICS CLUB</small>
            </span>
          </a>
          <p className="footer-line">MAKE. BREAK. REPEAT.</p>
          <div className="socials">
            <a href="https://www.facebook.com/accroboticsclub" target="_blank" rel="noopener noreferrer" aria-label="ACCRC on Facebook">
              <FaFacebookF aria-hidden />
            </a>
            <a href="https://www.instagram.com/acc_robotics_club/" target="_blank" rel="noopener noreferrer" aria-label="ACCRC on Instagram">
              <FaInstagram aria-hidden />
            </a>
          </div>
        </div>
        <div className="footer-bottom mono">
          <span>ADAMJEE CANTONMENT COLLEGE &middot; DHAKA, BD</span>
          <span>&copy; 2026 ACCRC</span>
          <span>BUILT BY THE CLUB</span>
        </div>
      </footer>
    </main>
  );
}
