"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Endpoint } from "@prisma/client";

const INTERVALS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 1800, label: "30 minutes" },
];

const METHODS = ["GET", "POST", "HEAD"];

type EndpointWithStrings = Omit<Endpoint, "headers" | "body" | "tags"> & {
  headers: string;
  body: string;
  tags: string;
};

export function EditEndpointForm({
  endpoint,
}: {
  endpoint: EndpointWithStrings;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: endpoint.name,
    url: endpoint.url,
    method: endpoint.method,
    interval: endpoint.interval,
    expectedStatusCode: endpoint.expectedStatusCode,
    latencyThreshold: endpoint.latencyThreshold?.toString() ?? "",
    headers: endpoint.headers,
    body: endpoint.body,
    tags: endpoint.tags,
    isPaused: endpoint.isPaused,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const headersObj: Record<string, string> = {};
      if (form.headers.trim()) {
        form.headers.split("\n").forEach((line) => {
          const [key, ...val] = line.split(":");
          if (key?.trim()) {
            headersObj[key.trim()] = val.join(":").trim();
          }
        });
      }

      let bodyObj: Record<string, unknown> | undefined;
      if (form.body.trim()) {
        try {
          bodyObj = JSON.parse(form.body) as Record<string, unknown>;
        } catch {
          setError("Request body must be valid JSON");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/endpoints/${endpoint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          url: form.url,
          method: form.method,
          interval: form.interval,
          expectedStatusCode: form.expectedStatusCode,
          latencyThreshold: form.latencyThreshold
            ? parseInt(form.latencyThreshold, 10)
            : undefined,
          headers: Object.keys(headersObj).length ? headersObj : undefined,
          body: bodyObj,
          tags: form.tags
            ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          isPaused: form.isPaused,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update endpoint");
        setLoading(false);
        return;
      }

      router.push(`/endpoints/${endpoint.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;
    setLoading(true);
    try {
      await fetch(`/api/endpoints/${endpoint.id}`, { method: "DELETE" });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Failed to delete");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Endpoint Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>HTTP Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Check Interval</Label>
              <Select
                value={String(form.interval)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, interval: parseInt(v, 10) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((i) => (
                    <SelectItem key={i.value} value={String(i.value)}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expectedStatusCode">Expected Status Code</Label>
              <Input
                id="expectedStatusCode"
                type="number"
                min={100}
                max={599}
                value={form.expectedStatusCode}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    expectedStatusCode: parseInt(e.target.value, 10) || 200,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latencyThreshold">Latency Threshold (ms)</Label>
              <Input
                id="latencyThreshold"
                type="number"
                min={0}
                value={form.latencyThreshold}
                onChange={(e) =>
                  setForm((f) => ({ ...f, latencyThreshold: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaused"
              checked={form.isPaused}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPaused: e.target.checked }))
              }
              className="rounded border-input"
            />
            <Label htmlFor="isPaused">Pause monitoring</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="headers">Request Headers</Label>
            <Textarea
              id="headers"
              value={form.headers}
              onChange={(e) => setForm((f) => ({ ...f, headers: e.target.value }))}
              rows={3}
              className="font-mono text-sm"
            />
          </div>
          {form.method === "POST" && (
            <div className="space-y-2">
              <Label htmlFor="body">Request Body</Label>
              <Textarea
                id="body"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
