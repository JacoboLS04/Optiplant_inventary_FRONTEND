import apiClient from "@/api/client";

import {
  toOrdenCompra,
  type OrdenCompraDto,
} from "@/features/compras/api/compras.api";
import type { EstadoOrdenCompra, OrdenCompra } from "@/features/compras/types";

/**
 * API del portal de proveedor (backend: `/api/v1/portal/ordenes-compra`).
 * El proveedor solo ve y opera sobre las órdenes de SU proveedor:
 *   - GET  /v1/portal/ordenes-compra?estado&busqueda -> OrdenCompraResponse[]
 *   - GET  /v1/portal/ordenes-compra/{id}
 *   - POST /v1/portal/ordenes-compra/{id}/confirmar   (ENVIADA -> CONFIRMADA)
 *   - POST /v1/portal/ordenes-compra/{id}/despachar   (CONFIRMADA -> EN_TRANSITO)
 */

async function toOrdenCompraList(data: unknown): Promise<OrdenCompra[]> {
  const lista = (data as OrdenCompraDto[]) ?? [];
  return lista.map(toOrdenCompra);
}

export async function fetchPortalOrdenes(
  estado?: EstadoOrdenCompra | "todas",
  busqueda?: string
): Promise<OrdenCompra[]> {
  const params: Record<string, string> = {};
  if (estado && estado !== "todas") params.estado = estado.toUpperCase();
  if (busqueda && busqueda.trim()) params.busqueda = busqueda.trim();

  const { data } = await apiClient.get<OrdenCompraDto[]>(
    "/v1/portal/ordenes-compra",
    { params }
  );
  return toOrdenCompraList(data);
}

export async function fetchPortalOrden(id: string): Promise<OrdenCompra> {
  const { data } = await apiClient.get<OrdenCompraDto>(
    `/v1/portal/ordenes-compra/${id}`
  );
  return toOrdenCompra(data);
}

export async function confirmarOrden(id: string): Promise<OrdenCompra> {
  const { data } = await apiClient.post<OrdenCompraDto>(
    `/v1/portal/ordenes-compra/${id}/confirmar`
  );
  return toOrdenCompra(data);
}

export async function despacharOrden(
  id: string,
  payload: { transportista?: string; guia?: string; fechaEntregaEstimada?: string }
): Promise<OrdenCompra> {
  const { data } = await apiClient.post<OrdenCompraDto>(
    `/v1/portal/ordenes-compra/${id}/despachar`,
    {
      transportista: payload.transportista ?? null,
      guia: payload.guia ?? null,
      fechaEntregaEstimada: payload.fechaEntregaEstimada ?? null,
    }
  );
  return toOrdenCompra(data);
}