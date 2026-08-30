import { useQuery } from "@tanstack/react-query";

import { useSucursalActiva } from "@/features/sucursales/context/SucursalActivaContext";
import { fetchAlertasStock } from "../api/alertas.api";

export const alertasKeys = {
  all: ["alertas"] as const,
  stock: (sucursalId?: string) =>
    [...alertasKeys.all, "stock", sucursalId ?? "todas"] as const,
};

/** Alertas de stock de la sucursal activa (o de toda la red si no hay una). */
export function useAlertasStock() {
  const { sucursalIdFiltro } = useSucursalActiva();

  return useQuery({
    queryKey: alertasKeys.stock(sucursalIdFiltro),
    queryFn: () => fetchAlertasStock(sucursalIdFiltro),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}
