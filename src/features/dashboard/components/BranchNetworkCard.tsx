import { useState } from "react";
import { Network, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useBranchNetwork } from "../hooks/useDashboardQueries";
import type { BranchNetworkData } from "../types";
import { BranchDetailPanel } from "./BranchDetailPanel";
import { BranchNetworkMap } from "./BranchNetworkMap";
import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { StockAlertsPanel } from "./StockAlertsPanel";

const LEGEND = [
  { label: "Bodega central", className: "border-sky-500 bg-sky-50" },
  { label: "Sucursal operativa", className: "border-emerald-500 bg-primary/20" },
  { label: "Stock bajo", className: "border-amber-500 bg-amber-50" },
  { label: "Stock crítico", className: "border-destructive bg-destructive/10" },
];

function NetworkSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[16/7] min-h-[300px] w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

function NetworkContent({ nodes, links, alerts }: BranchNetworkData) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedBranch =
    nodes.find((node) => node.id === selectedId) ??
    nodes.find((node) => node.kind === "warehouse") ??
    nodes[0];

  const branchAlerts = alerts.filter(
    (alert) => alert.branchId === selectedBranch.id
  );

  return (
    <div className="space-y-4">
      <BranchNetworkMap
        nodes={nodes}
        links={links}
        selectedId={selectedBranch.id}
        onSelect={setSelectedId}
      />

      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span
              className={cn("h-3 w-3 rounded-full border-2", item.className)}
              aria-hidden="true"
            />
            {item.label}
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="alertas-stock" className="space-y-3">
          <h3 id="alertas-stock" className="text-sm font-semibold">
            Alertas de stock en la red
          </h3>
          <StockAlertsPanel
            alerts={alerts}
            highlightedBranchId={selectedBranch.id}
          />
        </section>

        <section aria-labelledby="detalle-sucursal" className="space-y-3">
          <h3 id="detalle-sucursal" className="text-sm font-semibold">
            Detalle de la sede seleccionada
          </h3>
          <BranchDetailPanel
            branch={selectedBranch}
            alertCount={branchAlerts.length}
          />
        </section>
      </div>
    </div>
  );
}

export function BranchNetworkCard() {
  const { data, isPending, isError, isFetching, refetch } = useBranchNetwork();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Red de inventario en tiempo real</CardTitle>
        <CardDescription>
          Estado de las sedes y sus rutas de reabastecimiento. Selecciona una
          sede para ver su detalle.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Actualizar estado de la red"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              {data && !isFetching
                ? `Actualizado ${formatTime(data.updatedAt)}`
                : "Actualizando…"}
            </span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <NetworkSkeleton />
        ) : isError ? (
          <ErrorState
            title="No se pudo cargar el estado de la red"
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        ) : data.nodes.length === 0 ? (
          <EmptyState
            icon={Network}
            title="Sin sucursales registradas"
            description="Registra al menos una sede para visualizar la red de inventario."
          />
        ) : (
          <NetworkContent
            nodes={data.nodes}
            links={data.links}
            alerts={data.alerts}
            updatedAt={data.updatedAt}
          />
        )}
      </CardContent>
    </Card>
  );
}
