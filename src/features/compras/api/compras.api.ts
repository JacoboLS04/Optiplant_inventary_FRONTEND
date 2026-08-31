import apiClient from "@/api/client";
import type {
  ItemOrdenCompra,
  NuevaOrdenCompraPayload,
  OrdenCompra,
  Proveedor,
  RecepcionLinea,
} from "../types";

/**
 * Único punto de acceso a proveedores y órdenes de compra (módulo Compras).
 * Reemplaza los mocks por llamadas reales al backend.
 *
 * Backend real (contrato verificado contra OpenAPI + pruebas manuales):
 *   - GET  /v1/proveedores -> ProveedorResponse[]
 *   - POST /v1/ordenes-compra (OrdenCompraRequest) -> OrdenCompraResponse
 *   - GET  /v1/ordenes-compra?sucursalId&estado&busqueda&page&size -> PaginatedResponse
 *   - GET  /v1/ordenes-compra/{id}
 *   - POST /v1/ordenes-compra/{id}/estado {estado}  (mayúsculas)
 *   - POST /v1/ordenes-compra/{id}/recepcion {lineas:[{lineaId,cantidadRecibida}]}
 *
 * Nota (defecto del backend): el GET de listado lanza `lower(bytea)` cuando el
 * parámetro `busqueda` queda vacío/nulo. El frontend siempre envía una
 * `busqueda` no vacía; para listar todo usa "PO" (prefijo de código que genera
 * el propio backend, véase `countByCodigoStartingWith("PO")`). Los filtros de
 * estado/sucursal/búsqueda se aplican en el cliente.
 */

const PAGE_SIZE = 100;

interface PageEnvelope<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ProveedorDto {
  id: number;
  nombre: string;
  contacto?: string;
  condicionesGenerales?: string;
}

export interface LineaDto {
  id: number;
  productoId: number;
  sku?: string;
  nombreProducto?: string;
  cantidadOrdenada?: number;
  cantidadRecibida?: number;
  cantidadPendiente?: number;
  precioUnitario?: number;
  descuento?: number;
  subtotal?: number;
}

export interface OrdenCompraDto {
  id: number;
  codigo?: string;
  proveedorId?: number;
  nombreProveedor?: string;
  sucursalDestinoId?: number;
  nombreSucursal?: string;
  usuarioId?: number;
  nombreUsuario?: string;
  estado?: string;
  fechaEmision?: string;
  fechaEntregaEstimada?: string;
  transportista?: string;
  guia?: string;
  condicionesPago?: string;
  total?: number;
  lineas?: LineaDto[];
}

export const ESTADOS_MAP: Record<string, OrdenCompra["estado"]> = {
  BORRADOR: "borrador",
  ENVIADA: "enviada",
  CONFIRMADA: "confirmada",
  EN_TRANSITO: "en_transito",
  RECIBIDA: "recibida",
  CANCELADA: "cancelada",
};

export function toEstado(estado?: string): OrdenCompra["estado"] {
  if (estado && ESTADOS_MAP[estado]) return ESTADOS_MAP[estado];
  return "borrador";
}

export function toItem(dto: LineaDto): ItemOrdenCompra {
  return {
    lineaId: String(dto.id),
    productoId: String(dto.productoId),
    sku: dto.sku ?? "",
    nombre: dto.nombreProducto ?? "",
    cantidadOrdenada: Number(dto.cantidadOrdenada ?? 0),
    cantidadRecibida: Number(dto.cantidadRecibida ?? 0),
    cantidadPendiente: Number(dto.cantidadPendiente ?? 0),
    precioUnitario: Number(dto.precioUnitario ?? 0),
    descuento: Number(dto.descuento ?? 0),
    subtotal: Number(dto.subtotal ?? 0),
  };
}

function toOrdenCompra(dto: OrdenCompraDto): OrdenCompra {
  return {
    id: String(dto.id),
    codigo: dto.codigo ?? "",
    proveedorId: String(dto.proveedorId ?? ""),
    proveedor: dto.nombreProveedor ?? "",
    sucursalDestinoId: String(dto.sucursalDestinoId ?? ""),
    sucursalDestino: dto.nombreSucursal ?? "",
    usuarioId: dto.usuarioId !== undefined ? String(dto.usuarioId) : undefined,
    nombreUsuario: dto.nombreUsuario,
    estado: toEstado(dto.estado),
    fechaEmision: dto.fechaEmision ?? "",
    fechaEntregaEstimada: dto.fechaEntregaEstimada,
    transportista: dto.transportista,
    guia: dto.guia,
    condicionesPago: dto.condicionesPago,
    items: (dto.lineas ?? []).map(toItem),
    total: Number(dto.total ?? 0),
  };
}

export { toOrdenCompra };

async function fetchTodasLasPaginas(
  params: Record<string, unknown>
): Promise<OrdenCompraDto[]> {
  const primera = await apiClient.get<PageEnvelope<OrdenCompraDto>>(
    "/v1/ordenes-compra",
    { params: { page: 0, size: PAGE_SIZE, ...params } }
  );
  const { content, totalPages } = primera.data;
  if (totalPages <= 1) return content;
  const resto = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      apiClient.get<PageEnvelope<OrdenCompraDto>>("/v1/ordenes-compra", {
        params: { page: i + 1, size: PAGE_SIZE, ...params },
      })
    )
  );
  return [...content, ...resto.flatMap((r) => r.data.content)];
}

export async function fetchProveedores(): Promise<Proveedor[]> {
  const { data } = await apiClient.get<ProveedorDto[]>("/v1/proveedores");
  return data.map((p) => ({
    id: String(p.id),
    nombre: p.nombre,
    contacto: p.contacto,
    condicionesGenerales: p.condicionesGenerales,
  }));
}

export async function fetchOrdenesCompra(): Promise<OrdenCompra[]> {
  // `busqueda` no vacía evita el defecto `lower(bytea)` del backend.
  const list = await fetchTodasLasPaginas({ busqueda: "PO" });
  return list.map(toOrdenCompra);
}

export async function crearOrdenCompra(
  payload: NuevaOrdenCompraPayload
): Promise<OrdenCompra> {
  const { data } = await apiClient.post<OrdenCompraDto>("/v1/ordenes-compra", {
    proveedorId: Number(payload.proveedorId),
    sucursalDestinoId: Number(payload.sucursalDestinoId),
    fechaEntregaEstimada: payload.fechaEntregaEstimada,
    transportista: payload.transportista,
    guia: payload.guia,
    condicionesPago: payload.condicionesPago,
    lineas: payload.lineas.map((linea) => ({
      productoId: Number(linea.productoId),
      cantidadOrdenada: linea.cantidadOrdenada,
      precioUnitario: linea.precioUnitario,
      descuento: linea.descuento,
    })),
  });
  return toOrdenCompra(data);
}

export async function cambiarEstadoOrden(
  id: string,
  estado: OrdenCompra["estado"]
): Promise<OrdenCompra> {
  const { data } = await apiClient.post<OrdenCompraDto>(
    `/v1/ordenes-compra/${id}/estado`,
    { estado: estado.toUpperCase() }
  );
  return toOrdenCompra(data);
}

export async function registrarRecepcion(
  id: string,
  lineas: RecepcionLinea[]
): Promise<OrdenCompra> {
  const { data } = await apiClient.post<OrdenCompraDto>(
    `/v1/ordenes-compra/${id}/recepcion`,
    {
      lineas: lineas.map((linea) => ({
        lineaId: Number(linea.lineaId),
        cantidadRecibida: linea.cantidadRecibida,
      })),
    }
  );
  return toOrdenCompra(data);
}
