import apiClient from "@/api/client";
import type { AlertaStock } from "../types";

/**
 * El backend no expone notificaciones: las alertas se derivan de las
 * existencias. Tampoco conviene apoyarse en `?estadoStock=`, porque ese filtro
 * se aplica en memoria sobre la página pedida y dejaría fuera al resto del
 * catálogo. Se pide un lote amplio en una sola llamada y se clasifica aquí.
 */

const TAMANO_LOTE = 300;

interface PageEnvelope<T> {
  content: T[];
  totalElements: number;
}

interface ExistenciaDto {
  id: number;
  productoId?: number;
  sku?: string;
  nombreProducto?: string;
  sucursalId?: number;
  nombreSucursal?: string;
  cantidadDisponible?: number;
  stockMinimo?: number;
  estadoStock?: string;
}

const PRIORIDAD: Record<AlertaStock["estado"], number> = {
  agotado: 0,
  critico: 1,
  bajo: 2,
};

function clasificar(
  stock: number,
  stockMinimo: number,
  estadoBackend?: string
): AlertaStock["estado"] | null {
  if (stock <= 0) return "agotado";
  if (estadoBackend === "critico" || estadoBackend === "bajo") {
    return estadoBackend;
  }
  // Respaldo por si el backend no envía el estado calculado.
  if (stockMinimo > 0 && stock < stockMinimo) {
    return stock < stockMinimo * 0.5 ? "critico" : "bajo";
  }
  return null;
}

export async function fetchAlertasStock(
  sucursalId?: string
): Promise<AlertaStock[]> {
  const { data } = await apiClient.get<PageEnvelope<ExistenciaDto>>(
    "/v1/existencias",
    {
      params: {
        page: 0,
        size: TAMANO_LOTE,
        ...(sucursalId ? { sucursalId: Number(sucursalId) } : {}),
      },
    }
  );

  const alertas: AlertaStock[] = [];

  for (const dto of data.content) {
    const stock = Number(dto.cantidadDisponible ?? 0);
    const stockMinimo = Number(dto.stockMinimo ?? 0);
    const estado = clasificar(stock, stockMinimo, dto.estadoStock);
    if (!estado) continue;

    alertas.push({
      existenciaId: String(dto.id),
      productoId: String(dto.productoId ?? dto.id),
      sku: dto.sku ?? "",
      nombre: dto.nombreProducto ?? "Producto sin nombre",
      sucursalId: dto.sucursalId === undefined ? "" : String(dto.sucursalId),
      sucursal: dto.nombreSucursal ?? "—",
      stock,
      stockMinimo,
      estado,
    });
  }

  return alertas.sort((a, b) => {
    const porEstado = PRIORIDAD[a.estado] - PRIORIDAD[b.estado];
    if (porEstado !== 0) return porEstado;
    return a.nombre.localeCompare(b.nombre);
  });
}
