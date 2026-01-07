export function filterEventsByVenue(events, venue) {
  const filteredEvents = events.filter(event =>
    event.eventVenues && event.eventVenues.includes(venue)
  );

  console.log(`📍 Events with ${venue} venue:`, filteredEvents);
  console.log(`Found ${filteredEvents.length} events with ${venue} venue`);

  return filteredEvents;
}
