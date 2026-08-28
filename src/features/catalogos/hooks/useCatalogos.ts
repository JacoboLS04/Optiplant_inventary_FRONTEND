import { useQuery } from "@tanstack/react-query";

import {
  fetchCategorias,
  fetchSucursales,
  fetchUnidadesMedida,
} from "../api/catalogos.api";

export const catalogosKeys = {
  all: ["catalogos"] as const,
  sucursales: () => [...catalogosKeys.all, "sucursales"] as const,
  categorias: () => [...catalogosKeys.all, "categorias"] as const,
  unidadesMedida: () => [...catalogosKeys.all, "unidades-medida"] as const,
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

export function useUnidadesMedida() {
  return useQuery({
    queryKey: catalogosKeys.unidadesMedida(),
    queryFn: fetchUnidadesMedida,
    staleTime: Infinity,
  });
}
