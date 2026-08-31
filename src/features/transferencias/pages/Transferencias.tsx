import { useState } from "react";
import { ArrowUpDown, Loader2, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { EmptyState, ErrorState } from "@/components/shared/SectionState";
import { SearchInput } from "@/components/shared/SearchInput";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanderaUrl, useTextoUrl } from "@/hooks/useEstadoUrl";
import { useTransferencias } from "../hooks/useTransferencias";
import { TransferenciaCard } from "../components/TransferenciaCard";
import { CrearTransferenciaDialog } from "../components/CrearTransferenciaDialog";
import {
  FiltrosTransferencias,
  type FiltrosTransferenciasValue,
} from "../components/FiltrosTransferencias";

const FILTROS_INICIALES: FiltrosTransferenciasValue = {
  sucursalOrigenId: "todas",
  sucursalDestinoId: "todas",
};

const PAGE_SIZE = 10;

export default function Transferencias() {
  const [busqueda, setBusqueda] = useTextoUrl("buscar");
  const [crearAbierto, setCrearAbierto] = useBanderaUrl("nuevo");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  // La página se guarda junto al término que la originó: si la búsqueda cambia
  // (incluso desde el buscador global, que escribe la URL) se vuelve a la 1.
  const [paginacion, setPaginacion] = useState({ termino: busqueda, page: 1 });
  const paginaActual = paginacion.termino === busqueda ? paginacion.page : 1;

  const { data, isPending, isError, isFetching, refetch } = useTransferencias(
    {
      busqueda: busqueda || undefined,
      estado: filtros.estado,
      sucursalOrigenId:
        filtros.sucursalOrigenId === "todas"
          ? undefined
          : filtros.sucursalOrigenId,
      sucursalDestinoId:
        filtros.sucursalDestinoId === "todas"
          ? undefined
          : filtros.sucursalDestinoId,
    },
    paginaActual - 1,
    PAGE_SIZE
  );

  const transferencias = data?.content ?? [];

  const cambiarPagina = (nueva: number) => {
    setPaginacion({ termino: busqueda, page: nueva });
  };

  const reiniciarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    cambiarPagina(1);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      <PageHeader
        title="Transferencias"
        description="Traslado de existencias entre sucursales de la red."
        actions={
          <>
            <RefreshButton />
            <Button type="button" onClick={() => setCrearAbierto(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva transferencia
            </Button>
          </>
        }
      />

      <CrearTransferenciaDialog
        open={crearAbierto}
        onOpenChange={setCrearAbierto}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start">
        <FiltrosTransferencias
          value={filtros}
          onChange={setFiltros}
          onReset={reiniciarFiltros}
        />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput
              id="buscar-transferencia"
              label="Buscar transferencias"
              placeholder="Buscar por código…"
              value={busqueda}
              onChange={setBusqueda}
              className="w-full sm:max-w-sm"
            />
            {!isPending && !isError ? (
              <p className="text-sm text-muted-foreground">
                {data?.totalElements ?? 0} transferencias
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
              title="No se pudieron cargar las transferencias"
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          ) : transferencias.length === 0 ? (
            <EmptyState
              icon={ArrowUpDown}
              title="Sin transferencias para estos filtros"
              description="Prueba con otro estado, otra sucursal o limpia la búsqueda."
            />
          ) : (
            <>
              <div className="space-y-4">
                {transferencias.map((transferencia) => (
                  <TransferenciaCard
                    key={transferencia.id}
                    transferencia={transferencia}
                  />
                ))}
              </div>
              <TablePagination
                page={paginaActual}
                pageSize={PAGE_SIZE}
                totalItems={data?.totalElements ?? 0}
                onPageChange={cambiarPagina}
                itemLabel="transferencias"
              />
            </>
          )}
        </div>
      </div>

      {isFetching ? (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Actualizando…
        </div>
      ) : null}
    </div>
  );
}
