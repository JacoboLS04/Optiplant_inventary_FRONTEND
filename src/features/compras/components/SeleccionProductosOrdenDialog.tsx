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
import { useProductos } from "@/features/inventario/hooks/useInventario";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Ítem en construcción dentro del diálogo de nueva orden. */
export interface ItemOrdenEnCreacion {
  productoId: string;
  sku: string;
  nombre: string;
  precioUnitario: number;
}

interface SeleccionProductosOrdenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemsActuales: ItemOrdenEnCreacion[];
  onConfirm: (items: ItemOrdenEnCreacion[]) => void;
}

export function SeleccionProductosOrdenDialog({
  open,
  onOpenChange,
  itemsActuales,
  onConfirm,
}: SeleccionProductosOrdenDialogProps) {
  const { data: productos = [], isPending, isError, refetch } = useProductos();

  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<string[]>([]);

  // Un producto puede aparecer en varias existencias; se muestran sin repetir.
  const disponibles = useMemo(() => {
    const vistos = new Set<string>();
    return productos.filter((producto) => {
      if (vistos.has(producto.id)) return false;
      vistos.add(producto.id);
      return true;
    });
  }, [productos]);

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
      .filter((producto) => seleccion.includes(producto.id))
      .map<ItemOrdenEnCreacion>((producto) => ({
        productoId: producto.id,
        sku: producto.sku,
        nombre: producto.nombre,
        precioUnitario: producto.precioUnitario,
      }));
    onConfirm(nuevos);
    cerrar(false);
  };

  const filaProducto = (producto: (typeof disponibles)[number]) => {
    const agregado = yaAgregados.has(producto.id);
    const marcado = seleccion.includes(producto.id);

    return (
      <li key={producto.id}>
        <button
          type="button"
          onClick={() => alternar(producto.id)}
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
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {producto.nombre}
            </span>
            <span className="block text-xs text-muted-foreground">
              {producto.sku} · {producto.categoria}
            </span>
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {agregado ? "Ya agregado" : `${formatNumber(producto.precioUnitario)}`}
          </span>
        </button>
      </li>
    );
  };

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar productos</DialogTitle>
          <DialogDescription>
            Productos disponibles para la orden. El precio unitario se puede
            ajustar después en la tabla.
          </DialogDescription>
        </DialogHeader>

        <SearchInput
          id="buscar-item-orden"
          label="Buscar productos"
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
            description="No hay productos que coincidan con la búsqueda."
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
