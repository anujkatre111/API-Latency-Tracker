import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EndpointStatus } from "@/lib/monitor";

const statusConfig: Record<
  EndpointStatus,
  { label: string; className: string }
> = {
  UP: { label: "UP", className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  DOWN: { label: "DOWN", className: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30" },
  DEGRADED: { label: "DEGRADED", className: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  PAUSED: { label: "PAUSED", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: EndpointStatus }) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
