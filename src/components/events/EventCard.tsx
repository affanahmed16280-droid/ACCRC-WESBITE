import { MapPin, ExternalLink } from 'lucide-react';
import { EventStatus } from './EventStatus';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export interface PublicEvent {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  imageUrl?: string;
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  source?: 'facebook';
  permalinkUrl?: string;
}

export function EventCard({ event }: { event: PublicEvent }) {
  const now = new Date();
  const hasRegistrationWindow = Boolean(event.registrationOpensAt && event.registrationClosesAt);
  const canRegister = hasRegistrationWindow
    && now >= event.registrationOpensAt!
    && now < event.registrationClosesAt!;

  return (
    <article className="border border-border bg-secondary hover:border-accent/50 transition-colors duration-300 flex flex-col h-full rounded-sm overflow-hidden">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          className="h-44 w-full object-cover border-b border-border"
        />
      )}
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start gap-4 mb-4">
          <span className="font-mono text-sm text-text-tertiary">
            {event.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {event.source === 'facebook' ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent">Facebook</span>
          ) : (
            <EventStatus
              registrationOpensAt={event.registrationOpensAt}
              registrationClosesAt={event.registrationClosesAt}
            />
          )}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">{event.name}</h3>
        {event.location && (
          <div className="flex items-center text-sm text-text-secondary mb-4 gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
        <p className="text-sm text-text-secondary mb-6 flex-grow">
          {event.description?.substring(0, 150)}{event.description?.length > 150 ? '...' : ''}
        </p>
        <div className="mt-auto pt-5 border-t border-border">
          {event.source === 'facebook' && event.permalinkUrl ? (
            <a
              href={event.permalinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-primary transition-colors"
            >
              View on Facebook <ExternalLink className="w-4 h-4" />
            </a>
          ) : canRegister ? (
            <Link href={`/events/detail/?id=${event.id}`} className="block w-full">
              <Button className="w-full">Register Now</Button>
            </Link>
          ) : hasRegistrationWindow ? (
            <p className="text-center text-text-tertiary text-sm">Registration is not currently open</p>
          ) : (
            <p className="text-center text-text-tertiary text-sm">Registration details coming soon</p>
          )}
        </div>
      </div>
    </article>
  );
}
