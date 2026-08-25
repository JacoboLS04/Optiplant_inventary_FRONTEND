import type {
  BranchNetworkData,
  InventoryMovement,
  InventorySummaryData,
} from "../types";

/**
 * Datos de ejemplo mientras no hay backend conectado. Cada constante replica la
 * forma exacta de la respuesta esperada del API, de modo que sustituirlas por
 * llamadas reales solo implique cambiar el cuerpo de `dashboard.api.ts`.
 */

const REFERENCE_DATE = new Date();

function hoursAgo(hours: number): string {
  return new Date(REFERENCE_DATE.getTime() - hours * 3_600_000).toISOString();
}

export const inventorySummaryMock: InventorySummaryData = {
  summary: {
    totalValue: 284_350_000,
    totalUnits: 18_642,
    skuCount: 412,
    branchCount: 4,
    inflowValue30d: 64_120_000,
    outflowValue30d: 34_780_000,
    changePercent: 8.4,
    updatedAt: hoursAgo(0.2),
  },
  distribution: [
    { category: "Fertilizantes", units: 6_240, value: 98_400_000 },
    { category: "Sustratos", units: 4_810, value: 62_150_000 },
    { category: "Herramientas", units: 2_970, value: 54_900_000 },
    { category: "Semillas", units: 3_120, value: 41_300_000 },
    { category: "Riego", units: 1_502, value: 27_600_000 },
  ],
};

export const recentMovementsMock: InventoryMovement[] = [
  {
    id: "MOV-2481",
    product: "Fertilizante triple 15 — 25 kg",
    sku: "FRT-1525",
    type: "entrada",
    branch: "Bodega central",
    quantity: 320,
    date: hoursAgo(1.5),
  },
  {
    id: "MOV-2480",
    product: "Sustrato universal — 50 L",
    sku: "SUS-0050",
    type: "salida",
    branch: "Sucursal norte",
    quantity: -85,
    date: hoursAgo(3),
  },
  {
    id: "MOV-2479",
    product: "Tijera de podar profesional",
    sku: "HER-0912",
    type: "transferencia",
    branch: "Bodega central → Sucursal este",
    quantity: -40,
    date: hoursAgo(5.5),
  },
  {
    id: "MOV-2478",
    product: "Semilla de césped kikuyo — 1 kg",
    sku: "SEM-0301",
    type: "salida",
    branch: "Sucursal sur",
    quantity: -128,
    date: hoursAgo(9),
  },
  {
    id: "MOV-2477",
    product: "Manguera reforzada 1/2 — 50 m",
    sku: "RIE-0450",
    type: "ajuste",
    branch: "Sucursal este",
    quantity: -12,
    date: hoursAgo(22),
  },
  {
    id: "MOV-2476",
    product: "Abono orgánico compostado — 40 kg",
    sku: "FRT-0840",
    type: "entrada",
    branch: "Bodega central",
    quantity: 500,
    date: hoursAgo(27),
  },
  {
    id: "MOV-2475",
    product: "Maceta plástica 30 cm",
    sku: "HER-0330",
    type: "transferencia",
    branch: "Bodega central → Sucursal norte",
    quantity: -210,
    date: hoursAgo(31),
  },
];

export const branchNetworkMock: BranchNetworkData = {
  nodes: [
    {
      id: "SUC-01",
      name: "Bodega central",
      kind: "warehouse",
      status: "ok",
      units: 11_240,
      skuCount: 412,
      lowStockCount: 0,
      x: 50,
      y: 50,
    },
    {
      id: "SUC-02",
      name: "Sucursal norte",
      kind: "branch",
      status: "ok",
      units: 3_180,
      skuCount: 236,
      lowStockCount: 1,
      x: 18,
      y: 22,
    },
    {
      id: "SUC-03",
      name: "Sucursal sur",
      kind: "branch",
      status: "ok",
      units: 2_640,
      skuCount: 198,
      lowStockCount: 0,
      x: 18,
      y: 80,
    },
    {
      id: "SUC-04",
      name: "Sucursal este",
      kind: "branch",
      status: "critical",
      units: 1_582,
      skuCount: 154,
      lowStockCount: 3,
      x: 86,
      y: 42,
    },
  ],
  links: [
    { from: "SUC-02", to: "SUC-01", status: "ok" },
    { from: "SUC-03", to: "SUC-01", status: "ok" },
    { from: "SUC-01", to: "SUC-04", status: "critical" },
  ],
  alerts: [
    {
      id: "ALT-01",
      product: "Fertilizante triple 15 — 25 kg",
      branchId: "SUC-04",
      branchName: "Sucursal este",
      currentUnits: 6,
      minUnits: 40,
      severity: "critical",
    },
    {
      id: "ALT-02",
      product: "Sustrato universal — 50 L",
      branchId: "SUC-04",
      branchName: "Sucursal este",
      currentUnits: 14,
      minUnits: 60,
      severity: "critical",
    },
    {
      id: "ALT-03",
      product: "Manguera reforzada 1/2 — 50 m",
      branchId: "SUC-04",
      branchName: "Sucursal este",
      currentUnits: 22,
      minUnits: 35,
      severity: "low",
    },
    {
      id: "ALT-04",
      product: "Semilla de césped kikuyo — 1 kg",
      branchId: "SUC-02",
      branchName: "Sucursal norte",
      currentUnits: 28,
      minUnits: 45,
      severity: "low",
    },
  ],
  updatedAt: hoursAgo(0.05),
};
