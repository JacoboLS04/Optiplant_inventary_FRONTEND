import { useMutation, useQuery } from "@tanstack/react-query";

import {
  crearTransferencia,
  fetchProductosDisponibles,
} from "../api/transferencias.api";

export const transferenciasKeys = {
  all: ["transferencias"] as const,
  disponibles: (sucursalId: string) =>
    [...transferenciasKeys.all, "disponibles", sucursalId] as const,
};

export function useProductosDisponibles(sucursalId: string) {
  return useQuery({
    queryKey: transferenciasKeys.disponibles(sucursalId),
    queryFn: () => fetchProductosDisponibles(sucursalId),
    enabled: sucursalId.length > 0,
  });
}

export function useCrearTransferencia() {
  return useMutation({ mutationFn: crearTransferencia });
}
