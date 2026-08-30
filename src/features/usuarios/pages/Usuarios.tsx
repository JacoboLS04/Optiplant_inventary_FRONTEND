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
import { useBanderaUrl, useTextoUrl } from "@/hooks/useEstadoUrl";
import { mensajeDeError } from "@/lib/api-error";
import { ROL_LABEL, type Rol } from "@/lib/roles";
import { ConfirmarEstadoDialog } from "../components/ConfirmarEstadoDialog";
import {
  FiltrosUsuarios,
  type FiltrosUsuariosValue,
} from "../components/FiltrosUsuarios";
import { UsuarioFormDialog } from "../components/UsuarioFormDialog";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCambiarEstadoUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types";

const PAGE_SIZE = 10;

/** El nombre buscado vive en la URL para poder enlazar desde el buscador global. */
type FiltrosLocales = Omit<FiltrosUsuariosValue, "nombre">;

const FILTROS_INICIALES: FiltrosLocales = {
  rol: "todos",
  estado: "todos",
};

export default function Usuarios() {
  const [nombre, setNombre] = useTextoUrl("buscar");
  const [creando, setCreando] = useBanderaUrl("nuevo");
  const [filtrosLocales, setFiltrosLocales] = useState(FILTROS_INICIALES);
  const [paginacion, setPaginacion] = useState({ termino: nombre, page: 1 });
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null);
  const [usuarioEnConfirmacion, setUsuarioEnConfirmacion] =
    useState<Usuario | null>(null);

  const filtros = useMemo<FiltrosUsuariosValue>(
    () => ({ ...filtrosLocales, nombre }),
    [filtrosLocales, nombre]
  );

  // Cambiar el término (aquí o desde el buscador global) devuelve a la página 1.
  const pagina = paginacion.termino === nombre ? paginacion.page : 1;
  const cambiarPagina = (nueva: number) =>
    setPaginacion({ termino: nombre, page: nueva });

  const formAbierto = creando || usuarioEnEdicion !== null;
  const busquedaDiferida = useDebouncedValue(nombre.trim());
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

  const actualizarFiltros = ({
    nombre: siguienteNombre,
    ...resto
  }: FiltrosUsuariosValue) => {
    if (siguienteNombre !== nombre) setNombre(siguienteNombre);
    setFiltrosLocales(resto);
    cambiarPagina(1);
  };

  const restablecerFiltros = () => {
    actualizarFiltros({ ...FILTROS_INICIALES, nombre: "" });
  };

  const abrirCreacion = () => {
    setUsuarioEnEdicion(null);
    setCreando(true);
  };

  const abrirEdicion = (usuario: Usuario) => {
    setUsuarioEnEdicion(usuario);
  };

  const cerrarFormulario = (abierto: boolean) => {
    if (abierto) return;
    setUsuarioEnEdicion(null);
    setCreando(false);
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
                    onClick={restablecerFiltros}
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
              onPageChange={cambiarPagina}
              itemLabel="usuarios"
            />
          ) : null}
        </CardContent>
      </Card>

      <UsuarioFormDialog
        open={formAbierto}
        onOpenChange={cerrarFormulario}
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
