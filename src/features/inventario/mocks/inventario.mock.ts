import { resolverEstadoStock } from "../lib/estado-stock";
import type { Producto } from "../types";

/**
 * Almacén en memoria que simula las tablas `Producto`/`Existencia` del backend.
 * Es mutable a propósito: las mutaciones de `api/` escriben aquí para que la UI
 * se comporte como lo hará contra Spring Boot. Se elimina al conectar el API.
 */

type Seed = [
  sku: string,
  nombre: string,
  categoriaId: string,
  categoria: string,
  sucursalId: string,
  sucursal: string,
  stock: number,
  stockMinimo: number,
  precioUnitario: number,
  horasDesdeActualizacion: number,
];

const SEEDS: Seed[] = [
  ["FRT-1525", "Fertilizante triple 15 — 25 kg", "CAT-01", "Fertilizantes", "SUC-01", "Bodega central", 820, 200, 118_000, 2],
  ["FRT-0840", "Abono orgánico compostado — 40 kg", "CAT-01", "Fertilizantes", "SUC-01", "Bodega central", 1_240, 300, 74_500, 5],
  ["FRT-1010", "Fertilizante foliar líquido — 5 L", "CAT-01", "Fertilizantes", "SUC-02", "Sucursal norte", 96, 120, 62_300, 9],
  ["FRT-2020", "Urea granulada — 50 kg", "CAT-01", "Fertilizantes", "SUC-04", "Sucursal este", 6, 40, 156_000, 1],
  ["FRT-0330", "Humus de lombriz — 20 kg", "CAT-01", "Fertilizantes", "SUC-03", "Sucursal sur", 310, 90, 48_900, 26],
  ["SUS-0050", "Sustrato universal — 50 L", "CAT-02", "Sustratos", "SUC-01", "Bodega central", 640, 180, 38_400, 3],
  ["SUS-0025", "Sustrato para semilleros — 25 L", "CAT-02", "Sustratos", "SUC-02", "Sucursal norte", 208, 80, 24_100, 14],
  ["SUS-0080", "Turba rubia — 80 L", "CAT-02", "Sustratos", "SUC-04", "Sucursal este", 14, 60, 96_700, 4],
  ["SUS-0100", "Fibra de coco prensada — 5 kg", "CAT-02", "Sustratos", "SUC-03", "Sucursal sur", 174, 70, 31_800, 33],
  ["HER-0912", "Tijera de podar profesional", "CAT-03", "Herramientas", "SUC-01", "Bodega central", 152, 50, 89_900, 6],
  ["HER-0330", "Maceta plástica 30 cm", "CAT-03", "Herramientas", "SUC-02", "Sucursal norte", 940, 250, 12_400, 11],
  ["HER-0445", "Pala de jardinería mango largo", "CAT-03", "Herramientas", "SUC-03", "Sucursal sur", 78, 40, 54_200, 20],
  ["HER-0501", "Guantes de nitrilo — par", "CAT-03", "Herramientas", "SUC-04", "Sucursal este", 0, 100, 18_600, 30],
  ["HER-0620", "Carretilla reforzada 90 L", "CAT-03", "Herramientas", "SUC-01", "Bodega central", 42, 15, 389_000, 48],
  ["HER-0710", "Rastrillo metálico 14 dientes", "CAT-03", "Herramientas", "SUC-02", "Sucursal norte", 63, 30, 42_700, 52],
  ["SEM-0301", "Semilla de césped kikuyo — 1 kg", "CAT-04", "Semillas", "SUC-02", "Sucursal norte", 28, 45, 71_200, 8],
  ["SEM-0410", "Semilla de tomate chonto — 100 g", "CAT-04", "Semillas", "SUC-01", "Bodega central", 386, 100, 34_500, 12],
  ["SEM-0520", "Semilla de lechuga crespa — 100 g", "CAT-04", "Semillas", "SUC-03", "Sucursal sur", 254, 80, 29_800, 19],
  ["SEM-0630", "Semilla de cilantro — 500 g", "CAT-04", "Semillas", "SUC-04", "Sucursal este", 118, 60, 22_400, 40],
  ["RIE-0450", "Manguera reforzada 1/2 — 50 m", "CAT-05", "Riego", "SUC-04", "Sucursal este", 22, 35, 168_000, 22],
  ["RIE-0120", "Aspersor sectorial ajustable", "CAT-05", "Riego", "SUC-01", "Bodega central", 412, 120, 26_900, 7],
  ["RIE-0210", "Goteo autocompensado — 100 m", "CAT-05", "Riego", "SUC-02", "Sucursal norte", 96, 50, 143_500, 28],
  ["RIE-0340", "Temporizador de riego digital", "CAT-05", "Riego", "SUC-03", "Sucursal sur", 57, 25, 214_000, 44],
  ["RIE-0480", "Bomba de presión 1 HP", "CAT-05", "Riego", "SUC-01", "Bodega central", 31, 10, 892_000, 60],
];

export const productosStore: Producto[] = SEEDS.map(
  (
    [
      sku,
      nombre,
      categoriaId,
      categoria,
      sucursalId,
      sucursal,
      stock,
      stockMinimo,
      precioUnitario,
      horas,
    ],
    index
  ) => ({
    id: `PRD-${String(index + 1).padStart(3, "0")}`,
    sku,
    nombre,
    descripcion: "",
    categoriaId,
    categoria,
    sucursalId,
    sucursal,
    stock,
    stockMinimo,
    precioUnitario,
    estado: resolverEstadoStock(stock, stockMinimo),
    activo: true,
    actualizadoEn: new Date(Date.now() - horas * 3_600_000).toISOString(),
  })
);
