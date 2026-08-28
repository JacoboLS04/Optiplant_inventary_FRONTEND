import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { inventarioKeys } from "@/features/inventario/hooks/useInventario";
import {
  cambiarEstadoOrden,
  crearOrdenCompra,
  fetchOrdenesCompra,
  fetchProveedores,
  registrarRecepcion,
} from "../api/compras.api";
import type { OrdenCompra } from "../types";

export const comprasKeys = {
  all: ["compras"] as const,
  proveedores: () => [...comprasKeys.all, "proveedores"] as const,
  ordenes: () => [...comprasKeys.all, "ordenes"] as const,
};

export function useProveedores() {
  return useQuery({
    queryKey: comprasKeys.proveedores(),
    queryFn: fetchProveedores,
  });
}

export function useOrdenesCompra() {
  return useQuery({
    queryKey: comprasKeys.ordenes(),
    queryFn: fetchOrdenesCompra,
  });
}

export function useCrearOrdenCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearOrdenCompra,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: comprasKeys.all });
    },
  });
}

export function useCambiarEstadoOrden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      estado,
    }: {
      id: string;
      estado: OrdenCompra["estado"];
    }) => cambiarEstadoOrden(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: comprasKeys.ordenes() });
    },
  });
}

export function useRegistrarRecepcion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      lineas,
    }: {
      id: string;
      lineas: { lineaId: string; cantidadRecibida: number }[];
    }) => registrarRecepcion(id, lineas),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: comprasKeys.ordenes() });
      // La recepción genera movimientos y actualiza costo promedio / stock.
      void queryClient.invalidateQueries({ queryKey: inventarioKeys.all });
    },
  });
}
