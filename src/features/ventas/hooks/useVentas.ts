import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { inventarioKeys } from "@/features/inventario/hooks/useInventario";
import {
  fetchCatalogoVenta,
  fetchVenta,
  fetchVentas,
  registrarVenta,
} from "../api/ventas.api";
import type { FiltrosVentas } from "../types";

export const ventasKeys = {
  all: ["ventas"] as const,
  catalogo: () => [...ventasKeys.all, "catalogo"] as const,
  listado: (filtros: FiltrosVentas, page: number, size: number) =>
    [...ventasKeys.all, "listado", filtros, page, size] as const,
  detalle: (id: string) => [...ventasKeys.all, "detalle", id] as const,
};

export function useCatalogoVenta() {
  return useQuery({
    queryKey: ventasKeys.catalogo(),
    queryFn: fetchCatalogoVenta,
  });
}

export function useVentas(filtros: FiltrosVentas, page: number, size: number) {
  return useQuery({
    queryKey: ventasKeys.listado(filtros, page, size),
    queryFn: () => fetchVentas(filtros, page, size),
    placeholderData: (prev) => prev,
  });
}

export function useVenta(id: string) {
  return useQuery({
    queryKey: ventasKeys.detalle(id),
    queryFn: () => fetchVenta(id),
    enabled: id.length > 0,
  });
}

export function useRegistrarVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrarVenta,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ventasKeys.all });
      void queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
    },
  });
}
