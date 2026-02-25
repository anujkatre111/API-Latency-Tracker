import { prisma } from "@/lib/db";
import type { Endpoint } from "@prisma/client";

export type EndpointStatus = "UP" | "DOWN" | "DEGRADED" | "PAUSED";

export function getEndpointStatus(
  endpoint: Endpoint,
  lastCheck: { latencyMs: number | null; isUp: boolean } | null
): EndpointStatus {
  if (endpoint.isPaused) return "PAUSED";
  if (!lastCheck) return "PAUSED";
  if (!lastCheck.isUp) return "DOWN";
  if (
    endpoint.latencyThreshold &&
    lastCheck.latencyMs !== null &&
    lastCheck.latencyMs > endpoint.latencyThreshold
  ) {
    return "DEGRADED";
  }
  return "UP";
}

async function performFetch(endpoint: Endpoint): Promise<{
  latencyMs: number;
  statusCode: number;
  isUp: boolean;
  error: string | null;
}> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    endpoint.timeout || 10000
  );

  try {
    let parsedHeaders: Record<string, string> = {};
    if (endpoint.headers) {
      try {
        parsedHeaders = JSON.parse(endpoint.headers) as Record<string, string>;
      } catch {
        /* ignore */
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...parsedHeaders,
    };

    const options: RequestInit = {
      method: endpoint.method,
      headers,
      signal: controller.signal,
    };

    if (endpoint.method === "POST" && endpoint.body) {
      try {
        const parsedBody = JSON.parse(endpoint.body) as unknown;
        options.body = JSON.stringify(parsedBody);
      } catch {
        options.body = endpoint.body;
      }
    }

    const response = await fetch(endpoint.url, options);
    const latencyMs = Date.now() - start;
    const statusCode = response.status;
    const isUp = response.status === endpoint.expectedStatusCode;
    const error = isUp
      ? null
      : `Expected ${endpoint.expectedStatusCode}, got ${response.status}`;

    return { latencyMs, statusCode, isUp, error };
  } catch (e) {
    const latencyMs = Date.now() - start;
    const error = e instanceof Error ? e.message : "Request failed";
    return { latencyMs, statusCode: 0, isUp: false, error };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function runCheck(
  endpoint: Endpoint
): Promise<{
  latencyMs: number | null;
  statusCode: number | null;
  isUp: boolean;
  error?: string;
}> {
  let result = await performFetch(endpoint);

  // Retry once on failure
  if (!result.isUp && !result.error?.includes("abort")) {
    result = await performFetch(endpoint);
  }

  await prisma.check.create({
    data: {
      endpointId: endpoint.id,
      latencyMs: result.statusCode ? result.latencyMs : null,
      statusCode: result.statusCode || null,
      error: result.error ?? undefined,
      isUp: result.isUp,
    },
  });

  return {
    latencyMs: result.latencyMs,
    statusCode: result.statusCode || null,
    isUp: result.isUp,
    error: result.error ?? undefined,
  };
}
