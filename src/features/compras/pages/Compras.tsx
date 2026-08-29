import { useMemo, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import {
  FiltrosCompras,
  type FiltrosComprasValue,
} from "../components/FiltrosCompras";
import { CrearOrdenCompraDialog } from "../components/CrearOrdenCompraDialog";
import { OrdenCompraCard } from "../components/OrdenCompraCard";
import { useOrdenesCompra } from "../hooks/useCompras";
import { ESTADO_ORDEN_LABEL } from "../lib/estado-orden";
import type { EstadoOrdenCompra } from "../types";
import type { ProductoFiltro } from "../components/FiltrosCompras";

const FILTROS_INICIALES: FiltrosComprasValue = {
  estados: [],
  sucursalId: "todas",
  productoId: "todos",
};

const ESTADOS_VACIOS = Object.fromEntries(
  Object.keys(ESTADO_ORDEN_LABEL).map((estado) => [estado, 0])
) as Record<EstadoOrdenCompra, number>;

export default function Compras() {
  const { data: ordenes = [], isPending, isError, isFetching, refetch } =
    useOrdenesCompra();

  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [crearAbierto, setCrearAbierto] = useState(false);

  const conteoPorEstado = useMemo(() => {
    return ordenes.reduce(
      (acc, orden) => ({ ...acc, [orden.estado]: acc[orden.estado] + 1 }),
      { ...ESTADOS_VACIOS }
    );
  }, [ordenes]);

  const productosDisponibles = useMemo<ProductoFiltro[]>(() => {
    const mapa = new Map<string, ProductoFiltro>();
    for (const orden of ordenes) {
      for (const item of orden.items) {
        if (item.productoId && !mapa.has(item.productoId)) {
          mapa.set(item.productoId, {
            id: item.productoId,
            nombre: item.nombre.trim() || `Producto ${item.productoId}`,
          });
        }
      }
    }
    return Array.from(mapa.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [ordenes]);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return ordenes.filter((orden) => {
      const coincideTexto =
        termino.length === 0 ||
        orden.codigo.toLowerCase().includes(termino) ||
        orden.proveedor.toLowerCase().includes(termino);

      const coincideProducto =
        filtros.productoId === "todos" ||
        orden.items.some((item) => item.productoId === filtros.productoId);

      return (
        coincideTexto &&
        coincideProducto &&
        (filtros.estados.length === 0 || filtros.estados.includes(orden.estado)) &&
        (filtros.sucursalId === "todas" ||
          orden.sucursalDestinoId === filtros.sucursalId)
      );
    });
  }, [ordenes, busqueda, filtros]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        title="Órdenes de compra"
        description="Seguimiento del abastecimiento solicitado a proveedores."
        actions={
          <Button type="button" onClick={() => setCrearAbierto(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva orden
          </Button>
        }
      />

      <CrearOrdenCompraDialog
        open={crearAbierto}
        onOpenChange={setCrearAbierto}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-start">
        <FiltrosCompras
          value={filtros}
          onChange={setFiltros}
          conteoPorEstado={conteoPorEstado}
          productos={productosDisponibles}
          onReset={() => setFiltros(FILTROS_INICIALES)}
        />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput
              id="buscar-orden"
              label="Buscar órdenes por código o proveedor"
              placeholder="Buscar por código o proveedor…"
              value={busqueda}
              onChange={setBusqueda}
              className="w-full sm:max-w-sm"
            />
            {!isPending && !isError ? (
              <p className="text-sm text-muted-foreground">
                {formatNumber(filtradas.length)} de {formatNumber(ordenes.length)}{" "}
                órdenes
              </p>
            ) : null}
          </div>

          {isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-56 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="No se pudieron cargar las órdenes de compra"
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          ) : filtradas.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Sin órdenes para estos filtros"
              description="Prueba con otro estado, otra sucursal o limpia la búsqueda."
            />
          ) : (
            <div className="space-y-4">
              {filtradas.map((orden) => (
                <OrdenCompraCard key={orden.id} orden={orden} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
