export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCronRunner } = await import("@/lib/cron-runner");
    startCronRunner();
  }
}
