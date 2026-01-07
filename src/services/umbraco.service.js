export async function fetchUmbracoEvents(env) {
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
    const data = await response.json();
    console.log("✅ Data fetched successfully");
    return { success: true, data: data.data.allEvent.items };
  } catch (error) {
    console.error("❌ Fetch failed:", error.message);
    return { success: false, error: error.message };
  }
}
