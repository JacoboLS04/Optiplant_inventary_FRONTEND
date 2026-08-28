import apiClient from "@/api/client";
import type {
  NuevaTransferenciaPayload,
  ProductoDisponible,
  Transferencia,
} from "../types";

/**
 * Único punto de acceso a Transferencias contra el backend real.
 *
 * - `fetchProductosDisponibles`: `GET /existencias?sucursalId=...` (stock > 0
 *   en la sucursal de origen) con la categoría resuelta desde `/productos`.
 * - `crearTransferencia`: `POST /transferencias` (modelo multi-item: cabecera
 *   + líneas de producto).
 *
 * El backend trabaja con identificadores numéricos; la UI usa cadenas, por lo
 * que cada función traduce los `id`/`sucursalId`/`productoId`.
 */

/** Envelope de paginación que devuelve el backend Spring. */
interface PageEnvelope<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** DTO real de `GET /existencias`. */
interface ExistenciaDto {
  id: number;
  productoId?: number;
  sku?: string;
  nombreProducto?: string;
  sucursalId?: number;
  cantidadDisponible?: number;
}

/** DTO real de `GET /productos` (para resolver la categoría por producto). */
interface ProductoDto {
  id?: number;
  categoriaNombre?: string;
}

/** DTO real de `GET /transferencias` y `POST /transferencias`. */
interface TransferenciaDto {
  id: number;
  codigo: string;
  sucursalOrigenId?: number;
  sucursalDestinoId?: number;
  nombreUsuarioSolicitante?: string;
  estado?: string;
  fechaSolicitud?: string;
  fechaDespacho?: string;
  totalUnidades: number;
  lineas: Array<{
    productoId: number;
    cantidadSolicitada: number;
  }>;
}

const PAGE_SIZE = 100;

function getId(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

async function fetchAllPages<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const primera = await apiClient.get<PageEnvelope<T>>(url, {
    params: { page: 0, size: PAGE_SIZE, ...params },
  });
  const { content, totalPages } = primera.data;
  if (totalPages <= 1) return content;

  const resto = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      apiClient.get<PageEnvelope<T>>(url, {
        params: { page: i + 1, size: PAGE_SIZE, ...params },
      })
    )
  );
  return [...content, ...resto.flatMap((res) => res.data.content)];
}

async function fetchCategoriasPorProducto(): Promise<Map<number, string>> {
  const list = await fetchAllPages<ProductoDto>("/v1/productos");
  return new Map(
    list
      .filter((p) => p.id !== undefined)
      .map((p) => [p.id as number, p.categoriaNombre ?? "—"])
  );
}

export async function fetchProductosDisponibles(
  sucursalId: string
): Promise<ProductoDisponible[]> {
  const [existencias, categorias] = await Promise.all([
    fetchAllPages<ExistenciaDto>("/v1/existencias", {
      sucursalId: Number(sucursalId),
    }),
    fetchCategoriasPorProducto(),
  ]);

  return existencias
    .filter((dto) => Number(dto.cantidadDisponible ?? 0) > 0)
    .map<ProductoDisponible>((dto) => {
      const productoId = dto.productoId ?? dto.id;
      return {
        productoId: getId(productoId),
        sku: dto.sku ?? "",
        nombre: dto.nombreProducto ?? "",
        categoria: categorias.get(Number(productoId)) ?? "—",
        stockDisponible: Number(dto.cantidadDisponible ?? 0),
      };
    });
}

export async function crearTransferencia(
  payload: NuevaTransferenciaPayload
): Promise<Transferencia> {
  const { data } = await apiClient.post<TransferenciaDto>("/v1/transferencias", {
    sucursalOrigenId: Number(payload.sucursalOrigenId),
    sucursalDestinoId: Number(payload.sucursalDestinoId),
    transportista: payload.transportador.trim() || undefined,
    lineas: payload.items.map((item) => ({
      productoId: Number(item.productoId),
      cantidadSolicitada: item.cantidad,
    })),
  });

  return {
    id: getId(data.id),
    codigo: data.codigo,
    sucursalOrigenId: getId(data.sucursalOrigenId),
    sucursalDestinoId: getId(data.sucursalDestinoId),
    estado: ("en_transito" as Transferencia["estado"]),
    fechaEnvio: data.fechaDespacho ?? data.fechaSolicitud ?? "",
    responsable: data.nombreUsuarioSolicitante ?? "",
    totalUnidades: data.totalUnidades,
  };
}
