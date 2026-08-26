import { Building2, CalendarClock, Package, Truck } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Stepper } from "@/components/shared/Stepper";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import {
  ESTADO_ORDEN_LABEL,
  ESTADO_ORDEN_TONE,
  ETAPAS_ENVIO,
  etapaActual,
} from "../lib/estado-orden";
import type { OrdenCompra } from "../types";

interface OrdenCompraCardProps {
  orden: OrdenCompra;
}

export function OrdenCompraCard({ orden }: OrdenCompraCardProps) {
  const cancelada = orden.estado === "cancelada";
  const unidades = orden.items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <Card className="gap-4 py-5">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-foreground px-2 py-0.5 font-mono text-xs font-medium text-background">
            {orden.codigo}
          </span>
          <StatusBadge
            tone={ESTADO_ORDEN_TONE[orden.estado]}
            label={ESTADO_ORDEN_LABEL[orden.estado]}
          />
          <span className="ml-auto text-sm font-semibold tabular-nums">
            {formatCurrency(orden.total)}
          </span>
        </div>
        <p className="text-base font-medium">{orden.proveedor}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Destino</dt>
            <dd className="truncate">{orden.sucursalDestino}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Contenido</dt>
            <dd>
              {formatNumber(orden.items.length)}{" "}
              {orden.items.length === 1 ? "referencia" : "referencias"} ·{" "}
              {formatNumber(unidades)} unidades
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Emitida</dt>
            <dd className="text-muted-foreground">
              Emitida {formatDate(orden.fechaEmision)}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Entrega estimada</dt>
            <dd className="text-muted-foreground">
              Entrega {formatDate(orden.fechaEntregaEstimada)}
            </dd>
          </div>
        </dl>

        {cancelada ? null : (
          <Stepper steps={ETAPAS_ENVIO} currentStep={etapaActual(orden.estado)} />
        )}

        {orden.seguimiento ? (
          <p className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            {orden.seguimiento}
          </p>
        ) : null}

        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Ver ítems de la orden
          </summary>
          <ul className="mt-2 space-y-1.5 border-t pt-3">
            {orden.items.map((item) => (
              <li
                key={item.sku}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">
                  {item.nombre}
                  <span className="ml-2 text-xs text-muted-foreground">{item.sku}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatNumber(item.cantidad)} × {formatCurrency(item.precioUnitario)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}
