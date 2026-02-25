import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runCheck } from "@/lib/monitor";

export async function POST(
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
  });

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  try {
    const check = await runCheck(endpoint);
    return NextResponse.json(check);
  } catch (error) {
    console.error("Ping error:", error);
    return NextResponse.json(
      { error: "Check failed" },
      { status: 500 }
    );
  }
}
