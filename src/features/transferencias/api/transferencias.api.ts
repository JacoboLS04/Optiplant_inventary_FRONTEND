import { productosStore } from "@/features/inventario/mocks/inventario.mock";
import type {
  NuevaTransferenciaPayload,
  ProductoDisponible,
  Transferencia,
} from "../types";

/**
 * Único punto a reemplazar por llamadas reales de `apiClient`. Los productos
 * disponibles se derivan del mismo almacén de existencias que usa Inventario,
 * igual que hará el backend al consultar `Existencia` por sucursal.
 */

const MOCK_LATENCY_MS = 400;

function resolveWithLatency<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_LATENCY_MS);
  });
}

export function fetchProductosDisponibles(
  sucursalId: string
): Promise<ProductoDisponible[]> {
  const disponibles = productosStore
    .filter(
      (producto) => producto.sucursalId === sucursalId && producto.stock > 0
    )
    .map<ProductoDisponible>((producto) => ({
      productoId: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      categoria: producto.categoria,
      stockDisponible: producto.stock,
    }));

  return resolveWithLatency(disponibles);
}

let consecutivo = 0;

export function crearTransferencia(
  payload: NuevaTransferenciaPayload
): Promise<Transferencia> {
  consecutivo += 1;

  return resolveWithLatency({
    id: `TRF-${String(consecutivo).padStart(3, "0")}`,
    codigo: `TR-${String(consecutivo).padStart(4, "0")}`,
    sucursalOrigenId: payload.sucursalOrigenId,
    sucursalDestinoId: payload.sucursalDestinoId,
    estado: "en_transito",
    fechaEnvio: payload.fechaEnvio,
    responsable: payload.responsable,
    totalUnidades: payload.items.reduce((acc, item) => acc + item.cantidad, 0),
  });
}
