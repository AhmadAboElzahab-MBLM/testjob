export default {
  async scheduled(event, env, ctx) {
    console.log(env.AHMAD);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/health" || url.pathname === "/status") {
      const now = new Date().toISOString();
      const timeSinceLastRun = lastRunTime
        ? Math.floor((Date.now() - new Date(lastRunTime).getTime()) / 1000)
        : null;

      return new Response(
        JSON.stringify(
          {
            status: "running",
            cronJob: {
              lastRunTime: lastRunTime || "Never run yet",
              lastRunStatus: lastRunStatus || "unknown",
              timeSinceLastRun: timeSinceLastRun
                ? `${timeSinceLastRun}s ago`
                : "N/A",
              totalRuns: runCount,
            },
            currentTime: now,
            healthy: true,
          },
          null,
          2
        ),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
    return new Response("Hello World", { status: 200 });
  },
};
