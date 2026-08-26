import type { Categoria, Sucursal } from "../types";

/** Catálogos base compartidos por inventario, compras, ventas y transferencias. */

export const sucursalesMock: Sucursal[] = [
  { id: "SUC-01", nombre: "Bodega central", tipo: "bodega" },
  { id: "SUC-02", nombre: "Sucursal norte", tipo: "sucursal" },
  { id: "SUC-03", nombre: "Sucursal sur", tipo: "sucursal" },
  { id: "SUC-04", nombre: "Sucursal este", tipo: "sucursal" },
];

export const categoriasMock: Categoria[] = [
  { id: "CAT-01", nombre: "Fertilizantes" },
  { id: "CAT-02", nombre: "Sustratos" },
  { id: "CAT-03", nombre: "Herramientas" },
  { id: "CAT-04", nombre: "Semillas" },
  { id: "CAT-05", nombre: "Riego" },
];
