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
  AtSign,
  CircleUserRound,
  Play,
} from 'lucide-react';

/* ─── particle field data (60 dots) ─── */
const particles = Array.from({ length: 60 }, (_, i) => ({
  left: `${((i * 37) % 100)}%`,
  top: `${((i * 61) % 100)}%`,
  width: i % 10 === 0 ? '2px' : '1px',
  height: i % 10 === 0 ? '2px' : '1px',
  animationDelay: `${(i % 8) * 0.45}s`,
}));

/* ─── countdown helper ─── */
function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      d: Math.floor(diff / 86_400_000),
      h: Math.floor((diff % 86_400_000) / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
    };
  };
  const [t, set] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => set(calc), 60_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return t;
}

/* ─── static event data ─── */
const events = [
  {
    tag: 'Flagship Competition',
    title: 'ACCRC ROBOWARS 2026',
    venue: 'Adamjee Cantonment College',
    day: '24',
    month: 'OCT 2026',
    status: 'REGISTRATION OPENS SOON',
  },
  {
    tag: 'Open Workshop',
    title: 'BUILD NIGHT / 04',
    venue: 'ACCRC Lab · Block C',
    day: '12',
    month: 'SEP 2026',
    status: 'REGISTRATION OPEN',
  },
  {
    tag: 'Learning Session',
    title: 'INTRO TO ARDUINO',
    venue: 'Online · Google Meet',
    day: '06',
    month: 'SEP 2026',
    status: 'REGISTRATION OPENS SOON',
  },
];

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
  const countdown = useCountdown(new Date('2026-09-20T00:00:00+06:00'));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main>
      {/* ═══ NAVBAR ═══ */}
      <nav className="nav">
        <a className="wordmark" href="#top">
          <span className="wordmark-mark">A</span>
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
          <strong>ACCRC ROBOWARS 2026</strong>
          <span className="muted">24 OCT 2026</span>
        </div>
        <div className="status-open">
          <span className="mono">REGISTRATION OPENS IN</span>
          <strong>
            {countdown.d}D {String(countdown.h).padStart(2, '0')}H{' '}
            {String(countdown.m).padStart(2, '0')}M
          </strong>
        </div>
        <a href="#events" className="status-arrow" aria-label="View events">
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
            <p className="eyebrow accent">CALENDAR / 2026</p>
            <h2>
              UPCOMING<br />
              <span>MISSIONS.</span>
            </h2>
          </div>
          <a className="text-button" href="#join">
            ALL EVENTS <ArrowRight size={16} aria-hidden />
          </a>
        </div>

        <div className="event-list">
          {events.map((ev, i) => (
            <article className="event-row" key={i}>
              <div className="event-number mono">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="event-info">
                <p className="mono accent">{ev.tag}</p>
                <h3>{ev.title}</h3>
                <p className="muted">{ev.venue}</p>
              </div>
              <div className="event-date">
                <strong>{ev.day}</strong>
                <span>{ev.month}</span>
              </div>
              <div className="event-action">
                <span className="mono status-chip">{ev.status}</span>
                <ChevronRight size={24} aria-hidden />
              </div>
            </article>
          ))}
        </div>
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

          <div className="portal-note">
            <Terminal size={18} aria-hidden />
            <div>
              <p className="mono">EXECUTIVE PORTAL</p>
              <p className="muted">Officer applications open soon.</p>
            </div>
          </div>
        </div>

        <div className="join-form-wrap">
          <p className="mono form-label">APPLICATION / 001</p>

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
                  <input required placeholder="Your name" />
                </label>
                <label>
                  EMAIL ADDRESS
                  <input required type="email" placeholder="you@example.com" />
                </label>
                <label>
                  CLASS / SECTION
                  <input required placeholder="XI · Science" />
                </label>
                <label>
                  ROLL NUMBER
                  <input required placeholder="00" />
                </label>
                <label>
                  PHONE NUMBER
                  <input required placeholder="+880 1XXX XXXXXX" />
                </label>
                <label>
                  AREA OF INTEREST
                  <select defaultValue="">
                    <option value="" disabled>Select a track</option>
                    <option>Mechanical</option>
                    <option>Electronics</option>
                    <option>Programming</option>
                    <option>Design</option>
                  </select>
                </label>
              </div>
              <label>
                WHY DO YOU WANT TO JOIN?
                <textarea required rows={4} placeholder="Tell us what you want to build..." />
              </label>
              <button className="primary-button" type="submit">
                SEND APPLICATION <Send size={16} aria-hidden />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="footer-top">
          <a className="wordmark" href="#top">
            <span className="wordmark-mark">A</span>
            <span>
              ACCRC
              <small>ADAMJEE CANTONMENT COLLEGE<br />ROBOTICS CLUB</small>
            </span>
          </a>
          <p className="footer-line">MAKE. BREAK. REPEAT.</p>
          <div className="socials">
            <a href="#top" aria-label="Instagram">
              <AtSign size={24} aria-hidden />
            </a>
            <a href="#top" aria-label="LinkedIn">
              <CircleUserRound size={24} aria-hidden />
            </a>
            <a href="#top" aria-label="YouTube">
              <Play size={24} aria-hidden />
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
