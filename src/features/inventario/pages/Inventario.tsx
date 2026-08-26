import { useMemo, useState } from "react";
import { ChevronDown, MinusCircle, PackageSearch, Plus, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/SectionState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AjusteStockDialog } from "../components/AjusteStockDialog";
import {
  FiltrosInventario,
  type FiltrosInventarioValue,
} from "../components/FiltrosInventario";
import { NuevoProductoDialog } from "../components/NuevoProductoDialog";
import { useProductos } from "../hooks/useInventario";
import { ESTADO_STOCK_LABEL, ESTADO_STOCK_TONE } from "../lib/estado-stock";
import { exportarProductosCsv } from "../lib/exportar-csv";
import type { Producto, TipoAjuste } from "../types";

const PAGE_SIZE = 10;

const FILTROS_INICIALES: FiltrosInventarioValue = {
  categoriaId: "todas",
  sucursalId: "todas",
  estado: "todos",
  periodo: "todos",
};

const HORAS_POR_PERIODO: Record<string, number> = {
  hoy: 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

function coincidePeriodo(producto: Producto, periodo: string): boolean {
  const horas = HORAS_POR_PERIODO[periodo];
  if (!horas) return true;
  return Date.now() - new Date(producto.actualizadoEn).getTime() <= horas * 3_600_000;
}

const columnas: DataTableColumn<Producto>[] = [
  {
    id: "producto",
    header: "Producto",
    cell: (producto) => (
      <>
        <span className="block font-medium whitespace-normal">{producto.nombre}</span>
        <span className="block text-xs text-muted-foreground">{producto.sku}</span>
      </>
    ),
    className: "max-w-[18rem]",
  },
  {
    id: "categoria",
    header: "Categoría",
    cell: (producto) => producto.categoria,
    className: "hidden text-muted-foreground lg:table-cell",
  },
  {
    id: "sucursal",
    header: "Sucursal",
    cell: (producto) => producto.sucursal,
    className: "hidden text-muted-foreground md:table-cell",
  },
  {
    id: "stock",
    header: "Existencia",
    align: "right",
    cell: (producto) => (
      <>
        <span
          className={cn(
            "font-medium tabular-nums",
            producto.stock < producto.stockMinimo && "text-destructive"
          )}
        >
          {formatNumber(producto.stock)}
        </span>
        <span className="block text-xs text-muted-foreground">
          mín. {formatNumber(producto.stockMinimo)}
        </span>
      </>
    ),
  },
  {
    id: "estado",
    header: "Estado",
    cell: (producto) => (
      <StatusBadge
        tone={ESTADO_STOCK_TONE[producto.estado]}
        label={ESTADO_STOCK_LABEL[producto.estado]}
      />
    ),
  },
  {
    id: "precio",
    header: "Precio",
    align: "right",
    cell: (producto) => (
      <span className="tabular-nums">{formatCurrency(producto.precioUnitario)}</span>
    ),
    className: "hidden sm:table-cell",
  },
  {
    id: "actualizado",
    header: "Actualizado",
    align: "right",
    cell: (producto) => formatRelativeTime(producto.actualizadoEn),
    className: "hidden text-muted-foreground xl:table-cell",
  },
];

export default function Inventario() {
  const { data: productos = [], isPending, isError, refetch } = useProductos();

  const [busqueda, setBusqueda] = useState("");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const [dialogoProducto, setDialogoProducto] = useState(false);
  const [ajuste, setAjuste] = useState<TipoAjuste | null>(null);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideTexto =
        termino.length === 0 ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.sku.toLowerCase().includes(termino);

      return (
        coincideTexto &&
        (filtros.categoriaId === "todas" ||
          producto.categoriaId === filtros.categoriaId) &&
        (filtros.sucursalId === "todas" ||
          producto.sucursalId === filtros.sucursalId) &&
        (filtros.estado === "todos" || producto.estado === filtros.estado) &&
        coincidePeriodo(producto, filtros.periodo)
      );
    });
  }, [productos, busqueda, filtros]);

  const paginaActual = Math.min(
    pagina,
    Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  );
  const visibles = filtrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  const actualizarFiltros = (siguiente: FiltrosInventarioValue) => {
    setFiltros(siguiente);
    setPagina(1);
  };

  const actualizarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  };

  const exportar = () => {
    exportarProductosCsv(filtrados);
    toast.success("Exportación generada", {
      description: `${formatNumber(filtrados.length)} productos incluidos en el archivo.`,
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        title="Productos"
        description="Existencias por producto y sucursal en toda la red."
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  Gestionar stock
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Movimientos manuales</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setAjuste("entrada")}>
                  <PlusCircle aria-hidden="true" />
                  Registrar entrada
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setAjuste("salida")}>
                  <MinusCircle aria-hidden="true" />
                  Registrar salida
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button type="button" onClick={() => setDialogoProducto(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo producto
            </Button>
          </>
        }
      />

      <SearchInput
        id="buscar-producto"
        label="Buscar productos por nombre o SKU"
        placeholder="Buscar por nombre o SKU…"
        value={busqueda}
        onChange={actualizarBusqueda}
        className="max-w-xl"
      />

      <Card>
        <CardContent className="space-y-4">
          <FiltrosInventario
            value={filtros}
            onChange={actualizarFiltros}
            onExport={exportar}
            exportDisabled={filtrados.length === 0}
          />

          <DataTable
            columns={columnas}
            rows={visibles}
            rowKey={(producto) => producto.id}
            isLoading={isPending}
            isError={isError}
            onRetry={() => void refetch()}
            errorTitle="No se pudo cargar el inventario"
            skeletonRows={PAGE_SIZE}
            emptyState={
              <EmptyState
                icon={PackageSearch}
                title="Ningún producto coincide con los filtros"
                description="Ajusta la búsqueda o restablece los filtros para ver más resultados."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBusqueda("");
                      actualizarFiltros(FILTROS_INICIALES);
                    }}
                  >
                    Restablecer filtros
                  </Button>
                }
              />
            }
          />

          {!isPending && !isError && filtrados.length > 0 ? (
            <TablePagination
              page={paginaActual}
              pageSize={PAGE_SIZE}
              totalItems={filtrados.length}
              onPageChange={setPagina}
              itemLabel="productos"
            />
          ) : null}
        </CardContent>
      </Card>

      <NuevoProductoDialog
        open={dialogoProducto}
        onOpenChange={setDialogoProducto}
      />

      <AjusteStockDialog
        open={ajuste !== null}
        onOpenChange={(open) => setAjuste(open ? ajuste : null)}
        tipo={ajuste ?? "entrada"}
        productos={productos}
      />
    </div>
  );
}
