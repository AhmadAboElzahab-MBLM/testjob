import { fetchCrmEvents } from "./services/crm.service";
import { fetchUmbracoEvents } from "./services/umbraco.service";
import { filterEventsByVenue } from "./utils/event.utils";
import type { Env } from "./types/events.types";

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
    console.log(env.AHMAD);
    const crmResponse = await fetchCrmEvents(env);
    const umbracoResponse = await fetchUmbracoEvents(env);

    if (umbracoResponse.success) {
      console.log("Umbraco Data:", umbracoResponse.data);
    }

    if (crmResponse.success) {
      // const filteredEvents = filterEventsByVenue(crmResponse.data, "DWTC");
      // console.log("Filtered Events:", filteredEvents);
    } else {
      console.error("Failed to fetch events:", crmResponse.error);
    }
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
