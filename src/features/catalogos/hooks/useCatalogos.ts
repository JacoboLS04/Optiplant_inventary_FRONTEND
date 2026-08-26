import { useQuery } from "@tanstack/react-query";

import { fetchCategorias, fetchSucursales } from "../api/catalogos.api";

export const catalogosKeys = {
  all: ["catalogos"] as const,
  sucursales: () => [...catalogosKeys.all, "sucursales"] as const,
  categorias: () => [...catalogosKeys.all, "categorias"] as const,
};

export function useSucursales() {
  return useQuery({
    queryKey: catalogosKeys.sucursales(),
    queryFn: fetchSucursales,
    staleTime: Infinity,
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: catalogosKeys.categorias(),
    queryFn: fetchCategorias,
    staleTime: Infinity,
  });
}
