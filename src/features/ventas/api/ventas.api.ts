import apiClient from "@/api/client";
import type { NuevaVentaPayload, ProductoVenta, Venta } from "../types";

/**
 * Único punto de acceso a Ventas contra el backend.
 *
 * - Catálogo: `GET /ventas/catalogo` (productos con stock disponible por sucursal).
 * - Registro: `POST /ventas` (descuenta stock automáticamente).
 *
 * El backend trabaja con identificadores numéricos; la UI de Ventas usa
 * cadenas, por lo que cada función traduce los `id`/`sucursalId`/`productoId`.
 */

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

/** DTO real de `POST /ventas`. */
interface VentaDto {
  id: number;
  codigo: string;
  sucursalId: number;
  nombreSucursal: string;
  total: number;
  unidades: number;
  fecha: string;
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

  return {
    id: getId(data.id),
    codigo: data.codigo,
    sucursalId: getId(data.sucursalId),
    total: data.total,
    unidades: data.unidades,
    fecha: data.fecha,
  };
}
