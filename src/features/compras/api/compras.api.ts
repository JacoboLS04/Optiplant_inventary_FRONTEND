import { ordenesCompraStore } from "../mocks/compras.mock";
import type { OrdenCompra } from "../types";

/** Único punto a reemplazar por llamadas reales de `apiClient`. */

const MOCK_LATENCY_MS = 500;

export function fetchOrdenesCompra(): Promise<OrdenCompra[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...ordenesCompraStore]), MOCK_LATENCY_MS);
  });
}
