import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  confirmarOrden,
  despacharOrden,
  fetchPortalOrdenes,
} from "../api/portal.api";
import type { EstadoOrdenCompra } from "@/features/compras/types";

export const portalKeys = {
  all: ["portal-proveedor"] as const,
  ordenes: () => [...portalKeys.all, "ordenes"] as const,
};

export function usePortalOrdenes(
  estado?: EstadoOrdenCompra | "todas",
  busqueda?: string
) {
  return useQuery({
    queryKey: [...portalKeys.ordenes(), estado ?? "todas", busqueda ?? ""],
    queryFn: () => fetchPortalOrdenes(estado, busqueda),
  });
}

export function useConfirmarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmarOrden(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.ordenes() });
    },
  });
}

export function useDespacharOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        transportista?: string;
        guia?: string;
        fechaEntregaEstimada?: string;
      };
    }) => despacharOrden(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.ordenes() });
    },
  });
}