import type { StockStatus } from "../types";

export const BRANCH_STATUS_LABEL: Record<StockStatus, string> = {
  ok: "Operativa",
  low: "Stock bajo",
  critical: "Stock crítico",
};

/**
 * Colores semánticos de estado del wireframe de red: verde = operativa,
 * azul = bodega central, rojo = alerta. Se resuelven aquí para que el mapa,
 * la leyenda y los paneles de detalle no se desincronicen.
 */
export const BRANCH_NODE_STYLE: Record<StockStatus | "warehouse", string> = {
  warehouse: "border-sky-500 bg-sky-50 text-sky-700",
  ok: "border-emerald-500 bg-primary/20 text-emerald-800",
  low: "border-amber-500 bg-amber-50 text-amber-800",
  critical: "border-destructive bg-destructive/10 text-destructive",
};

export const BRANCH_LINK_STROKE: Record<StockStatus, string> = {
  ok: "stroke-emerald-500/60",
  low: "stroke-amber-500/70",
  critical: "stroke-destructive/70",
};
