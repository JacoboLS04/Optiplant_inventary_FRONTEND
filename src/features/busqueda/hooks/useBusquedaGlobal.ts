import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/context/AuthContext";
import { esAdministrador } from "@/lib/roles";
import { buscarEnTodosLosModulos } from "../api/busqueda.api";

export const busquedaKeys = {
  all: ["busqueda-global"] as const,
  termino: (termino: string, incluirUsuarios: boolean) =>
    [...busquedaKeys.all, termino, incluirUsuarios] as const,
};

/** Longitud mínima para no disparar consultas con una sola letra. */
export const MINIMO_CARACTERES = 2;

export function useBusquedaGlobal(termino: string) {
  const { user } = useAuth();
  const incluirUsuarios = esAdministrador(user?.role);

  return useQuery({
    queryKey: busquedaKeys.termino(termino, incluirUsuarios),
    queryFn: () => buscarEnTodosLosModulos(termino, { incluirUsuarios }),
    enabled: termino.length >= MINIMO_CARACTERES,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
