import apiClient from "@/api/client";
import type {
  BranchNetworkData,
  InventoryMovement,
  InventorySummaryData,
} from "../types";

/**
 * Único punto de acceso al Dashboard contra el backend.
 *
 * - `GET /dashboard/resumen`      → resumen consolidado + distribución por categoría.
 * - `GET /dashboard/movimientos`  → últimos movimientos de inventario.
 * - `GET /dashboard/red`          → red de sucursales + alertas de stock.
 *
 * El backend devuelve identificadores numéricos; la UI del Dashboard usa
 * cadenas, por lo que se traducen aquí sin tocar componentes ni hooks.
 */

function getId(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

/** DTO real de `GET /dashboard/resumen`. */
interface InventorySummaryDto {
  summary: {
    totalValue: number;
    totalUnits: number;
    skuCount: number;
    branchCount: number;
    inflowValue30d: number;
    outflowValue30d: number;
    changePercent: number;
    updatedAt: string;
  };
  distribution: Array<{ category: string; units: number; value: number }>;
}

/** DTO real de `GET /dashboard/movimientos`. */
interface InventoryMovementDto {
  id: number;
  product: string;
  sku: string;
  type: InventoryMovement["type"];
  branch: string;
  quantity: number;
  date: string;
}

/** DTO real de `GET /dashboard/red`. */
interface BranchNetworkDto {
  nodes: Array<{
    id: number;
    name: string;
    kind: BranchNetworkData["nodes"][number]["kind"];
    status: BranchNetworkData["nodes"][number]["status"];
    units: number;
    skuCount: number;
    lowStockCount: number;
    x: number;
    y: number;
  }>;
  links: Array<{
    from: number;
    to: number;
    status: BranchNetworkData["links"][number]["status"];
  }>;
  alerts: Array<{
    id: number;
    product: string;
    branchId: number;
    branchName: string;
    currentUnits: number;
    minUnits: number;
    severity: BranchNetworkData["alerts"][number]["severity"];
  }>;
  updatedAt: string;
}

export async function fetchInventorySummary(): Promise<InventorySummaryData> {
  const { data } = await apiClient.get<InventorySummaryDto>("/v1/dashboard/resumen");

  return {
    summary: {
      totalValue: data.summary.totalValue,
      totalUnits: data.summary.totalUnits,
      skuCount: data.summary.skuCount,
      branchCount: data.summary.branchCount,
      inflowValue30d: data.summary.inflowValue30d,
      outflowValue30d: data.summary.outflowValue30d,
      changePercent: data.summary.changePercent,
      updatedAt: data.summary.updatedAt,
    },
    distribution: data.distribution.map((d) => ({
      category: d.category,
      units: d.units,
      value: d.value,
    })),
  };
}

export async function fetchRecentMovements(): Promise<InventoryMovement[]> {
  const { data } = await apiClient.get<InventoryMovementDto[]>(
    "/v1/dashboard/movimientos"
  );
  return data.map((dto) => ({
    id: getId(dto.id),
    product: dto.product,
    sku: dto.sku,
    type: dto.type,
    branch: dto.branch,
    quantity: dto.quantity,
    date: dto.date,
  }));
}

export async function fetchBranchNetwork(): Promise<BranchNetworkData> {
  const { data } = await apiClient.get<BranchNetworkDto>("/v1/dashboard/red");

  return {
    nodes: data.nodes.map((n) => ({
      id: getId(n.id),
      name: n.name,
      kind: n.kind,
      status: n.status,
      units: n.units,
      skuCount: n.skuCount,
      lowStockCount: n.lowStockCount,
      x: n.x,
      y: n.y,
    })),
    links: data.links.map((l) => ({
      from: getId(l.from),
      to: getId(l.to),
      status: l.status,
    })),
    alerts: data.alerts.map((a) => ({
      id: getId(a.id),
      product: a.product,
      branchId: getId(a.branchId),
      branchName: a.branchName,
      currentUnits: a.currentUnits,
      minUnits: a.minUnits,
      severity: a.severity,
    })),
    updatedAt: data.updatedAt,
  };
}
