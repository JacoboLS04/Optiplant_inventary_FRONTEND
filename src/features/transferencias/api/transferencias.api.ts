import apiClient from "@/api/client";
import type {
  Aprobacion,
  EstadoTransferencia,
  Faltante,
  FiltrosTransferencias,
  LineaTransferencia,
  NuevaTransferenciaPayload,
  ProductoDisponible,
  RolAprobacion,
  Transferencia,
  TratamientoFaltante,
} from "../types";

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
  nombreSucursalOrigen?: string;
  nombreSucursalDestino?: string;
  usuarioSolicitanteId?: number;
  nombreUsuarioSolicitante?: string;
  urgencia?: string;
  transportista?: string;
  guia?: string;
  fechaEstimadaLlegada?: string;
  estado?: string;
  fechaSolicitud?: string;
  fechaDespacho?: string;
  fechaRecepcion?: string;
  totalUnidades?: number;
  lineas?: Array<{
    id?: number;
    productoId?: number;
    sku?: string;
    nombreProducto?: string;
    cantidadSolicitada?: number;
    cantidadDespachada?: number;
    cantidadRecibida?: number;
    cantidadDisponibleOrigen?: number;
    faltantes?: Array<{
      id?: number;
      cantidadFaltante?: number;
      tratamiento?: string;
      productoId?: number;
      nombreProducto?: string;
    }>;
  }>;
  aprobaciones?: Array<{
    id?: number;
    gerenteId?: number;
    nombreGerente?: string;
    rolAprobacion?: string;
    decision?: string;
    fecha?: string;
    observacion?: string;
  }>;
}

const PAGE_SIZE = 50;

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

function toTransferencia(data: TransferenciaDto): Transferencia {
  return {
    id: getId(data.id),
    codigo: data.codigo ?? "",
    sucursalOrigenId: getId(data.sucursalOrigenId),
    sucursalDestinoId: getId(data.sucursalDestinoId),
    nombreSucursalOrigen: data.nombreSucursalOrigen ?? "",
    nombreSucursalDestino: data.nombreSucursalDestino ?? "",
    usuarioSolicitanteId: getId(data.usuarioSolicitanteId),
    nombreUsuarioSolicitante: data.nombreUsuarioSolicitante ?? "",
    urgencia: (data.urgencia as Transferencia["urgencia"]) ?? "NORMAL",
    transportista: data.transportista ?? "",
    guia: data.guia ?? "",
    fechaEstimadaLlegada: data.fechaEstimadaLlegada ?? "",
    estado: (data.estado as EstadoTransferencia) ?? "SOLICITADA",
    fechaSolicitud: data.fechaSolicitud ?? "",
    fechaDespacho: data.fechaDespacho ?? "",
    fechaRecepcion: data.fechaRecepcion ?? "",
    totalUnidades: Number(data.totalUnidades ?? 0),
    lineas: (data.lineas ?? []).map<LineaTransferencia>((l) => ({
      id: getId(l.id),
      productoId: getId(l.productoId),
      sku: l.sku ?? "",
      nombreProducto: l.nombreProducto ?? "",
      cantidadSolicitada: Number(l.cantidadSolicitada ?? 0),
      cantidadDespachada: Number(l.cantidadDespachada ?? 0),
      cantidadRecibida: Number(l.cantidadRecibida ?? 0),
      cantidadDisponibleOrigen: Number(l.cantidadDisponibleOrigen ?? 0),
      faltantes: (l.faltantes ?? []).map<Faltante>((f) => ({
        id: getId(f.id),
        productoId: getId(f.productoId ?? l.productoId),
        nombreProducto: f.nombreProducto ?? l.nombreProducto ?? "",
        cantidadFaltante: Number(f.cantidadFaltante ?? 0),
        tratamiento: (f.tratamiento as TratamientoFaltante) ?? "RECLAMACION",
      })),
    })),
    aprobaciones: (data.aprobaciones ?? []).map<Aprobacion>((a) => ({
      id: getId(a.id),
      gerenteId: getId(a.gerenteId),
      nombreGerente: a.nombreGerente ?? "",
      rolAprobacion: (a.rolAprobacion as RolAprobacion) ?? "ORIGEN",
      decision: (a.decision as Aprobacion["decision"]) ?? "APROBADO",
      fecha: a.fecha ?? "",
      observacion: a.observacion ?? "",
    })),
  };
}

export async function fetchTransferencias(
  filtros: FiltrosTransferencias,
  page = 0,
  size = 10
): Promise<PageEnvelope<Transferencia>> {
  const { data } = await apiClient.get<PageEnvelope<TransferenciaDto>>(
    "/v1/transferencias",
    {
      params: {
        page,
        size,
        sucursalOrigenId: filtros.sucursalOrigenId
          ? Number(filtros.sucursalOrigenId)
          : undefined,
        sucursalDestinoId: filtros.sucursalDestinoId
          ? Number(filtros.sucursalDestinoId)
          : undefined,
        estado: filtros.estado || undefined,
        busqueda: filtros.busqueda || undefined,
      },
    }
  );
  return {
    content: data.content.map(toTransferencia),
    page: data.page,
    size: data.size,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  };
}

export async function fetchTransferencia(id: string): Promise<Transferencia> {
  const { data } = await apiClient.get<TransferenciaDto>(
    `/v1/transferencias/${Number(id)}`
  );
  return toTransferencia(data);
}

export async function crearTransferencia(
  payload: NuevaTransferenciaPayload
): Promise<Transferencia> {
  const { data } = await apiClient.post<TransferenciaDto>("/v1/transferencias", {
    sucursalOrigenId: Number(payload.sucursalOrigenId),
    sucursalDestinoId: Number(payload.sucursalDestinoId),
    urgencia: "NORMAL",
    lineas: payload.items.map((item) => ({
      productoId: Number(item.productoId),
      cantidadSolicitada: item.cantidad,
    })),
  });
  return toTransferencia(data);
}

export interface AprobarTransferenciaPayload {
  transferenciaId: string;
  gerenteId: string;
  rolAprobacion: RolAprobacion;
  decision: "APROBADO" | "RECHAZADO";
  observacion?: string;
}

export async function aprobarTransferencia(
  payload: AprobarTransferenciaPayload
): Promise<Transferencia> {
  const { data } = await apiClient.post<TransferenciaDto>(
    `/v1/transferencias/${Number(payload.transferenciaId)}/aprobacion`,
    {
      gerenteId: payload.gerenteId ? Number(payload.gerenteId) : undefined,
      rolAprobacion: payload.rolAprobacion,
      decision: payload.decision,
      observacion: payload.observacion || undefined,
    }
  );
  return toTransferencia(data);
}

export async function prepararTransferencia(id: string): Promise<Transferencia> {
  const { data } = await apiClient.post<TransferenciaDto>(
    `/v1/transferencias/${Number(id)}/preparacion`
  );
  return toTransferencia(data);
}

export interface DespacharTransferenciaPayload {
  id: string;
  lineas: Array<{ transferenciaLineaId: string; cantidadDespachada: number }>;
  transportista?: string;
  guia?: string;
}

export async function despacharTransferencia(
  payload: DespacharTransferenciaPayload
): Promise<Transferencia> {
  const { data } = await apiClient.post<TransferenciaDto>(
    `/v1/transferencias/${Number(payload.id)}/despacho`,
    {
      lineas: payload.lineas.map((l) => ({
        transferenciaLineaId: Number(l.transferenciaLineaId),
        cantidadDespachada: l.cantidadDespachada,
      })),
      transportista: payload.transportista || undefined,
      guia: payload.guia || undefined,
    }
  );
  return toTransferencia(data);
}

export interface RecibirTransferenciaPayload {
  id: string;
  lineas: Array<{
    transferenciaLineaId: string;
    cantidadRecibida: number;
    tratamiento?: TratamientoFaltante;
  }>;
}

export async function recibirTransferencia(
  payload: RecibirTransferenciaPayload
): Promise<Transferencia> {
  const { data } = await apiClient.post<TransferenciaDto>(
    `/v1/transferencias/${Number(payload.id)}/recepcion`,
    {
      lineas: payload.lineas.map((l) => ({
        transferenciaLineaId: Number(l.transferenciaLineaId),
        cantidadRecibida: l.cantidadRecibida,
        tratamiento: l.tratamiento || undefined,
      })),
    }
  );
  return toTransferencia(data);
}

export async function cancelarTransferencia(id: string): Promise<Transferencia> {
  const { data } = await apiClient.post<TransferenciaDto>(
    `/v1/transferencias/${Number(id)}/cancelacion`
  );
  return toTransferencia(data);
}
