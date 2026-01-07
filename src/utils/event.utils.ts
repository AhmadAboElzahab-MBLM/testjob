import type {
  CrmEvent,
  UmbracoEvent,
  CreateEventRequest,
} from "../types/events.types";

/**
 * Remove surrounding quotes from a date string if present
 */
function normalizeDateString(dateString: string): string {
  return dateString.replace(/^"(.*)"$/, "$1");
}

export function filterEventsByVenue(
  events: CrmEvent[],
  venue: string
): CrmEvent[] {
  const filteredEvents = events.filter(
    (event) => event.eventVenues && event.eventVenues.includes(venue)
  );
  return filteredEvents;
}

export interface SyncResult {
  toUpdate: Array<{ umbracoEvent: UmbracoEvent; crmEvent: CrmEvent }>;
  toCreate: CrmEvent[];
}

export function compareEvents(
  crmEvents: CrmEvent[],
  umbracoEvents: UmbracoEvent[]
): SyncResult {
  const toUpdate: Array<{ umbracoEvent: UmbracoEvent; crmEvent: CrmEvent }> =
    [];
  const toCreate: CrmEvent[] = [];

  // Create a map of Umbraco events by eventId for quick lookup
  const umbracoMap = new Map<string, UmbracoEvent>();
  umbracoEvents.forEach((event) => {
    umbracoMap.set(event.eventId, event);
  });

  // Process each CRM event
  crmEvents.forEach((crmEvent) => {
    const crmEventId = crmEvent.eventId.toString();
    const umbracoEvent = umbracoMap.get(crmEventId);

    if (umbracoEvent) {
      // Event exists in Umbraco - check if dates are different
      // Normalize both dates to handle extra quotes that Umbraco adds
      const normalizedCrmDate = normalizeDateString(crmEvent.lastUpdatedDate);
      const normalizedUmbracoDate = normalizeDateString(umbracoEvent.lastUpdatedDate);

      if (normalizedCrmDate !== normalizedUmbracoDate) {
        toUpdate.push({ umbracoEvent, crmEvent });
      }
    } else {
      // Event doesn't exist in Umbraco - needs to be created
      toCreate.push(crmEvent);
    }
  });

  return { toUpdate, toCreate };
}

export function mapCrmEventToUmbraco(
  crmEvent: CrmEvent,
  parentId?: string
): CreateEventRequest | Omit<CreateEventRequest, "parentId"> {
  const baseData = {
    name: {
      "en-US": crmEvent.title,
      ar: crmEvent.title,
    },
    contentTypeAlias: "event",
    title: {
      "en-US": crmEvent.title,
      ar: crmEvent.title,
    },
    description: {
      "en-US": crmEvent.pageContent,
      ar: crmEvent.pageContent,
    },
    location: {
      "en-US": crmEvent.location,
      ar: crmEvent.location,
    },
    eventOrganiser: {
      "en-US": crmEvent.eventOrganiser,
      ar: crmEvent.eventOrganiser,
    },
    websiteURL: {
      "en-US": crmEvent.websiteURL,
      ar: crmEvent.websiteURL,
    },
    eventId: {
      $invariant: crmEvent.eventId,
    },
    lastUpdatedDate: {
      $invariant: `"${crmEvent.lastUpdatedDate}"`,
    },
    facebook: {
      "en-US": crmEvent.socialMedia?.facebook || null,
      ar: crmEvent.socialMedia?.facebook || null,
    },
    linkedIn: {
      "en-US": crmEvent.socialMedia?.linkedIn || null,
      ar: crmEvent.socialMedia?.linkedIn || null,
    },
    twitter: {
      "en-US": null,
      ar: null,
    },
    instagram: {
      "en-US": crmEvent.socialMedia?.instagram || null,
      ar: crmEvent.socialMedia?.instagram || null,
    },
    youtube: {
      "en-US": crmEvent.socialMedia?.youtube || null,
      ar: crmEvent.socialMedia?.youtube || null,
    },
    tiktok: {
      "en-US": crmEvent.socialMedia?.tiktok || null,
      ar: crmEvent.socialMedia?.tiktok || null,
    },
    startDate: {
      $invariant: crmEvent.startDate,
    },
    endDate: {
      $invariant: crmEvent.endDate,
    },
    eventType: {
      $invariant: crmEvent.eventType,
    },
    eventVenues: {
      $invariant: crmEvent.eventVenues,
    },
  };

  // Include parentId if provided (for creating new events)
  if (parentId) {
    return { ...baseData, parentId };
  }

  return baseData;
}
