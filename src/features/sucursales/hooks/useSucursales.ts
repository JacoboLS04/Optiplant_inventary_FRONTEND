import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  actualizarSucursal,
  crearSucursal,
  fetchSucursales,
  inactivarSucursal,
} from "../api/sucursales.api";

export const sucursalesKeys = {
  all: ["sucursales"] as const,
  lista: () => [...sucursalesKeys.all, "lista"] as const,
};

export function useSucursales() {
  return useQuery({
    queryKey: sucursalesKeys.lista(),
    queryFn: fetchSucursales,
  });
}

function useInvalidarSucursales() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: sucursalesKeys.all });
  };
}

export function useCrearSucursal() {
  const invalidar = useInvalidarSucursales();

  return useMutation({ mutationFn: crearSucursal, onSuccess: invalidar });
}

export function useActualizarSucursal() {
  const invalidar = useInvalidarSucursales();

  return useMutation({ mutationFn: actualizarSucursal, onSuccess: invalidar });
}

export function useInactivarSucursal() {
  const invalidar = useInvalidarSucursales();

  return useMutation({ mutationFn: inactivarSucursal, onSuccess: invalidar });
}
