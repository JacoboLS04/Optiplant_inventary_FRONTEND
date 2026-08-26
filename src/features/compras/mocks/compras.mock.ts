import type { ItemOrdenCompra, OrdenCompra } from "../types";

/** Datos de ejemplo con la forma exacta de la futura respuesta de `/ordenes-compra`. */

function diasDesdeHoy(dias: number): string {
  return new Date(Date.now() + dias * 86_400_000).toISOString();
}

function totalDe(items: ItemOrdenCompra[]): number {
  return items.reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0
  );
}

function crearOrden(
  orden: Omit<OrdenCompra, "total">
): OrdenCompra {
  return { ...orden, total: totalDe(orden.items) };
}

export const ordenesCompraStore: OrdenCompra[] = [
  crearOrden({
    id: "OC-001",
    codigo: "PO-001",
    proveedor: "Agroinsumos del Valle S.A.S.",
    sucursalDestinoId: "SUC-01",
    sucursalDestino: "Bodega central",
    estado: "en_transito",
    fechaEmision: diasDesdeHoy(-6),
    fechaEntregaEstimada: diasDesdeHoy(2),
    seguimiento: "Guía TCC 884512 — última actualización en Palmira",
    items: [
      { sku: "FRT-1525", nombre: "Fertilizante triple 15 — 25 kg", cantidad: 400, precioUnitario: 96_000 },
      { sku: "FRT-0840", nombre: "Abono orgánico compostado — 40 kg", cantidad: 250, precioUnitario: 58_000 },
    ],
  }),
  crearOrden({
    id: "OC-002",
    codigo: "PO-002",
    proveedor: "Sustratos Andinos Ltda.",
    sucursalDestinoId: "SUC-04",
    sucursalDestino: "Sucursal este",
    estado: "enviada",
    fechaEmision: diasDesdeHoy(-2),
    fechaEntregaEstimada: diasDesdeHoy(7),
    items: [
      { sku: "SUS-0080", nombre: "Turba rubia — 80 L", cantidad: 120, precioUnitario: 74_200 },
      { sku: "SUS-0050", nombre: "Sustrato universal — 50 L", cantidad: 300, precioUnitario: 29_500 },
    ],
  }),
  crearOrden({
    id: "OC-003",
    codigo: "PO-003",
    proveedor: "Herramientas Campo Verde",
    sucursalDestinoId: "SUC-02",
    sucursalDestino: "Sucursal norte",
    estado: "recibida",
    fechaEmision: diasDesdeHoy(-18),
    fechaEntregaEstimada: diasDesdeHoy(-9),
    seguimiento: "Entregada y verificada en muelle 2",
    items: [
      { sku: "HER-0330", nombre: "Maceta plástica 30 cm", cantidad: 800, precioUnitario: 8_900 },
      { sku: "HER-0710", nombre: "Rastrillo metálico 14 dientes", cantidad: 60, precioUnitario: 31_400 },
    ],
  }),
  crearOrden({
    id: "OC-004",
    codigo: "PO-004",
    proveedor: "Semillas Premium de Colombia",
    sucursalDestinoId: "SUC-01",
    sucursalDestino: "Bodega central",
    estado: "borrador",
    fechaEmision: diasDesdeHoy(-1),
    fechaEntregaEstimada: diasDesdeHoy(14),
    items: [
      { sku: "SEM-0410", nombre: "Semilla de tomate chonto — 100 g", cantidad: 500, precioUnitario: 24_800 },
    ],
  }),
  crearOrden({
    id: "OC-005",
    codigo: "PO-005",
    proveedor: "Riego Técnico Pacífico",
    sucursalDestinoId: "SUC-03",
    sucursalDestino: "Sucursal sur",
    estado: "en_transito",
    fechaEmision: diasDesdeHoy(-4),
    fechaEntregaEstimada: diasDesdeHoy(1),
    seguimiento: "Guía Envía 220417 — en reparto",
    items: [
      { sku: "RIE-0210", nombre: "Goteo autocompensado — 100 m", cantidad: 80, precioUnitario: 118_000 },
      { sku: "RIE-0120", nombre: "Aspersor sectorial ajustable", cantidad: 200, precioUnitario: 19_400 },
      { sku: "RIE-0340", nombre: "Temporizador de riego digital", cantidad: 25, precioUnitario: 178_000 },
    ],
  }),
  crearOrden({
    id: "OC-006",
    codigo: "PO-006",
    proveedor: "Agroinsumos del Valle S.A.S.",
    sucursalDestinoId: "SUC-04",
    sucursalDestino: "Sucursal este",
    estado: "cancelada",
    fechaEmision: diasDesdeHoy(-25),
    fechaEntregaEstimada: diasDesdeHoy(-12),
    seguimiento: "Cancelada por desabastecimiento del proveedor",
    items: [
      { sku: "FRT-2020", nombre: "Urea granulada — 50 kg", cantidad: 150, precioUnitario: 132_000 },
    ],
  }),
];
