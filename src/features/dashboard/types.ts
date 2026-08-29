export type StockStatus = "ok" | "low" | "critical";

export type BranchKind = "warehouse" | "branch";

export type MovementType = "entrada" | "salida" | "transferencia" | "ajuste";

/** Cifras agregadas de todas las existencias — cabecera del dashboard. */
export interface InventorySummary {
  totalValue: number;
  totalUnits: number;
  skuCount: number;
  branchCount: number;
  /** Valor de mercancía recibida por órdenes de compra en los últimos 30 días. */
  inflowValue30d: number;
  /** Valor de mercancía despachada por ventas en los últimos 30 días. */
  outflowValue30d: number;
  /** Variación del valor total frente al periodo anterior. */
  changePercent: number;
  updatedAt: string;
}

/** Porción del donut: distribución del stock por categoría de producto. */
export interface CategoryDistribution {
  category: string;
  units: number;
  value: number;
}

export interface InventorySummaryData {
  summary: InventorySummary;
  distribution: CategoryDistribution[];
}

export interface InventoryMovement {
  id: string;
  product: string;
  sku: string;
  type: MovementType;
  branch: string;
  /** Signo según el efecto sobre la existencia de la sucursal. */
  quantity: number;
  date: string;
}

export interface BranchNode {
  id: string;
  name: string;
  kind: BranchKind;
  status: StockStatus;
  units: number;
  skuCount: number;
  lowStockCount: number;
  /** Posición relativa dentro del mapa, en porcentaje del contenedor. */
  x: number;
  y: number;
}

/** Ruta de reabastecimiento entre dos sucursales del mapa. */
export interface BranchLink {
  from: string;
  to: string;
  status: StockStatus;
}

export interface StockAlert {
  id: string;
  product: string;
  branchId: string;
  branchName: string;
  currentUnits: number;
  minUnits: number;
  severity: Exclude<StockStatus, "ok">;
}

export interface BranchNetworkData {
  nodes: BranchNode[];
  links: BranchLink[];
  alerts: StockAlert[];
  updatedAt: string;
}

/** Producto con medición de rotación (unidades despachadas en el periodo). */
export interface ProductoRotacion {
  productoId: string;
  sku: string;
  nombre: string;
  unidades: number;
  stockActual: number;
  rotacion: number;
}

/** Respuesta de `GET /dashboard/rotacion` — rotación y demanda de productos. */
export interface RotacionData {
  periodoDias: number;
  totalUnidades: number;
  altaDemanda: ProductoRotacion[];
  bajaDemanda: ProductoRotacion[];
  updatedAt: string;
}

/** Volumen de ventas agregado por mes. */
export interface MesVentas {
  anio: number;
  mes: number;
  /** Etiqueta legible, p. ej. "ago 2026". */
  etiqueta: string;
  total: number;
}

/** Respuesta de `GET /dashboard/ventas-mensuales`. */
export interface VentasMensualesData {
  mesesConsiderados: number;
  totalPeriodo: number;
  meses: MesVentas[];
  updatedAt: string;
}
