import { useMemo, useState } from "react";
import { PackageSearch, Plus, Sprout } from "lucide-react";

import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategorias,
  useSucursales,
} from "@/features/catalogos/hooks/useCatalogos";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useCatalogoVenta } from "../hooks/useVentas";
import type { ProductoVenta } from "../types";

interface CatalogoProductosProps {
  onAgregar: (producto: ProductoVenta) => void;
  cantidadesEnCarrito: Record<string, number>;
}

export function CatalogoProductos({
  onAgregar,
  cantidadesEnCarrito,
}: CatalogoProductosProps) {
  const { data: catalogo = [], isPending, isError, refetch } = useCatalogoVenta();
  const { data: categorias = [] } = useCategorias();
  const { data: sucursales = [] } = useSucursales();

  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("todas");
  const [sucursalId, setSucursalId] = useState("todas");

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return catalogo.filter((producto) => {
      const coincideTexto =
        termino.length === 0 ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.sku.toLowerCase().includes(termino);

      return (
        coincideTexto &&
        (categoriaId === "todas" || producto.categoriaId === categoriaId) &&
        (sucursalId === "todas" || producto.sucursalId === sucursalId)
      );
    });
  }, [catalogo, busqueda, categoriaId, sucursalId]);

  return (
    <Card>
      <CardContent className="space-y-4">
        <SearchInput
          id="buscar-producto-venta"
          label="Buscar productos del catálogo"
          placeholder="Buscar producto por nombre o SKU…"
          value={busqueda}
          onChange={setBusqueda}
        />

        <div className="flex flex-wrap gap-3">
          <Select value={categoriaId} onValueChange={setCategoriaId}>
            <SelectTrigger className="w-full sm:w-52" aria-label="Filtrar por categoría">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sucursalId} onValueChange={setSucursalId}>
            <SelectTrigger className="w-full sm:w-52" aria-label="Filtrar por sucursal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las sucursales</SelectItem>
              {sucursales.map((sucursal) => (
                <SelectItem key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-36" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="No se pudo cargar el catálogo"
            onRetry={() => void refetch()}
          />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Sin productos disponibles"
            description="Ajusta la búsqueda o los filtros para ver el catálogo."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((producto) => {
              const enCarrito = cantidadesEnCarrito[producto.productoId] ?? 0;
              const agotado = enCarrito >= producto.stockDisponible;

              return (
                <li key={producto.productoId}>
                  <article className="flex h-full flex-col gap-3 rounded-lg border bg-card p-3">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20"
                        aria-hidden="true"
                      >
                        <Sprout className="h-5 w-5 text-emerald-800" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm leading-snug font-medium">
                          {producto.nombre}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {producto.sku} · {producto.sucursal}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(producto.precioUnitario)}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {formatNumber(producto.stockDisponible - enCarrito)} disponibles
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAgregar(producto)}
                        disabled={agotado}
                        aria-label={`Agregar ${producto.nombre} a la venta`}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Agregar
                      </Button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
