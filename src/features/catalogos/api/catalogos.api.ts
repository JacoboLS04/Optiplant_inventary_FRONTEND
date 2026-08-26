import { categoriasMock, sucursalesMock } from "../mocks/catalogos.mock";
import type { Categoria, Sucursal } from "../types";

/**
 * Único punto a reemplazar por llamadas reales de `apiClient` cuando el
 * backend esté conectado.
 */

const MOCK_LATENCY_MS = 300;

function resolveWithLatency<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_LATENCY_MS);
  });
}

export function fetchSucursales(): Promise<Sucursal[]> {
  return resolveWithLatency(sucursalesMock);
}

export function fetchCategorias(): Promise<Categoria[]> {
  return resolveWithLatency(categoriasMock);
}
