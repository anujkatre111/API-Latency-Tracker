import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_ENDPOINTS = 10;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const endpoints = await prisma.endpoint.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      checks: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(endpoints);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await prisma.endpoint.count({
    where: { userId: session.user.id },
  });
  if (count >= MAX_ENDPOINTS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ENDPOINTS} endpoints allowed` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      url,
      method = "GET",
      interval = 60,
      expectedStatusCode = 200,
      headers,
      body: requestBody,
      latencyThreshold,
      tags = [],
      timeout = 10000,
    } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const validMethods = ["GET", "POST", "HEAD"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: "Method must be GET, POST, or HEAD" },
        { status: 400 }
      );
    }

    const validIntervals = [30, 60, 300, 600, 1800];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: "Interval must be 30, 60, 300, 600, or 1800 seconds" },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const endpoint = await prisma.endpoint.create({
      data: {
        userId: session.user.id,
        name,
        url,
        method,
        interval,
        expectedStatusCode,
        headers: headers ? JSON.stringify(headers) : undefined,
        body: requestBody ? JSON.stringify(requestBody) : undefined,
        latencyThreshold: latencyThreshold ?? undefined,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        timeout,
      },
    });

    return NextResponse.json(endpoint);
  } catch (error) {
    console.error("Create endpoint error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
