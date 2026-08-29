import apiClient from "@/api/client";
import type {
  FiltrosVentas,
  LineaVentaHistorial,
  NuevaVentaPayload,
  ProductoVenta,
  Venta,
} from "../types";

/**
 * Único punto de acceso a Ventas contra el backend.
 *
 * - Catálogo: `GET /ventas/catalogo` (productos con stock disponible por sucursal).
 * - Registro: `POST /ventas` (descuenta stock automáticamente).
 * - Historial: `GET /ventas` (paginado con filtros) y `GET /ventas/{id}`.
 *
 * El backend trabaja con identificadores numéricos; la UI de Ventas usa
 * cadenas, por lo que cada función traduce los `id`/`sucursalId`/`productoId`.
 */

interface PageEnvelope<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

function getId(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

/** DTO real de `GET /ventas/catalogo`. */
interface ProductoVentaDto {
  productoId: number;
  sku: string;
  nombre: string;
  categoriaId: number;
  categoria: string;
  sucursalId: number;
  sucursal: string;
  precioUnitario: number;
  stockDisponible: number;
}

/** DTO real de `POST /ventas`, `GET /ventas` y `GET /ventas/{id}`. */
interface VentaDto {
  id: number;
  codigo: string;
  sucursalId?: number;
  nombreSucursal?: string;
  usuarioId?: number;
  nombreUsuario?: string;
  descuentoPorcentaje?: number;
  subtotal?: number;
  total: number;
  unidades: number;
  fecha: string;
  lineas?: Array<{
    id?: number;
    productoId?: number;
    sku?: string;
    nombreProducto?: string;
    cantidad?: number;
    precioUnitario?: number;
    descuento?: number;
    subtotal?: number;
  }>;
}

function toVenta(dto: VentaDto): Venta {
  return {
    id: getId(dto.id),
    codigo: dto.codigo,
    sucursalId: getId(dto.sucursalId),
    nombreSucursal: dto.nombreSucursal ?? "",
    usuarioId: getId(dto.usuarioId),
    nombreUsuario: dto.nombreUsuario ?? "",
    descuentoPorcentaje: Number(dto.descuentoPorcentaje ?? 0),
    subtotal: Number(dto.subtotal ?? 0),
    total: dto.total,
    unidades: dto.unidades,
    fecha: dto.fecha,
    lineas: (dto.lineas ?? []).map<LineaVentaHistorial>((l) => ({
      id: getId(l.id),
      productoId: getId(l.productoId),
      sku: l.sku ?? "",
      nombreProducto: l.nombreProducto ?? "",
      cantidad: Number(l.cantidad ?? 0),
      precioUnitario: Number(l.precioUnitario ?? 0),
      descuento: Number(l.descuento ?? 0),
      subtotal: Number(l.subtotal ?? 0),
    })),
  };
}

export async function fetchCatalogoVenta(): Promise<ProductoVenta[]> {
  const { data } = await apiClient.get<ProductoVentaDto[]>("/v1/ventas/catalogo");
  return data.map((dto) => ({
    productoId: getId(dto.productoId),
    sku: dto.sku,
    nombre: dto.nombre,
    categoriaId: getId(dto.categoriaId),
    categoria: dto.categoria,
    sucursalId: getId(dto.sucursalId),
    sucursal: dto.sucursal,
    precioUnitario: dto.precioUnitario,
    stockDisponible: dto.stockDisponible,
  }));
}

export async function registrarVenta(payload: NuevaVentaPayload): Promise<Venta> {
  const { data } = await apiClient.post<VentaDto>("/v1/ventas", {
    sucursalId: Number(payload.sucursalId),
    descuentoPorcentaje: payload.descuentoPorcentaje,
    lineas: payload.lineas.map((linea) => ({
      productoId: Number(linea.productoId),
      cantidad: linea.cantidad,
    })),
  });

  return toVenta(data);
}

export async function fetchVentas(
  filtros: FiltrosVentas,
  page = 0,
  size = 10
): Promise<PageEnvelope<Venta>> {
  const { data } = await apiClient.get<PageEnvelope<VentaDto>>("/v1/ventas", {
    params: {
      page,
      size,
      sucursalId: filtros.sucursalId ? Number(filtros.sucursalId) : undefined,
      busqueda: filtros.busqueda || undefined,
      fechaDesde: filtros.desde ? `${filtros.desde}T00:00:00` : undefined,
      fechaHasta: filtros.hasta ? `${filtros.hasta}T23:59:59` : undefined,
    },
  });
  return {
    content: data.content.map(toVenta),
    page: data.page,
    size: data.size,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  };
}

export async function fetchVenta(id: string): Promise<Venta> {
  const { data } = await apiClient.get<VentaDto>(`/v1/ventas/${Number(id)}`);
  return toVenta(data);
}
