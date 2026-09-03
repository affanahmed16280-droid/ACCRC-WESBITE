import { MapPin } from 'lucide-react';
import { EventStatus } from './EventStatus';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function EventCard({ event }: { event: any }) {
  const now = new Date();
  const openAt = new Date(event.registrationOpensAt);
  const closeAt = new Date(event.registrationClosesAt);
  
  let status = 'closed';
  if (now < openAt) status = 'upcoming';
  else if (now >= openAt && now < closeAt) status = 'open';

  return (
    <div className="border border-border bg-secondary hover:border-accent/50 transition-colors duration-300 p-6 flex flex-col h-full rounded-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="font-mono text-sm text-text-tertiary">
          {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <EventStatus 
          registrationOpensAt={openAt} 
          registrationClosesAt={closeAt} 
        />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 mt-3">{event.title}</h3>
      <div className="flex items-center text-sm text-text-secondary mb-4 gap-2">
        <MapPin className="w-4 h-4" />
        <span>{event.location}</span>
      </div>
      <p className="text-sm text-text-secondary mb-6 flex-grow">
        {event.description?.substring(0, 150)}{event.description?.length > 150 ? '...' : ''}
      </p>
      <div className="mt-auto pt-5 border-t border-border">
        {status === 'open' && (
          <Link href={`/events/detail/?id=${event.id}`} className="block w-full">
            <Button className="w-full">Register Now</Button>
          </Link>
        )}
        {status === 'upcoming' && (
          <p className="text-center text-accent text-sm font-medium">Registration opens soon</p>
        )}
        {status === 'closed' && (
          <p className="text-center text-text-tertiary text-sm">Registration closed</p>
        )}
      </div>
    </div>
  );
}
