import apiClient from "@/api/client";
import type {
  ActualizarSucursalPayload,
  CrearSucursalPayload,
  Sucursal,
} from "../types";

/**
 * Único punto de acceso a `/v1/sucursales`. La lista no está paginada:
 * se devuelve completa y el filtrado por nombre se hace en el cliente.
 */

const BASE = "/v1/sucursales";

interface SucursalDto {
  id: number | string;
  nombre?: string;
  direccion?: string | null;
  estado?: string;
}

function toSucursal(dto: SucursalDto): Sucursal {
  return {
    id: String(dto.id),
    nombre: dto.nombre ?? "",
    direccion: dto.direccion ?? null,
    activa: dto.estado === "activa",
  };
}

/** Los ids de sucursal del backend son numéricos; se envían como número. */
function toIdBackend(id: string): number | string {
  const numero = Number(id);
  return Number.isNaN(numero) ? id : numero;
}

export async function fetchSucursales(): Promise<Sucursal[]> {
  const { data } = await apiClient.get<SucursalDto[]>(BASE);
  return (data ?? []).map(toSucursal);
}

export async function crearSucursal(
  payload: CrearSucursalPayload
): Promise<Sucursal> {
  const { data } = await apiClient.post<SucursalDto>(BASE, {
    nombre: payload.nombre,
    ...(payload.direccion ? { direccion: payload.direccion } : {}),
  });

  return toSucursal(data);
}

export async function actualizarSucursal({
  id,
  payload,
}: {
  id: string;
  payload: ActualizarSucursalPayload;
}): Promise<Sucursal> {
  const { data } = await apiClient.put<SucursalDto>(`${BASE}/${toIdBackend(id)}`, {
    nombre: payload.nombre,
    ...(payload.direccion ? { direccion: payload.direccion } : {}),
  });

  return toSucursal(data);
}

/** Solo es necesario inactivar; el backend no permite reactivar por esta vía. */
export async function inactivarSucursal({ id }: { id: string }): Promise<Sucursal> {
  const { data } = await apiClient.patch<SucursalDto>(
    `${BASE}/${toIdBackend(id)}/estado`
  );

  return toSucursal(data);
}
