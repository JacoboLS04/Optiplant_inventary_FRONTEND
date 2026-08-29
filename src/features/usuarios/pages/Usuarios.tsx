import { useMemo, useState } from "react";
import { Pencil, Plus, Power, PowerOff, UserX } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/SectionState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { mensajeDeError } from "@/lib/api-error";
import { ROL_LABEL, type Rol } from "@/lib/roles";
import { ConfirmarEstadoDialog } from "../components/ConfirmarEstadoDialog";
import {
  FiltrosUsuarios,
  type FiltrosUsuariosValue,
} from "../components/FiltrosUsuarios";
import { UsuarioFormDialog } from "../components/UsuarioFormDialog";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useCambiarEstadoUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types";

const PAGE_SIZE = 10;

const FILTROS_INICIALES: FiltrosUsuariosValue = {
  nombre: "",
  rol: "todos",
  estado: "todos",
};

export default function Usuarios() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);
  const [formAbierto, setFormAbierto] = useState(false);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null);
  const [usuarioEnConfirmacion, setUsuarioEnConfirmacion] =
    useState<Usuario | null>(null);

  const busquedaDiferida = useDebouncedValue(filtros.nombre.trim());
  const cambiarEstado = useCambiarEstadoUsuario();

  const consulta = useUsuarios({
    page: pagina - 1,
    size: PAGE_SIZE,
    ...(filtros.rol === "todos" ? {} : { rol: filtros.rol as Rol }),
    ...(filtros.estado === "todos"
      ? {}
      : { activo: filtros.estado === "activos" }),
    ...(busquedaDiferida ? { busqueda: busquedaDiferida } : {}),
  });

  const usuarios = consulta.data?.usuarios ?? [];
  const totalElementos = consulta.data?.totalElementos ?? 0;

  const actualizarFiltros = (siguiente: FiltrosUsuariosValue) => {
    setFiltros(siguiente);
    setPagina(1);
  };

  const abrirCreacion = () => {
    setUsuarioEnEdicion(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (usuario: Usuario) => {
    setUsuarioEnEdicion(usuario);
    setFormAbierto(true);
  };

  const confirmarCambioDeEstado = async () => {
    if (!usuarioEnConfirmacion) return;

    const { id, nombre, activo } = usuarioEnConfirmacion;

    try {
      await cambiarEstado.mutateAsync({ id, activo: !activo });
      toast.success(activo ? "Usuario desactivado" : "Usuario activado", {
        description: activo
          ? `${nombre} ya no puede iniciar sesión.`
          : `${nombre} recuperó el acceso al sistema.`,
      });
      setUsuarioEnConfirmacion(null);
    } catch (error) {
      toast.error("No se pudo cambiar el estado", {
        description: mensajeDeError(error, "Inténtalo de nuevo en unos segundos."),
      });
    }
  };

  const columnas = useMemo<DataTableColumn<Usuario>[]>(
    () => [
      {
        id: "usuario",
        header: "Usuario",
        cell: (usuario) => (
          <>
            <span className="block font-medium whitespace-normal">
              {usuario.nombre}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {usuario.email}
            </span>
          </>
        ),
        className: "max-w-[10.5rem] sm:max-w-[18rem]",
      },
      {
        id: "rol",
        header: "Rol",
        cell: (usuario) => (
          <Badge variant={usuario.rol === "ADMINISTRADOR" ? "info" : "secondary"}>
            {ROL_LABEL[usuario.rol]}
          </Badge>
        ),
        // En móvil se priorizan estado y acciones sobre rol y sucursal.
        className: "hidden sm:table-cell",
      },
      {
        id: "sucursal",
        header: "Sucursal",
        cell: (usuario) => usuario.sucursalNombre ?? "—",
        className: "hidden text-muted-foreground md:table-cell",
      },
      {
        id: "estado",
        header: "Estado",
        cell: (usuario) => (
          <StatusBadge
            tone={usuario.activo ? "success" : "neutral"}
            label={usuario.activo ? "Activo" : "Inactivo"}
          />
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        align: "right",
        cell: (usuario) => (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => abrirEdicion(usuario)}
                  aria-label={`Editar ${usuario.nombre}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar usuario</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setUsuarioEnConfirmacion(usuario)}
                  aria-label={`${usuario.activo ? "Desactivar" : "Activar"} ${usuario.nombre}`}
                  className={
                    usuario.activo
                      ? "text-destructive hover:text-destructive"
                      : undefined
                  }
                >
                  {usuario.activo ? (
                    <PowerOff className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {usuario.activo ? "Desactivar usuario" : "Activar usuario"}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        title="Usuarios"
        description="Altas, roles y acceso de las personas que usan OptiPlant."
        actions={
          <Button type="button" onClick={abrirCreacion}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo usuario
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <FiltrosUsuarios value={filtros} onChange={actualizarFiltros} />

          <DataTable
            columns={columnas}
            rows={usuarios}
            rowKey={(usuario) => usuario.id}
            isLoading={consulta.isPending}
            isError={consulta.isError}
            onRetry={() => void consulta.refetch()}
            errorTitle={mensajeDeError(
              consulta.error,
              "No se pudieron cargar los usuarios"
            )}
            skeletonRows={PAGE_SIZE}
            emptyState={
              <EmptyState
                icon={UserX}
                title="Ningún usuario coincide con los filtros"
                description="Ajusta la búsqueda, el rol o el estado para ver más resultados."
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => actualizarFiltros(FILTROS_INICIALES)}
                  >
                    Restablecer filtros
                  </Button>
                }
              />
            }
          />

          {!consulta.isPending && !consulta.isError && totalElementos > 0 ? (
            <TablePagination
              page={pagina}
              pageSize={PAGE_SIZE}
              totalItems={totalElementos}
              onPageChange={setPagina}
              itemLabel="usuarios"
            />
          ) : null}
        </CardContent>
      </Card>

      <UsuarioFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        usuario={usuarioEnEdicion}
      />

      <ConfirmarEstadoDialog
        usuario={usuarioEnConfirmacion}
        onOpenChange={(open) => {
          if (!open) setUsuarioEnConfirmacion(null);
        }}
        onConfirmar={() => void confirmarCambioDeEstado()}
        isPending={cambiarEstado.isPending}
      />
    </div>
  );
}
