import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StockAlert } from "../types";
import { EmptyState } from "./SectionState";

interface StockAlertsPanelProps {
  alerts: StockAlert[];
  highlightedBranchId: string;
}

export function StockAlertsPanel({
  alerts,
  highlightedBranchId,
}: StockAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Sin alertas de stock"
        description="Todas las existencias están por encima del mínimo definido."
      />
    );
  }

  return (
    <ul className="max-h-[21rem] space-y-2.5 overflow-y-auto pr-1">
      {alerts.map((alert) => {
        const coverage = Math.min(
          100,
          Math.round((alert.currentUnits / alert.minUnits) * 100)
        );
        const isCritical = alert.severity === "critical";

        return (
          <li
            key={alert.id}
            className={cn(
              "rounded-lg border p-3 transition-colors",
              alert.branchId === highlightedBranchId
                ? "border-foreground/25 bg-secondary/60"
                : "bg-card"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{alert.product}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.branchName}
                </p>
              </div>
              <Badge variant={isCritical ? "destructive" : "warning"}>
                {isCritical ? "Crítico" : "Bajo"}
              </Badge>
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-valuenow={coverage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Cobertura de stock de ${alert.product} en ${alert.branchName}`}
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    isCritical ? "bg-destructive" : "bg-amber-500"
                  )}
                  style={{ width: `${Math.max(coverage, 4)}%` }}
                />
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatNumber(alert.currentUnits)} / {formatNumber(alert.minUnits)} uds
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
