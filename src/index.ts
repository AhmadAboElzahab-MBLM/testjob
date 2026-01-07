import { fetchCrmEvents } from "./services/crm.service";
import {
  fetchUmbracoEvents,
  createUmbracoEvent,
  updateUmbracoEvent,
  publishUmbracoEvent,
} from "./services/umbraco.service";
import {
  filterEventsByVenue,
  compareEvents,
  mapCrmEventToUmbraco,
} from "./utils/event.utils";
import type { Env, CreateEventRequest } from "./types/events.types";

export interface ExportedHandler {
  scheduled: (
    event: { cron: string },
    env: Env,
    ctx: ExecutionContext
  ) => Promise<void>;
  fetch: (
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ) => Promise<Response>;
}

export default {
  async scheduled(event, env, ctx) {
    console.log("🔄 Starting CRM to Umbraco sync...");

    // Fetch data from both sources
    const crmResponse = await fetchCrmEvents(env);
    const umbracoResponse = await fetchUmbracoEvents(env);

    // Check if both requests succeeded
    if (!crmResponse.success) {
      console.error("❌ Failed to fetch CRM events:", crmResponse.error);
      return;
    }

    if (!umbracoResponse.success) {
      console.error(
        "❌ Failed to fetch Umbraco events:",
        umbracoResponse.error
      );
      return;
    }

    // Filter CRM events for DWTC venue only
    const filteredCrmEvents = filterEventsByVenue(crmResponse.data, "DWTC");
    console.log(`📊 Found ${filteredCrmEvents.length} DWTC events in CRM`);

    // Compare and determine what needs to be synced
    const { toUpdate, toCreate } = compareEvents(
      filteredCrmEvents,
      umbracoResponse.data
    );

    console.log(`🔄 Events to update: ${toUpdate.length}`);
    console.log(`➕ Events to create: ${toCreate.length}`);

    // Skip processing if nothing needs to be done
    if (toUpdate.length === 0 && toCreate.length === 0) {
      console.log("✅ All events are up to date - no sync needed!");
      return;
    }

    const processedEventIds: string[] = [];

    // Update existing events where CRM data is newer
    for (const { umbracoEvent, crmEvent } of toUpdate) {
      const eventData = mapCrmEventToUmbraco(crmEvent);
      const updateResult = await updateUmbracoEvent(
        env,
        umbracoEvent.id,
        eventData
      );

      if (updateResult.success) {
        processedEventIds.push(umbracoEvent.id);
      } else {
        console.error(
          `❌ Failed to update event ${crmEvent.eventId}:`,
          updateResult.error
        );
      }
    }

    // Create new events that don't exist in Umbraco
    for (const crmEvent of toCreate) {
      const eventData = mapCrmEventToUmbraco(crmEvent, env.UMBRACO_PARENT_ID) as CreateEventRequest;
      const createResult = await createUmbracoEvent(env, eventData);

      if (createResult.success) {
        processedEventIds.push(createResult.data._id);
      } else {
        console.error(
          `❌ Failed to create event ${crmEvent.eventId}:`,
          createResult.error
        );
      }
    }

    // Publish all processed events
    for (const contentId of processedEventIds) {
      const publishResult = await publishUmbracoEvent(env, contentId);

      if (!publishResult.success) {
        console.error(
          `❌ Failed to publish event ${contentId}:`,
          publishResult.error
        );
      }
    }

    console.log("✅ Sync completed successfully!");
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/run-cron") {
      await this.scheduled({ cron: "manual" }, env, ctx);
      return new Response("Cron job executed", { status: 200 });
    }

    if (url.pathname === "/health" || url.pathname === "/status") {
      return new Response("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Hello World", { status: 200 });
  },
} satisfies ExportedHandler;
