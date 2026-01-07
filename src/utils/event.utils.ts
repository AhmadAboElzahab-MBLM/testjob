import type { CrmEvent } from "../types/events.types";

export function filterEventsByVenue(
  events: CrmEvent[],
  venue: string
): CrmEvent[] {
  const filteredEvents = events.filter(
    (event) => event.eventVenues && event.eventVenues.includes(venue)
  );
  return filteredEvents;
}
