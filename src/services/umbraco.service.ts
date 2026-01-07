import type { Env, UmbracoEvent, ServiceResponse } from "../types/events.types";

interface UmbracoGraphQLResponse {
  data: {
    allEvent: {
      items: UmbracoEvent[];
    };
  };
}

export async function fetchUmbracoEvents(
  env: Env
): Promise<ServiceResponse<UmbracoEvent[]>> {
  try {
    const response = await fetch(`https://graphql.umbraco.io`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Umb-Project-Alias": env.UMBRACO_PROJECT_ALIAS,
        "Api-Key": env.API_KEY,
      },
      body: JSON.stringify({
        query: `
          query {
            allEvent {
              items { id eventId lastUpdatedDate name }
            }
          }
        `,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data: UmbracoGraphQLResponse = await response.json();
    console.log("✅ Data fetched successfully");
    return { success: true, data: data.data.allEvent.items };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ Fetch failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
