import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runCheck } from "@/lib/monitor";

// Secured by CRON_SECRET - Vercel Cron or external scheduler sends this header
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = request.headers.get("x-cron-secret");
  const isAuthorized =
    CRON_SECRET &&
    (authHeader === `Bearer ${CRON_SECRET}` || cronSecret === CRON_SECRET);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const toCheck: typeof endpoints = [];
  for (const ep of endpoints) {
    const lastCheck = ep.checks[0];
    const lastCheckTime = lastCheck
      ? new Date(lastCheck.timestamp).getTime()
      : 0;
    const elapsed = (now - lastCheckTime) / 1000;
    if (elapsed >= ep.interval) {
      toCheck.push(ep);
    }
  }

  const results = await Promise.allSettled(
    toCheck.map((ep) => runCheck(ep))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    checked: toCheck.length,
    succeeded,
    failed,
  });
}
