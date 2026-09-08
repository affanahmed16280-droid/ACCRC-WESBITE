import { club } from '@/lib/club';

const FACEBOOK_PAGE = club.socials.facebook;

export function FacebookTimeline() {
  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FACEBOOK_PAGE)}&tabs=timeline&width=500&height=540&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;

  return (
    <aside className="border border-border bg-secondary p-5 sm:p-6">
      <p className="font-mono text-xs tracking-widest text-accent uppercase mb-2">Official Facebook</p>
      <h2 className="text-xl font-bold text-primary mb-2">Latest ACCRC updates</h2>
      <p className="text-sm text-text-secondary mb-5">
        Follow our official page for announcements, event updates, and last-minute changes.
      </p>
      <iframe
        title="ACCRC official Facebook page"
        src={src}
        width="500"
        height="540"
        className="w-full max-w-full border-0 bg-primary"
        style={{ minHeight: 540 }}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
      <a
        href={FACEBOOK_PAGE}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 text-sm text-accent hover:text-primary transition-colors"
      >
        Open ACCRC on Facebook →
      </a>
    </aside>
  );
}
