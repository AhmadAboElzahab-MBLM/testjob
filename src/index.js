export default {
  async scheduled(event, env, ctx) {
    console.log("Cron job running at:", new Date().toISOString());

    // Your cron logic here
    try {
      const response = await fetch("https://api.example.com/endpoint");
      console.log("Success!", await response.text());
    } catch (error) {
      console.error("Error:", error);
    }
  },
};
