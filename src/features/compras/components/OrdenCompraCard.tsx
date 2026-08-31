import { useState } from "react";
import {
  Ban,
  Building2,
  CalendarClock,
  Loader2,
  Package,
  Printer,
  Send,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Stepper } from "@/components/shared/Stepper";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import {
  ACCIONES_DISPONIBLES,
  DESTINO_ACCION,
  ESTADO_ORDEN_LABEL,
  ESTADO_ORDEN_TONE,
  ETAPAS_ENVIO,
  etapaActual,
  type AccionOrden,
} from "../lib/estado-orden";
import { useCambiarEstadoOrden } from "../hooks/useCompras";
import { imprimirOrdenCompra } from "../lib/documento-orden";
import type { OrdenCompra } from "../types";
import { RecepcionOrdenDialog } from "./RecepcionOrdenDialog";

interface OrdenCompraCardProps {
  orden: OrdenCompra;
}

const ETIQUETA_ACCION: Record<AccionOrden, { icon: typeof Send; label: string }> = {
  enviar: { icon: Send, label: "Enviar al proveedor" },
  cancelar: { icon: Ban, label: "Cancelar" },
  registrarRecepcion: { icon: Package, label: "Registrar recepción" },
};

export function OrdenCompraCard({ orden }: OrdenCompraCardProps) {
  const cambiarEstado = useCambiarEstadoOrden();
  const [recepcionAbierta, setRecepcionAbierta] = useState(false);

  const cancelada = orden.estado === "cancelada";
  const unidades = orden.items.reduce(
    (acc, item) => acc + item.cantidadOrdenada,
    0
  );
  const acciones = ACCIONES_DISPONIBLES[orden.estado];

  const ejecutar = async (accion: AccionOrden) => {
    const destino = DESTINO_ACCION[accion];
    if (!destino) return;
    try {
      await cambiarEstado.mutateAsync({ id: orden.id, estado: destino });
      toast.success(ETIQUETA_ACCION[accion].label, {
        description: `La orden ${orden.codigo} pasó a «${ESTADO_ORDEN_LABEL[destino]}».`,
      });
    } catch (error) {
      const mensaje = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error("No se pudo cambiar el estado", {
        description: mensaje,
      });
    }
  };

  return (
    <>
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
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Imprimir ${orden.codigo}`}
              title="Imprimir / guardar PDF"
              onClick={() => imprimirOrdenCompra(orden)}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
            </Button>
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
                {orden.fechaEntregaEstimada
                  ? `Entrega ${formatDate(orden.fechaEntregaEstimada)}`
                  : "Sin fecha de entrega"}
              </dd>
            </div>
          </dl>

          {cancelada ? null : (
            <Stepper steps={ETAPAS_ENVIO} currentStep={etapaActual(orden.estado)} />
          )}

          {orden.transportista || orden.guia ? (
            <p className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
              {[orden.transportista, orden.guia && `Guía ${orden.guia}`]
                .filter(Boolean)
                .join(" · ")}
              {orden.condicionesPago ? ` · ${orden.condicionesPago}` : ""}
            </p>
          ) : null}

          <details className="group">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Ver ítems de la orden
            </summary>
            <ul className="mt-2 space-y-1.5 border-t pt-3">
              {orden.items.map((item) => {
                const progreso =
                  item.cantidadOrdenada > 0
                    ? Math.min(
                        (item.cantidadRecibida / item.cantidadOrdenada) * 100,
                        100
                      )
                    : 0;
                return (
                  <li
                    key={item.lineaId}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {item.nombre}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {item.sku}
                      </span>
                    </span>
                    <span className="flex items-center gap-3 tabular-nums text-muted-foreground">
                      <span>
                        {formatNumber(item.cantidadOrdenada)} ×{" "}
                        {formatCurrency(item.precioUnitario)}
                        {item.descuento > 0 ? ` − ${formatCurrency(item.descuento)}` : ""}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                          <span
                            className="block h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progreso}%` }}
                          />
                        </span>
                        <span className="text-xs">
                          {formatNumber(item.cantidadRecibida)}/
                          {formatNumber(item.cantidadOrdenada)}
                        </span>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </details>
        </CardContent>

        {acciones.length > 0 ? (
          <CardFooter className="flex flex-wrap gap-2">
            {acciones.map((accion) => {
              const { icon: Icon, label } = ETIQUETA_ACCION[accion];
              const esCancelar = accion === "cancelar";
              if (accion === "registrarRecepcion") {
                return (
                  <Button
                    key={accion}
                    type="button"
                    size="sm"
                    disabled={cambiarEstado.isPending}
                    onClick={() => setRecepcionAbierta(true)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Button>
                );
              }
              return (
                <Button
                  key={accion}
                  type="button"
                  size="sm"
                  variant={esCancelar ? "destructive" : "outline"}
                  disabled={cambiarEstado.isPending}
                  onClick={() => void ejecutar(accion)}
                >
                  {cambiarEstado.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {label}
                </Button>
              );
            })}
          </CardFooter>
        ) : null}
      </Card>

      <RecepcionOrdenDialog
        orden={orden}
        open={recepcionAbierta}
        onOpenChange={setRecepcionAbierta}
      />
    </>
  );
}
