import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  actualizarProducto,
  crearProducto,
  fetchProductos,
  inactivarProducto,
  registrarAjusteStock,
} from "../api/inventario.api";
import type { ProductoActualizacionPayload } from "../types";

export const inventarioKeys = {
  all: ["inventario"] as const,
  productos: () => [...inventarioKeys.all, "productos"] as const,
};

export function useProductos() {
  return useQuery({
    queryKey: inventarioKeys.productos(),
    queryFn: fetchProductos,
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
    },
  });
}

export function useAjusteStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrarAjusteStock,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
    },
  });
}

export function useInactivarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inactivarProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductoActualizacionPayload) =>
      actualizarProducto(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
    },
  });
}
