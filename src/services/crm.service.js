export async function fetchCrmEvents(env) {
  try {
    const response = await fetch(env.CRM_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": env.OCP_APIM_SUBSCRIPTION_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("✅ Data fetched successfully");
    return { success: true, data };
  } catch (error) {
    console.error("❌ Fetch failed:", error.message);
    return { success: false, error: error.message };
  }
}
