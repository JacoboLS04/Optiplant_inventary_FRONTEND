import { useState } from "react";
import { CheckCircle2, Package, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { SearchInput } from "@/components/shared/SearchInput";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ESTADO_ORDEN_LABEL,
  ESTADO_ORDEN_TONE,
} from "@/features/compras/lib/estado-orden";
import type { EstadoOrdenCompra, OrdenCompra } from "@/features/compras/types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { mensajeDeError } from "@/lib/api-error";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useConfirmarOrden, usePortalOrdenes } from "../hooks/usePortal";
import { DespacharOrdenDialog } from "../components/DespacharOrdenDialog";

type FiltroEstado = EstadoOrdenCompra | "todas";

const OPCIONES_ESTADO: FiltroEstado[] = [
  "todas",
  "enviada",
  "confirmada",
  "en_transito",
  "recibida",
  "cancelada",
];

const ETIQUETA_FILTRO: Record<FiltroEstado, string> = {
  todas: "Todas",
  borrador: "Borrador",
  enviada: "Pendientes de confirmar",
  confirmada: "Confirmadas",
  en_transito: "En tránsito",
  recibida: "Recibidas",
  cancelada: "Canceladas",
};

export default function PortalProveedor() {
  const { user } = useAuth();
  const [estado, setEstado] = useState<FiltroEstado>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [despachar, setDespachar] = useState<OrdenCompra | null>(null);

  const confirmar = useConfirmarOrden();

  const { data: ordenes = [], isPending, isError, refetch } = usePortalOrdenes(
    estado,
    busqueda || undefined
  );

  const proveedorNombre =
    user?.name?.replace(/\s*\(Portal de proveedor\)\s*$/i, "") ?? user?.name ?? "";

  const confirmarPedido = async (orden: OrdenCompra) => {
    try {
      await confirmar.mutateAsync(orden.id);
      toast.success("Pedido confirmado", {
        description: `${orden.codigo} fue aceptado y pasó a «Confirmada».`,
      });
    } catch (error) {
      toast.error(mensajeDeError(error, "No se pudo confirmar el pedido"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal de proveedor"
        description={`Bienvenido, ${proveedorNombre}. Aquí ves solo los pedidos de tu empresa.`}
      />

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={estado}
          onValueChange={(valor) => setEstado(valor as FiltroEstado)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {OPCIONES_ESTADO.map((opcion) => (
              <SelectItem key={opcion} value={opcion}>
                {ETIQUETA_FILTRO[opcion]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por código, sucursal…"
          label="Buscar pedidos"
          id="buscar-pedidos"
          className="w-64"
        />
      </div>

      {/* ── Contenido ── */}
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : ordenes.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Sin pedidos que mostrar"
          description="Cuando la empresa te envíe un pedido, aparecerá aquí para que lo confirmes y despaches."
        />
      ) : (
        <div className="grid gap-4">
          {ordenes.map((orden) => (
            <Card key={orden.id}>
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">
                    {orden.codigo}
                  </span>
                  <StatusBadge
                    tone={ESTADO_ORDEN_TONE[orden.estado]}
                    label={ESTADO_ORDEN_LABEL[orden.estado]}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {orden.estado === "enviada" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={confirmar.isPending}
                      onClick={() => void confirmarPedido(orden)}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Confirmar pedido
                    </Button>
                  ) : null}
                  {orden.estado === "confirmada" ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setDespachar(orden)}
                    >
                      <Truck className="h-4 w-4" aria-hidden="true" />
                      Despachar
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Entrega en
                    </p>
                    <p className="font-medium">{orden.sucursalDestino}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Fecha de emisión
                    </p>
                    <p>{formatDate(orden.fechaEmision)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Total del pedido
                    </p>
                    <p className="font-semibold tabular-nums">
                      {formatCurrency(orden.total)}
                    </p>
                  </div>
                </div>

                {orden.transportista || orden.guia ? (
                  <p className="text-xs text-muted-foreground">
                    {orden.transportista ? `Transportista: ${orden.transportista}. ` : ""}
                    {orden.guia ? `Guía: ${orden.guia}. ` : ""}
                    {orden.fechaEntregaEstimada
                      ? `Entrega estimada: ${formatDate(orden.fechaEntregaEstimada)}.`
                      : ""}
                  </p>
                ) : null}

                <details className="group rounded-lg border bg-background/50 px-3 py-2">
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    <Package className="h-4 w-4" aria-hidden="true" />
                    {orden.items.length} producto
                    {orden.items.length === 1 ? "" : "s"} ·{" "}
                    {formatNumber(
                      orden.items.reduce((acc, l) => acc + l.cantidadOrdenada, 0)
                    )}{" "}
                    unidades
                    <span className="ml-auto transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <ul className="mt-2 space-y-1 border-t pt-2 text-sm">
                    {orden.items.map((linea) => (
                      <li
                        key={linea.lineaId}
                        className="flex flex-wrap items-baseline justify-between gap-2"
                      >
                        <span className="min-w-0">
                          <span className="font-medium">{linea.nombre}</span>{" "}
                          <span className="text-xs text-muted-foreground">
                            {linea.sku}
                          </span>
                        </span>
                        <span className="tabular-nums">
                          {formatNumber(linea.cantidadOrdenada)} ×{" "}
                          {formatCurrency(linea.precioUnitario)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {despachar ? (
        <DespacharOrdenDialog
          orden={despachar}
          open
          onOpenChange={(open) => {
            if (!open) setDespachar(null);
          }}
        />
      ) : null}
    </div>
  );
}