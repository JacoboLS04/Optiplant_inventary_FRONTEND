import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";

import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useProductosDisponibles } from "../hooks/useTransferencias";
import type { ItemTransferencia, ProductoDisponible } from "../types";

interface SeleccionProductosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sucursalOrigenId: string;
  itemsActuales: ItemTransferencia[];
  onConfirm: (items: ItemTransferencia[]) => void;
}

export function SeleccionProductosDialog({
  open,
  onOpenChange,
  sucursalOrigenId,
  itemsActuales,
  onConfirm,
}: SeleccionProductosDialogProps) {
  const {
    data: disponibles = [],
    isPending,
    isError,
    refetch,
  } = useProductosDisponibles(sucursalOrigenId);

  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const yaAgregados = new Set(itemsActuales.map((item) => item.productoId));

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (termino.length === 0) return disponibles;

    return disponibles.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(termino) ||
        producto.sku.toLowerCase().includes(termino)
    );
  }, [disponibles, busqueda]);

  const alternar = (productoId: string) => {
    setSeleccion((actual) =>
      actual.includes(productoId)
        ? actual.filter((id) => id !== productoId)
        : [...actual, productoId]
    );
  };

  const cerrar = (siguiente: boolean) => {
    if (!siguiente) {
      setSeleccion([]);
      setBusqueda("");
    }
    onOpenChange(siguiente);
  };

  const confirmar = () => {
    const nuevos = disponibles
      .filter((producto) => seleccion.includes(producto.productoId))
      .map<ItemTransferencia>((producto) => ({
        productoId: producto.productoId,
        sku: producto.sku,
        nombre: producto.nombre,
        stockDisponible: producto.stockDisponible,
        cantidad: 1,
      }));

    onConfirm(nuevos);
    cerrar(false);
  };

  const filaProducto = (producto: ProductoDisponible) => {
    const agregado = yaAgregados.has(producto.productoId);
    const marcado = seleccion.includes(producto.productoId);

    return (
      <li key={producto.productoId}>
        <button
          type="button"
          onClick={() => alternar(producto.productoId)}
          disabled={agregado}
          aria-pressed={marcado}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            agregado && "cursor-not-allowed opacity-50",
            marcado
              ? "border-foreground/30 bg-secondary"
              : "border-border hover:bg-secondary/60"
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
              marcado ? "border-foreground bg-foreground" : "border-input"
            )}
            aria-hidden="true"
          >
            {marcado ? (
              <span className="h-1.5 w-1.5 rounded-[1px] bg-background" />
            ) : null}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {producto.nombre}
            </span>
            <span className="block text-xs text-muted-foreground">
              {producto.sku} · {producto.categoria}
            </span>
          </span>

          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {agregado
              ? "Ya agregado"
              : `${formatNumber(producto.stockDisponible)} disp.`}
          </span>
        </button>
      </li>
    );
  };

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar ítems</DialogTitle>
          <DialogDescription>
            Productos con existencia en la sucursal de origen. Las cantidades se
            ajustan después en la tabla de la transferencia.
          </DialogDescription>
        </DialogHeader>

        <SearchInput
          id="buscar-item-transferencia"
          label="Buscar productos disponibles"
          placeholder="Buscar por nombre o SKU…"
          value={busqueda}
          onChange={setBusqueda}
        />

        {isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="No se pudieron cargar los productos"
            onRetry={() => void refetch()}
          />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Sin productos disponibles"
            description="No hay existencias que coincidan en la sucursal de origen."
          />
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {filtrados.map(filaProducto)}
          </ul>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => cerrar(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirmar}
            disabled={seleccion.length === 0}
          >
            Agregar {seleccion.length > 0 ? `(${seleccion.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
