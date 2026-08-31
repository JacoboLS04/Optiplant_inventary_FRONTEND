import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  fetchUsuarioActual,
  fetchUsuarios,
} from "../api/usuarios.api";
import type { FiltrosUsuarios } from "../types";

export const usuariosKeys = {
  all: ["usuarios"] as const,
  yo: () => [...usuariosKeys.all, "yo"] as const,
  lista: (filtros: FiltrosUsuarios) =>
    [...usuariosKeys.all, "lista", filtros] as const,
};

/** Perfil del usuario autenticado (incluye su sucursal/proveedor). */
export function useUsuarioActual() {
  return useQuery({
    queryKey: usuariosKeys.yo(),
    queryFn: fetchUsuarioActual,
  });
}

export function useUsuarios(filtros: FiltrosUsuarios) {
  return useQuery({
    queryKey: usuariosKeys.lista(filtros),
    queryFn: () => fetchUsuarios(filtros),
    // Evita el parpadeo de la tabla al paginar o filtrar.
    placeholderData: keepPreviousData,
  });
}

function useInvalidarUsuarios() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
  };
}

export function useCrearUsuario() {
  const invalidar = useInvalidarUsuarios();

  return useMutation({ mutationFn: crearUsuario, onSuccess: invalidar });
}

export function useActualizarUsuario() {
  const invalidar = useInvalidarUsuarios();

  return useMutation({ mutationFn: actualizarUsuario, onSuccess: invalidar });
}

export function useCambiarEstadoUsuario() {
  const invalidar = useInvalidarUsuarios();

  return useMutation({
    mutationFn: cambiarEstadoUsuario,
    onSuccess: invalidar,
  });
}
