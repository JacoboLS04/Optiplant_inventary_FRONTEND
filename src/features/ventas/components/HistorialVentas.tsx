import { useState } from "react";
import { History, ReceiptText } from "lucide-react";

import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { SearchInput } from "@/components/shared/SearchInput";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useVentas } from "../hooks/useVentas";
import type { Venta } from "../types";
import { DetalleVentaDialog } from "./DetalleVentaDialog";

const PAGE_SIZE = 10;

export function HistorialVentas() {
  const { data: sucursales = [] } = useSucursales();
  const [busqueda, setBusqueda] = useState("");
  const [sucursalId, setSucursalId] = useState("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [page, setPage] = useState(1);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  const { data, isPending, isError, isFetching, refetch } = useVentas(
    {
      busqueda: busqueda || undefined,
      sucursalId: sucursalId === "todas" ? undefined : sucursalId,
      desde: desde || undefined,
      hasta: hasta || undefined,
    },
    page - 1,
    PAGE_SIZE
  );

  const ventas = data?.content ?? [];

  const abrirDetalle = (venta: Venta) => setVentaSeleccionada(venta);

  return (
    <div className="space-y-5">
      <Card className="gap-4 py-5">
        <CardHeader className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <SearchInput
              id="buscar-venta"
              label="Buscar ventas"
              placeholder="Buscar por código, sucursal o responsable…"
              value={busqueda}
              onChange={setBusqueda}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Sucursal</Label>
            <Select value={sucursalId} onValueChange={setSucursalId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {sucursales.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:grid-cols-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Desde</Label>
              <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Hasta</Label>
              <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="No se pudieron cargar las ventas"
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : ventas.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin ventas para estos filtros"
          description="Prueba con otra sucursal, otro rango de fechas o limpia la búsqueda."
        />
      ) : (
        <>
          <div className="space-y-3">
            {ventas.map((venta) => (
              <Card key={venta.id} className="gap-4 py-4">
                <CardHeader className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-foreground px-2 py-0.5 font-mono text-xs font-medium text-background">
                      {venta.codigo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(venta.fecha)}
                    </span>
                    <span className="ml-auto text-lg font-semibold tabular-nums">
                      {formatCurrency(venta.total)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {venta.nombreSucursal} · {formatNumber(venta.unidades)} unidades
                    {venta.nombreUsuario ? ` · ${venta.nombreUsuario}` : ""}
                  </p>
                </CardHeader>
                <CardContent className="py-0 text-right">
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => abrirDetalle(venta)}>
                    <ReceiptText className="h-4 w-4" aria-hidden="true" />
                    Ver detalle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={data?.totalElements ?? 0}
            onPageChange={setPage}
            itemLabel="ventas"
          />
        </>
      )}

      {ventaSeleccionada ? (
        <DetalleVentaDialog
          venta={ventaSeleccionada}
          open={Boolean(ventaSeleccionada)}
          onOpenChange={() => setVentaSeleccionada(null)}
        />
      ) : null}
    </div>
  );
}
