"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import type { Check } from "@prisma/client";

const RANGES = [
  { value: "1h", label: "1 hour" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const;

type Range = (typeof RANGES)[number]["value"];

interface EndpointDetailClientProps {
  endpointId: string;
  endpointName: string;
  uptimePct: number | null;
  p50: number | null;
  p95: number | null;
  p99: number | null;
  recentChecks: Check[];
}

export function EndpointDetailClient({
  endpointId,
  endpointName,
  uptimePct,
  p50,
  p95,
  p99,
  recentChecks,
}: EndpointDetailClientProps) {
  const [range, setRange] = useState<Range>("24h");
  const [chartData, setChartData] = useState<{ time: string; latency: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    async function fetchChecks() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/checks?endpointId=${endpointId}&range=${range}&limit=500`
        );
        const checks: Check[] = await res.json();
        const data = checks
          .filter((c) => c.latencyMs != null)
          .map((c) => ({
            time: new Date(c.timestamp).toLocaleTimeString(),
            latency: c.latencyMs as number,
            full: new Date(c.timestamp).toISOString(),
          }))
          .sort(
            (a, b) =>
              new Date(a.full).getTime() - new Date(b.full).getTime()
          );
        setChartData(data);
      } catch {
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchChecks();
  }, [endpointId, range]);

  async function handlePing() {
    setPinging(true);
    try {
      await fetch(`/api/endpoints/${endpointId}/ping`, { method: "POST" });
      window.location.reload();
    } finally {
      setPinging(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Uptime (7d)</CardDescription>
            <CardTitle className="text-2xl">
              {uptimePct != null ? `${uptimePct}%` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>p50</CardDescription>
            <CardTitle className="text-2xl">
              {p50 != null ? `${p50} ms` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>p95</CardDescription>
            <CardTitle className="text-2xl">
              {p95 != null ? `${p95} ms` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>p99</CardDescription>
            <CardTitle className="text-2xl">
              {p99 != null ? `${p99} ms` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Latency chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Latency</CardTitle>
            <CardDescription>Response time over time</CardDescription>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.value}
                variant={range === r.value ? "default" : "outline"}
                size="sm"
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePing}
              disabled={pinging}
            >
              <RefreshCw
                className={`size-4 ${pinging ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No data for this period. Run a manual ping to get started.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}ms`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value) => [`${value ?? 0} ms`, "Latency"]}
                  labelFormatter={(_, payload) =>
                    payload[0]?.payload?.full
                      ? new Date(payload[0].payload.full).toLocaleString()
                      : ""
                  }
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="var(--chart-1)"
                  fill="url(#latencyGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent checks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Checks</CardTitle>
          <CardDescription>Latest health check results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentChecks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No checks yet
                  </TableCell>
                </TableRow>
              ) : (
                recentChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell>
                      {new Date(check.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {check.latencyMs != null ? `${check.latencyMs} ms` : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          check.isUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {check.statusCode ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {check.error ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href={`/endpoints/${endpointId}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>
    </div>
  );
}
