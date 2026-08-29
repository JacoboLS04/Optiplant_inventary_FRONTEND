import { useMemo, useState } from "react";
import { Pencil, Plus, PowerOff, Store } from "lucide-react";
import { toast } from "sonner";

import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/SectionState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { mensajeDeError } from "@/lib/api-error";
import { ConfirmarInactivarDialog } from "../components/ConfirmarInactivarDialog";
import { SucursalFormDialog } from "../components/SucursalFormDialog";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useInactivarSucursal, useSucursales } from "../hooks/useSucursales";
import type { Sucursal } from "../types";

export default function Sucursales() {
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [sucursalEnEdicion, setSucursalEnEdicion] = useState<Sucursal | null>(
    null
  );
  const [sucursalEnConfirmacion, setSucursalEnConfirmacion] =
    useState<Sucursal | null>(null);

  const busquedaDiferida = useDebouncedValue(busqueda.trim());
  const inactivar = useInactivarSucursal();

  const consulta = useSucursales();
  const sucursales = consulta.data ?? [];

  const filtradas = useMemo(() => {
    const termino = busquedaDiferida.toLowerCase();
    if (termino.length === 0) return sucursales;

    return sucursales.filter((sucursal) =>
      sucursal.nombre.toLowerCase().includes(termino)
    );
  }, [sucursales, busquedaDiferida]);

  const abrirCreacion = () => {
    setSucursalEnEdicion(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (sucursal: Sucursal) => {
    setSucursalEnEdicion(sucursal);
    setFormAbierto(true);
  };

  const confirmarInactivacion = async () => {
    if (!sucursalEnConfirmacion) return;

    const { id, nombre } = sucursalEnConfirmacion;

    try {
      await inactivar.mutateAsync({ id });
      toast.success("Sucursal inactivada", {
        description: `${nombre} quedó fuera de operación.`,
      });
      setSucursalEnConfirmacion(null);
    } catch (error) {
      toast.error("No se pudo inactivar la sucursal", {
        description: mensajeDeError(error, "Inténtalo de nuevo en unos segundos."),
      });
    }
  };

  const columnas = useMemo<DataTableColumn<Sucursal>[]>(
    () => [
      {
        id: "nombre",
        header: "Nombre",
        cell: (sucursal) => (
          <span className="block font-medium whitespace-normal">
            {sucursal.nombre}
          </span>
        ),
        className: "max-w-[12rem] sm:max-w-[22rem]",
      },
      {
        id: "direccion",
        header: "Dirección",
        cell: (sucursal) => sucursal.direccion ?? "—",
        className: "hidden text-muted-foreground md:table-cell",
      },
      {
        id: "estado",
        header: "Estado",
        cell: (sucursal) => (
          <StatusBadge
            tone={sucursal.activa ? "success" : "neutral"}
            label={sucursal.activa ? "Activa" : "Inactiva"}
          />
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        align: "right",
        cell: (sucursal) => (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => abrirEdicion(sucursal)}
                  aria-label={`Editar ${sucursal.nombre}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar sucursal</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={!sucursal.activa}
                  onClick={() => setSucursalEnConfirmacion(sucursal)}
                  aria-label={`Inactivar ${sucursal.nombre}`}
                  className={
                    sucursal.activa
                      ? "text-destructive hover:text-destructive"
                      : "cursor-not-allowed opacity-40"
                  }
                >
                  <PowerOff className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {sucursal.activa ? "Inactivar sucursal" : "Sucursal ya inactiva"}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    []
  );

  const hayFiltrosActivos = busqueda.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        title="Sucursales"
        description="Sucursales de la organización y su estado operativo."
        actions={
          <Button type="button" onClick={abrirCreacion}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva sucursal
          </Button>
        }
      />

      <SearchInput
        id="buscar-sucursal"
        label="Buscar sucursales"
        placeholder="Buscar sucursal…"
        value={busqueda}
        onChange={setBusqueda}
        className="max-w-xl"
      />

      <Card>
        <CardContent>
          <DataTable
            columns={columnas}
            rows={filtradas}
            rowKey={(sucursal) => sucursal.id}
            isLoading={consulta.isPending}
            isError={consulta.isError}
            onRetry={() => void consulta.refetch()}
            errorTitle={mensajeDeError(
              consulta.error,
              "No se pudieron cargar las sucursales"
            )}
            skeletonRows={6}
            emptyState={
              <EmptyState
                icon={Store}
                title={
                  hayFiltrosActivos && sucursales.length > 0
                    ? "Ninguna sucursal coincide con la búsqueda"
                    : "Aún no hay sucursales registradas"
                }
                description={
                  hayFiltrosActivos && sucursales.length > 0
                    ? "Ajusta la búsqueda para ver más resultados."
                    : "Crea la primera sucursal para empezar a operar."
                }
                action={
                  hayFiltrosActivos && sucursales.length > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBusqueda("")}
                    >
                      Restablecer búsqueda
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </CardContent>
      </Card>

      <SucursalFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        sucursal={sucursalEnEdicion}
      />

      <ConfirmarInactivarDialog
        sucursal={sucursalEnConfirmacion}
        onOpenChange={(open) => {
          if (!open) setSucursalEnConfirmacion(null);
        }}
        onConfirmar={() => void confirmarInactivacion()}
        isPending={inactivar.isPending}
      />
    </div>
  );
}
