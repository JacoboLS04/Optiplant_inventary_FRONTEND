import { BarChart3, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useVentasMensuales } from "../hooks/useDashboardQueries";
import type { MesVentas, VentasMensualesData } from "../types";

function VentasMensualesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Separator />
      <div className="flex h-40 items-end gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChartBarras({ meses }: { meses: MesVentas[] }) {
  const maxTotal = Math.max(...meses.map((m) => m.total), 1);

  return (
    <div className="flex h-44 items-end gap-3">
      {meses.map((m, index) => {
        const esActual = index === meses.length - 1;
        const altura = (m.total / maxTotal) * 100;
        return (
          <div
            key={`${m.anio}-${m.mes}`}
            className="group flex flex-1 flex-col items-center gap-2"
          >
            <span
              className={cn(
                "text-xs font-medium tabular-nums text-muted-foreground",
                esActual && "text-foreground"
              )}
            >
              {formatCompactCurrency(m.total)}
            </span>
            <div
              className={cn(
                "w-full rounded-t-md transition-colors",
                esActual
                  ? "bg-primary"
                  : "bg-primary/30 group-hover:bg-primary/50",
                m.total === 0 && "h-1 bg-muted"
              )}
              style={{ height: `${Math.max(altura, 2)}%` }}
              title={`${m.etiqueta}: ${formatCurrency(m.total)}`}
            />
            <span className="truncate text-xs text-muted-foreground">
              {m.etiqueta}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function VentasMensualesContent({ data }: { data: VentasMensualesData }) {
  const mesActual = data.meses.length > 0 ? data.meses[data.meses.length - 1] : null;
  const anteriores = data.meses.slice(0, -1);
  const totalAnterior = anteriores.reduce((acc, m) => acc + m.total, 0);

  let variacion: number | null = null;
  if (mesActual && totalAnterior > 0) {
    variacion = ((mesActual.total - totalAnterior) / totalAnterior) * 100;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Volumen de ventas del mes en curso
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {mesActual ? formatCurrency(mesActual.total) : formatCurrency(0)}
          </p>
        </div>
        {mesActual && mesActual.total > 0 ? (
          <Badge
            variant={variacion !== null && variacion >= 0 ? "default" : "destructive"}
            className="tabular-nums"
            title="Comparado con el total de los meses anteriores"
          >
            {variacion === null
              ? "Mes inicial"
              : `${variacion >= 0 ? "+" : ""}${formatCompactCurrency(variacion)}% vs. anteriores`}
          </Badge>
        ) : null}
      </div>

      <Separator />

      <ChartBarras meses={data.meses} />

      <p className="text-xs text-muted-foreground">
        Total del periodo:{" "}
        <strong className="tabular-nums">
          {formatCurrency(data.totalPeriodo)}
        </strong>{" "}
        · {data.mesesConsiderados} meses considerados.
      </p>
    </div>
  );
}

export function VentasMensualesCard() {
  const { data, isPending, isError, isFetching, refetch } = useVentasMensuales();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Ventas mensuales</CardTitle>
        <CardDescription>
          Volumen de ventas del mes en curso frente a meses anteriores.
        </CardDescription>
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link to="/ventas">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Historial de ventas</span>
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <VentasMensualesSkeleton />
        ) : isError ? (
          <ErrorState
            title="No se pudo cargar el volumen de ventas"
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        ) : data.meses.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Sin ventas registradas"
            description="Cuando se registren ventas aparecerá aquí la comparativa mensual."
          />
        ) : (
          <VentasMensualesContent data={data} />
        )}
      </CardContent>
    </Card>
  );
}
