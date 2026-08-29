import apiClient from "@/api/client";
import { normalizarRol } from "@/lib/roles";
import type {
  ActualizarUsuarioPayload,
  CrearUsuarioPayload,
  FiltrosUsuarios,
  PaginaUsuarios,
  Usuario,
} from "../types";

/**
 * Único punto de acceso a `/v1/usuarios`. El backend restringe todos estos
 * endpoints al rol ADMINISTRADOR (403 para el resto).
 */

const BASE = "/v1/usuarios";

interface UsuarioDto {
  id: number | string;
  email?: string;
  nombre?: string;
  rol?: string;
  sucursalId?: number | string | null;
  sucursalNombre?: string | null;
  activo?: boolean;
}

/** Envelope de paginación que devuelve el backend Spring. */
interface PageEnvelope<T> {
  content?: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

function toUsuario(dto: UsuarioDto): Usuario {
  const sucursalId =
    dto.sucursalId === null || dto.sucursalId === undefined
      ? null
      : String(dto.sucursalId);

  return {
    id: String(dto.id),
    email: dto.email ?? "",
    nombre: dto.nombre ?? "",
    rol: normalizarRol(dto.rol) ?? "OPERADOR",
    sucursalId,
    sucursalNombre: dto.sucursalNombre ?? null,
    activo: dto.activo ?? false,
  };
}

/** Los ids de sucursal del backend son numéricos; se envían como número. */
function toIdBackend(id: string): number | string {
  const numero = Number(id);
  return Number.isNaN(numero) ? id : numero;
}

export async function fetchUsuarios(
  filtros: FiltrosUsuarios
): Promise<PaginaUsuarios> {
  const { data } = await apiClient.get<PageEnvelope<UsuarioDto>>(BASE, {
    params: {
      page: filtros.page,
      size: filtros.size,
      ...(filtros.rol ? { rol: filtros.rol } : {}),
      ...(filtros.activo === undefined ? {} : { activo: filtros.activo }),
      ...(filtros.busqueda ? { busqueda: filtros.busqueda } : {}),
    },
  });

  const usuarios = (data.content ?? []).map(toUsuario);

  return {
    usuarios,
    pagina: data.page ?? filtros.page,
    tamano: data.size ?? filtros.size,
    totalElementos: data.totalElements ?? usuarios.length,
    totalPaginas: data.totalPages ?? 1,
  };
}

export async function crearUsuario(
  payload: CrearUsuarioPayload
): Promise<Usuario> {
  const { data } = await apiClient.post<UsuarioDto>(BASE, {
    email: payload.email,
    password: payload.password,
    nombre: payload.nombre,
    rol: payload.rol,
    ...(payload.sucursalId
      ? { sucursalId: toIdBackend(payload.sucursalId) }
      : {}),
  });

  return toUsuario(data);
}

export async function actualizarUsuario({
  id,
  payload,
}: {
  id: string;
  payload: ActualizarUsuarioPayload;
}): Promise<Usuario> {
  const { data } = await apiClient.put<UsuarioDto>(`${BASE}/${id}`, {
    nombre: payload.nombre,
    rol: payload.rol,
    ...(payload.sucursalId
      ? { sucursalId: toIdBackend(payload.sucursalId) }
      : {}),
    ...(payload.password ? { password: payload.password } : {}),
  });

  return toUsuario(data);
}

export async function cambiarEstadoUsuario({
  id,
  activo,
}: {
  id: string;
  activo: boolean;
}): Promise<Usuario> {
  const { data } = await apiClient.patch<UsuarioDto>(`${BASE}/${id}/estado`, {
    activo,
  });

  return toUsuario(data);
}
