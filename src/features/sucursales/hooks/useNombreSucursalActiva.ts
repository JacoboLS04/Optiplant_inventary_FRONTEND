import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import {
  TODAS_LAS_SUCURSALES,
  useSucursalActiva,
} from "../context/SucursalActivaContext";

export const ETIQUETA_TODAS = "Todas las sucursales";

/** Nombre legible de la sucursal activa, resuelto contra el catálogo. */
export function useNombreSucursalActiva(): string {
  const { sucursalId, esTodas } = useSucursalActiva();
  const { data: sucursales = [] } = useSucursales();

  if (esTodas || sucursalId === TODAS_LAS_SUCURSALES) return ETIQUETA_TODAS;

  return (
    sucursales.find((sucursal) => String(sucursal.id) === sucursalId)?.nombre ??
    "Sucursal seleccionada"
  );
}
