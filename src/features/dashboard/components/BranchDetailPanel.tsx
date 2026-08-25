import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { BRANCH_STATUS_LABEL } from "../lib/branch-status";
import type { BranchNode } from "../types";

interface BranchDetailPanelProps {
  branch: BranchNode;
  alertCount: number;
}

export function BranchDetailPanel({
  branch,
  alertCount,
}: BranchDetailPanelProps) {
  const stats = [
    { label: "Unidades", value: formatNumber(branch.units) },
    { label: "SKU", value: formatNumber(branch.skuCount) },
    { label: "Alertas", value: formatNumber(alertCount) },
  ];

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {branch.kind === "warehouse" ? "Bodega central" : "Sucursal"} ·{" "}
            {branch.id}
          </p>
          <p className="text-lg font-semibold">{branch.name}</p>
        </div>
        <Badge
          variant={
            branch.status === "ok"
              ? "default"
              : branch.status === "low"
                ? "warning"
                : "destructive"
          }
        >
          {BRANCH_STATUS_LABEL[branch.status]}
        </Badge>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md bg-secondary/60 p-3">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted-foreground">
        {branch.lowStockCount === 0
          ? "Todos los productos de esta sede están por encima del stock mínimo."
          : `${formatNumber(branch.lowStockCount)} ${
              branch.lowStockCount === 1
                ? "producto requiere"
                : "productos requieren"
            } reposición desde la bodega central.`}
      </p>

      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link to="/inventario">
          Ver existencias
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
