import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEndpointStatus } from "@/lib/monitor";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EndpointDetailClient } from "@/components/endpoints/endpoint-detail-client";

export default async function EndpointDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const endpoint = await prisma.endpoint.findFirst({
    where: { id, userId: session.user.id },
    include: {
      checks: {
        orderBy: { timestamp: "desc" },
        take: 50,
      },
    },
  });

  if (!endpoint) notFound();

  const lastCheck = endpoint.checks[0] ?? null;
  const status = getEndpointStatus(endpoint, lastCheck);

  const checksForUptime = await prisma.check.findMany({
    where: {
      endpointId: id,
      timestamp: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    select: { isUp: true },
  });
  const upCount = checksForUptime.filter((c) => c.isUp).length;
  const uptimePct =
    checksForUptime.length > 0
      ? Math.round((upCount / checksForUptime.length) * 100)
      : null;

  const latencies = endpoint.checks
    .filter((c) => c.latencyMs != null)
    .map((c) => c.latencyMs as number);
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? null;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? null;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{endpoint.name}</h1>
          <p className="font-mono text-sm text-muted-foreground truncate max-w-md">
            {endpoint.url}
          </p>
        </div>
        <StatusBadge status={status} />
        {lastCheck?.latencyMs != null && (
          <span className="text-sm text-muted-foreground">
            {lastCheck.latencyMs} ms
          </span>
        )}
      </div>

      <EndpointDetailClient
        endpointId={id}
        endpointName={endpoint.name}
        uptimePct={uptimePct}
        p50={p50}
        p95={p95}
        p99={p99}
        recentChecks={endpoint.checks}
      />
    </div>
  );
}
