import {
  branchNetworkMock,
  inventorySummaryMock,
  recentMovementsMock,
} from "../mocks/dashboard.mock";
import type {
  BranchNetworkData,
  InventoryMovement,
  InventorySummaryData,
} from "../types";

/**
 * Capa de acceso a datos del dashboard. Hoy resuelve contra los mocks locales
 * con una latencia simulada para que los estados de carga sean reales; al
 * conectar el backend basta con reemplazar el cuerpo de cada función por la
 * llamada correspondiente de `apiClient` sin tocar hooks ni componentes.
 */

const MOCK_LATENCY_MS = 550;

function resolveWithLatency<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_LATENCY_MS);
  });
}

export function fetchInventorySummary(): Promise<InventorySummaryData> {
  return resolveWithLatency(inventorySummaryMock);
}

export function fetchRecentMovements(): Promise<InventoryMovement[]> {
  return resolveWithLatency(recentMovementsMock);
}

export function fetchBranchNetwork(): Promise<BranchNetworkData> {
  return resolveWithLatency({
    ...branchNetworkMock,
    updatedAt: new Date().toISOString(),
  });
}
