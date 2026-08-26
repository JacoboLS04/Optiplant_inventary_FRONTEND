import { categoriasMock, sucursalesMock } from "@/features/catalogos/mocks/catalogos.mock";
import { resolverEstadoStock } from "../lib/estado-stock";
import { productosStore } from "../mocks/inventario.mock";
import type { AjusteStockPayload, NuevoProductoPayload, Producto } from "../types";

/**
 * Único punto a reemplazar por llamadas reales de `apiClient`. Las mutaciones
 * escriben sobre el almacén en memoria y devuelven el registro resultante,
 * igual que hará el backend.
 */

const MOCK_LATENCY_MS = 450;

function resolveWithLatency<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_LATENCY_MS);
  });
}

export function fetchProductos(): Promise<Producto[]> {
  return resolveWithLatency([...productosStore]);
}

export function crearProducto(payload: NuevoProductoPayload): Promise<Producto> {
  const producto: Producto = {
    id: `PRD-${String(productosStore.length + 1).padStart(3, "0")}`,
    sku: payload.sku,
    nombre: payload.nombre,
    categoriaId: payload.categoriaId,
    categoria:
      categoriasMock.find((categoria) => categoria.id === payload.categoriaId)
        ?.nombre ?? "Sin categoría",
    sucursalId: payload.sucursalId,
    sucursal:
      sucursalesMock.find((sucursal) => sucursal.id === payload.sucursalId)
        ?.nombre ?? "Sin sucursal",
    stock: payload.stock,
    stockMinimo: payload.stockMinimo,
    precioUnitario: payload.precioUnitario,
    estado: resolverEstadoStock(payload.stock, payload.stockMinimo),
    actualizadoEn: new Date().toISOString(),
  };

  productosStore.unshift(producto);
  return resolveWithLatency(producto);
}

export function registrarAjusteStock(
  payload: AjusteStockPayload
): Promise<Producto> {
  const producto = productosStore.find(
    (item) => item.id === payload.productoId
  );

  if (!producto) {
    return Promise.reject(new Error("El producto no existe"));
  }

  const delta = payload.tipo === "entrada" ? payload.cantidad : -payload.cantidad;
  producto.stock = Math.max(0, producto.stock + delta);
  producto.estado = resolverEstadoStock(producto.stock, producto.stockMinimo);
  producto.actualizadoEn = new Date().toISOString();

  return resolveWithLatency({ ...producto });
}
