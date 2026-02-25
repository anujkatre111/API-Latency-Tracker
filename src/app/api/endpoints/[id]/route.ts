import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const endpoint = await prisma.endpoint.findFirst({
    where: { id, userId: session.user.id },
    include: {
      checks: {
        orderBy: { timestamp: "desc" },
        take: 100,
      },
    },
  });

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  return NextResponse.json(endpoint);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.endpoint.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      name,
      url,
      method,
      interval,
      expectedStatusCode,
      headers,
      body: requestBody,
      latencyThreshold,
      tags,
      timeout,
      isPaused,
    } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (url !== undefined) {
      try {
        new URL(url);
        data.url = url;
      } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
    }
    if (method !== undefined) {
      if (!["GET", "POST", "HEAD"].includes(method)) {
        return NextResponse.json(
          { error: "Method must be GET, POST, or HEAD" },
          { status: 400 }
        );
      }
      data.method = method;
    }
    if (interval !== undefined) {
      if (![30, 60, 300, 600, 1800].includes(interval)) {
        return NextResponse.json(
          { error: "Invalid interval" },
          { status: 400 }
        );
      }
      data.interval = interval;
    }
    if (expectedStatusCode !== undefined) data.expectedStatusCode = expectedStatusCode;
    if (headers !== undefined) data.headers = JSON.stringify(headers);
    if (requestBody !== undefined) data.body = JSON.stringify(requestBody);
    if (latencyThreshold !== undefined) data.latencyThreshold = latencyThreshold;
    if (tags !== undefined) data.tags = JSON.stringify(Array.isArray(tags) ? tags : []);
    if (timeout !== undefined) data.timeout = timeout;
    if (typeof isPaused === "boolean") data.isPaused = isPaused;

    const endpoint = await prisma.endpoint.update({
      where: { id },
      data: data as Parameters<typeof prisma.endpoint.update>[0]["data"],
    });

    return NextResponse.json(endpoint);
  } catch (error) {
    console.error("Update endpoint error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.endpoint.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  await prisma.endpoint.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
