import { Building2, Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { cn } from "@/lib/utils";
import {
  TODAS_LAS_SUCURSALES,
  useSucursalActiva,
} from "../context/SucursalActivaContext";
import {
  ETIQUETA_TODAS,
  useNombreSucursalActiva,
} from "../hooks/useNombreSucursalActiva";

/**
 * Fija la sucursal de trabajo para inventario, ventas, compras y alertas. El
 * dashboard queda fuera porque sus endpoints agregan toda la red.
 */
export function SelectorSucursalActiva() {
  const { sucursalId, setSucursalId } = useSucursalActiva();
  const { data: sucursales = [], isPending } = useSucursales();
  const nombreActivo = useNombreSucursalActiva();

  const opciones = [
    { id: TODAS_LAS_SUCURSALES, nombre: ETIQUETA_TODAS },
    // Una sucursal inactiva no debería poder elegirse como contexto de trabajo,
    // salvo que ya sea la activa (para no dejar el selector sin su opción).
    ...sucursales
      .filter(
        (sucursal) =>
          sucursal.estado !== "inactiva" || String(sucursal.id) === sucursalId
      )
      .map((sucursal) => ({
        id: String(sucursal.id),
        nombre: sucursal.nombre,
      })),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-sidebar-border px-3 text-sm text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-white/5 data-[state=open]:text-sidebar-foreground"
        aria-label={`Sucursal activa: ${nombreActivo}`}
      >
        <Building2 className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
        <span className="flex-1 truncate text-left">{nombreActivo}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/40" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Sucursal de trabajo</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isPending ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            Cargando sucursales…
          </p>
        ) : (
          opciones.map((opcion) => (
            <DropdownMenuItem
              key={opcion.id}
              onSelect={() => setSucursalId(opcion.id)}
            >
              <Check
                className={cn(
                  "h-4 w-4",
                  opcion.id === sucursalId ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              />
              <span className="truncate">{opcion.nombre}</span>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          Filtra inventario, ventas, compras y alertas. El dashboard siempre
          muestra la red completa.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
