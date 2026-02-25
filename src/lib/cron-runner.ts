/**
 * In-process cron runner for development.
 * In production, use Vercel Cron or an external scheduler to call:
 * POST /api/cron/run-checks
 * Header: x-cron-secret: <CRON_SECRET>
 */
import cron from "node-cron";
import { prisma } from "./db";
import { runCheck } from "./monitor";

let isRunning = false;

export function startCronRunner() {
  if (process.env.NODE_ENV !== "development") return;

  // Run every 30 seconds to pick up endpoints that need checking
  cron.schedule("*/30 * * * * *", async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      const now = Date.now();
      const endpoints = await prisma.endpoint.findMany({
        where: { isPaused: false },
        include: {
          checks: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      });

      for (const ep of endpoints) {
        const lastCheck = ep.checks[0];
        const lastCheckTime = lastCheck
          ? new Date(lastCheck.timestamp).getTime()
          : 0;
        const elapsed = (now - lastCheckTime) / 1000;
        if (elapsed >= ep.interval) {
          try {
            await runCheck(ep);
          } catch (err) {
            console.error(`Check failed for ${ep.name}:`, err);
          }
        }
      }
    } finally {
      isRunning = false;
    }
  });

  console.log("[Cron] Health check runner started (every 30s scan)");
}
