import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Gauge,
  RotateCw,
} from "lucide-react";

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
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useRotacion } from "../hooks/useDashboardQueries";
import type { ProductoRotacion, RotacionData } from "../types";

function filaNombre(item: ProductoRotacion) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{item.nombre}</p>
      <p className="truncate text-xs text-muted-foreground">{item.sku}</p>
    </div>
  );
}

function Panel({ titulo, items, alta }: { titulo: string; items: ProductoRotacion[]; alta: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 pb-2">
        {alta ? (
          <ArrowUpFromLine className="h-4 w-4 text-emerald-700" aria-hidden="true" />
        ) : (
          <ArrowDownToLine className="h-4 w-4 text-destructive" aria-hidden="true" />
        )}
        <h4 className="text-sm font-medium">{titulo}</h4>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          Sin datos en el periodo.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.productoId}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              {filaNombre(item)}
              <div className="flex shrink-0 items-center gap-3 text-right">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatNumber(item.unidades)} uds. · stock{" "}
                  {formatNumber(item.stockActual)}
                </span>
                {alta ? (
                  <Badge
                    variant="default"
                    className="tabular-nums"
                    title="Rotación: unidades despachadas entre stock actual"
                  >
                    ×{formatNumber(item.rotacion)}
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    title="Sin salidas registradas en el periodo"
                  >
                    parado
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RotacionSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[0, 1].map((col) => (
        <div key={col} className="space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

function RotacionContent({ data }: { data: RotacionData }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Gauge className="h-4 w-4" aria-hidden="true" />
        <span>
          <strong className="font-medium text-foreground">
            {formatNumber(data.totalUnidades)}
          </strong>{" "}
          unidades despachadas en los últimos {data.periodoDias} días
        </span>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Panel titulo="Alta demanda" items={data.altaDemanda} alta />
        <Panel titulo="Baja demanda" items={data.bajaDemanda} alta={false} />
      </div>
    </div>
  );
}

export function RotacionCard() {
  const { data, isPending, isError, isFetching, refetch } = useRotacion();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Rotación de inventario</CardTitle>
        <CardDescription>
          Productos de alta y baja demanda según las unidades despachadas.
        </CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="Actualizar rotación de inventario"
          >
            <RotateCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              {data && !isFetching
                ? formatRelativeTime(data.updatedAt)
                : "Actualizando…"}
            </span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <RotacionSkeleton />
        ) : isError ? (
          <ErrorState
            title="No se pudo cargar la rotación de inventario"
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        ) : data.altaDemanda.length === 0 && data.bajaDemanda.length === 0 ? (
          <EmptyState
            icon={RotateCw}
            title="Sin datos de rotación"
            description="Cuando se registren salidas de inventario aparecerán aquí los productos con mayor y menor demanda."
          />
        ) : (
          <RotacionContent data={data} />
        )}
      </CardContent>
    </Card>
  );
}
