import {
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Layers,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInventorySummary } from "../hooks/useDashboardQueries";
import type { InventorySummaryData } from "../types";
import { EmptyState, ErrorState } from "./SectionState";
import { StockDistributionChart } from "./StockDistributionChart";

interface IndicatorProps {
  label: string;
  hint: string;
  value: string;
  tone: "positive" | "negative";
}

function Indicator({ label, hint, value, tone }: IndicatorProps) {
  const Icon = tone === "positive" ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium">{label}</span>
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label={`Más información sobre ${label}`}
            className="rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
        </Tooltip>
      </div>
      <p
        className={cn(
          "flex items-center gap-1 text-lg font-semibold tabular-nums",
          tone === "positive" ? "text-emerald-700" : "text-destructive"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {value}
      </p>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
      <div className="space-y-4">
        <Skeleton className="h-11 w-64" />
        <Skeleton className="h-5 w-48" />
        <Separator />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Skeleton className="h-[190px] w-[190px] shrink-0 rounded-full" />
        <div className="w-full space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryContent({ summary, distribution }: InventorySummaryData) {
  const positiveTrend = summary.changePercent >= 0;
  const TrendIcon = positiveTrend ? TrendingUp : TrendingDown;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
            {formatCurrency(summary.totalValue)}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                positiveTrend
                  ? "bg-primary/25 text-emerald-800"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {formatPercent(summary.changePercent)}
            </span>
            <span>frente al periodo anterior</span>
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Layers
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <dt className="text-muted-foreground">Unidades</dt>
            <dd className="font-medium tabular-nums">
              {formatNumber(summary.totalUnits)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-muted-foreground">SKU activos</dt>
            <dd className="font-medium tabular-nums">
              {formatNumber(summary.skuCount)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-muted-foreground">Sucursales</dt>
            <dd className="font-medium tabular-nums">
              {formatNumber(summary.branchCount)}
            </dd>
          </div>
        </dl>

        <Separator />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Indicator
            label="Entradas (30 días)"
            hint="Valor de la mercancía recibida por órdenes de compra en los últimos 30 días."
            value={formatCurrency(summary.inflowValue30d)}
            tone="positive"
          />
          <Indicator
            label="Salidas (30 días)"
            hint="Valor de la mercancía despachada por ventas en los últimos 30 días."
            value={formatCurrency(-summary.outflowValue30d)}
            tone="negative"
          />
        </div>
      </div>

      {distribution.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title="Sin distribución para mostrar"
          description="Aún no hay existencias registradas por categoría."
        />
      ) : (
        <StockDistributionChart data={distribution} />
      )}
    </div>
  );
}

export function InventorySummaryCard() {
  const { data, isPending, isError, isFetching, refetch } =
    useInventorySummary();

  return (
    <Card>
      <CardHeader>
        <CardDescription>Valor total del inventario</CardDescription>
        <CardTitle className="text-base">
          Existencias consolidadas de todas las sucursales
        </CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Actualizar resumen de inventario"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              {data && !isFetching
                ? formatRelativeTime(data.summary.updatedAt)
                : "Actualizando…"}
            </span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <SummarySkeleton />
        ) : isError ? (
          <ErrorState
            title="No se pudo cargar el resumen de inventario"
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        ) : (
          <SummaryContent
            summary={data.summary}
            distribution={data.distribution}
          />
        )}
      </CardContent>
    </Card>
  );
}
