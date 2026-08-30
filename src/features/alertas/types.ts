import type { EstadoStock } from "@/features/inventario/types";

/** Producto de una sucursal cuyo stock está por debajo del mínimo definido. */
export interface AlertaStock {
  existenciaId: string;
  productoId: string;
  sku: string;
  nombre: string;
  sucursalId: string;
  sucursal: string;
  stock: number;
  stockMinimo: number;
  estado: Extract<EstadoStock, "agotado" | "critico" | "bajo">;
}
