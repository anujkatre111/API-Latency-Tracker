import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const endpointId = searchParams.get("endpointId");
  const range = searchParams.get("range") || "24h"; // 1h, 24h, 7d, 30d
  const limit = Math.min(parseInt(searchParams.get("limit") || "500", 10), 1000);

  if (!endpointId) {
    return NextResponse.json(
      { error: "endpointId is required" },
      { status: 400 }
    );
  }

  const endpoint = await prisma.endpoint.findFirst({
    where: { id: endpointId, userId: session.user.id },
  });

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  const now = new Date();
  let since: Date;
  switch (range) {
    case "1h":
      since = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case "24h":
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  const checks = await prisma.check.findMany({
    where: {
      endpointId,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: "asc" },
    take: limit,
  });

  return NextResponse.json(checks);
}
