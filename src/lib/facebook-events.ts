export interface FacebookEvent {
  id: string;
  name: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  imageUrl?: string;
  permalinkUrl: string;
  source: "facebook";
}

interface FacebookEventsResponse {
  events?: Array<{
    id: string;
    name: string;
    description?: string;
    startTime: string;
    endTime?: string;
    location?: string;
    imageUrl?: string;
    permalinkUrl: string;
  }>;
}

/**
 * Reads the optional Cloudflare Pages Function. The site remains fully usable
 * when Facebook credentials have not been configured yet.
 */
export async function getFacebookEvents(): Promise<FacebookEvent[]> {
  const response = await fetch("/api/facebook-events", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Facebook events are unavailable");
  }

  const payload = (await response.json()) as FacebookEventsResponse;
  return (payload.events ?? [])
    .map((event) => ({
      id: `facebook-${event.id}`,
      name: event.name,
      description: event.description ?? "",
      date: new Date(event.startTime),
      endDate: event.endTime ? new Date(event.endTime) : undefined,
      location: event.location ?? "Online / see Facebook for details",
      imageUrl: event.imageUrl,
      permalinkUrl: event.permalinkUrl,
      source: "facebook" as const,
    }))
    .filter((event) => !Number.isNaN(event.date.getTime()));
}
