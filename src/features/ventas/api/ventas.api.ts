import { resolverEstadoStock } from "@/features/inventario/lib/estado-stock";
import { productosStore } from "@/features/inventario/mocks/inventario.mock";
import type { NuevaVentaPayload, ProductoVenta, Venta } from "../types";

/**
 * Único punto a reemplazar por llamadas reales de `apiClient`. El catálogo se
 * deriva de las existencias de inventario y la venta descuenta stock, tal como
 * hará el backend al registrar el movimiento de salida.
 */

const MOCK_LATENCY_MS = 400;

function resolveWithLatency<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_LATENCY_MS);
  });
}

export function fetchCatalogoVenta(): Promise<ProductoVenta[]> {
  const catalogo = productosStore
    .filter((producto) => producto.stock > 0)
    .map<ProductoVenta>((producto) => ({
      productoId: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      categoriaId: producto.categoriaId,
      categoria: producto.categoria,
      sucursalId: producto.sucursalId,
      sucursal: producto.sucursal,
      precioUnitario: producto.precioUnitario,
      stockDisponible: producto.stock,
    }));

  return resolveWithLatency(catalogo);
}

let consecutivo = 0;

export function registrarVenta(payload: NuevaVentaPayload): Promise<Venta> {
  let subtotal = 0;
  let unidades = 0;

  for (const linea of payload.lineas) {
    const producto = productosStore.find((item) => item.id === linea.productoId);
    if (!producto) continue;

    subtotal += producto.precioUnitario * linea.cantidad;
    unidades += linea.cantidad;

    producto.stock = Math.max(0, producto.stock - linea.cantidad);
    producto.estado = resolverEstadoStock(producto.stock, producto.stockMinimo);
    producto.actualizadoEn = new Date().toISOString();
  }

  consecutivo += 1;

  return resolveWithLatency({
    id: `VNT-${String(consecutivo).padStart(3, "0")}`,
    codigo: `V-${String(consecutivo).padStart(4, "0")}`,
    sucursalId: payload.sucursalId,
    total: Math.round(subtotal * (1 - payload.descuentoPorcentaje / 100)),
    unidades,
    fecha: new Date().toISOString(),
  });
}
