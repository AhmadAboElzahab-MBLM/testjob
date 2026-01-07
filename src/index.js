import fetchCrmEvents from "./services/crm.service.js";
import { filterEventsByVenue } from "./utils/event.utils.js";

export default {
  async scheduled(event, env, ctx) {
    console.log(env.AHMAD);
    const { success, data, error } = await fetchCrmEvents(env.CRM_API_URL, env);

    if (success) {
      const filteredEvents = filterEventsByVenue(data, "DWTC");
      console.log("Filtered Events:", filteredEvents);
    } else {
      console.error("Failed to fetch events:", error);
    }
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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
};
