import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { inventarioKeys } from "@/features/inventario/hooks/useInventario";
import { fetchCatalogoVenta, registrarVenta } from "../api/ventas.api";

export const ventasKeys = {
  all: ["ventas"] as const,
  catalogo: () => [...ventasKeys.all, "catalogo"] as const,
};

export function useCatalogoVenta() {
  return useQuery({
    queryKey: ventasKeys.catalogo(),
    queryFn: fetchCatalogoVenta,
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
