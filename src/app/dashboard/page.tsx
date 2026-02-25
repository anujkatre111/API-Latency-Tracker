import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEndpointStatus } from "@/lib/monitor";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

async function getDashboardData(userId: string) {
  const endpoints = await prisma.endpoint.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      checks: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
  });

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let totalUp = 0;
  let totalDown = 0;
  let totalDegraded = 0;
  let totalLatency = 0;
  let latencyCount = 0;

  for (const ep of endpoints) {
    const lastCheck = ep.checks[0];
    const status = getEndpointStatus(ep, lastCheck ?? null);

    if (status === "UP") totalUp++;
    else if (status === "DOWN") totalDown++;
    else if (status === "DEGRADED") totalDegraded++;

    if (lastCheck?.latencyMs != null) {
      totalLatency += lastCheck.latencyMs;
      latencyCount++;
    }
  }

  const avgLatency =
    latencyCount > 0 ? Math.round(totalLatency / latencyCount) : null;

  const endpointIds = endpoints.map((e) => e.id);
  const checks24h = await prisma.check.findMany({
    where: {
      endpointId: { in: endpointIds },
      timestamp: { gte: twentyFourHoursAgo },
      latencyMs: { not: null },
    },
    select: { latencyMs: true },
  });
  const avgLatency24h =
    checks24h.length > 0
      ? Math.round(
          checks24h.reduce((s, c) => s + (c.latencyMs ?? 0), 0) / checks24h.length
        )
      : null;

  const globalStatus =
    totalDown > 0 ? "outage" : totalDegraded > 0 ? "degraded" : "operational";

  return {
    endpoints,
    stats: {
      total: endpoints.length,
      up: totalUp,
      down: totalDown,
      degraded: totalDegraded,
      avgLatency24h: avgLatency24h ?? avgLatency,
    },
    globalStatus,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getDashboardData(session.user.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your API endpoints at a glance
          </p>
        </div>
        <Link href="/endpoints/new">
          <Button>
            <PlusCircle className="mr-2 size-4" />
            Add Endpoint
          </Button>
        </Link>
      </div>

      {/* Global status banner */}
      <div
        className={`rounded-lg border px-4 py-3 ${
          data.globalStatus === "outage"
            ? "border-red-500/50 bg-red-500/10"
            : data.globalStatus === "degraded"
              ? "border-amber-500/50 bg-amber-500/10"
              : "border-emerald-500/50 bg-emerald-500/10"
        }`}
      >
        <p className="font-medium">
          {data.globalStatus === "outage"
            ? "⚠️ Some endpoints are down"
            : data.globalStatus === "degraded"
              ? "⚡ Degraded performance detected"
              : "✓ All systems operational"}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Endpoints</CardDescription>
            <CardTitle className="text-3xl">{data.stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Endpoints Up</CardDescription>
            <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-400">
              {data.stats.up}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Endpoints Down</CardDescription>
            <CardTitle className="text-3xl text-red-600 dark:text-red-400">
              {data.stats.down}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Latency (24h)</CardDescription>
            <CardTitle className="text-3xl">
              {data.stats.avgLatency24h != null
                ? `${data.stats.avgLatency24h} ms`
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Endpoints table */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>Your monitored API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {data.endpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <p className="mb-4 text-muted-foreground">
                No endpoints yet. Add your first one to get started.
              </p>
              <Link href="/endpoints/new">
                <Button>
                  <PlusCircle className="mr-2 size-4" />
                  Add Endpoint
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Last Check</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.endpoints.map((ep) => {
                  const lastCheck = ep.checks[0];
                  const status = getEndpointStatus(ep, lastCheck ?? null);
                  return (
                    <TableRow key={ep.id}>
                      <TableCell className="font-medium">{ep.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-sm text-muted-foreground">
                        {ep.url}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell>
                        {lastCheck?.latencyMs != null
                          ? `${lastCheck.latencyMs} ms`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lastCheck
                          ? new Date(lastCheck.timestamp).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/endpoints/${ep.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
