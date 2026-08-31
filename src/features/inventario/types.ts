export type EstadoStock = "disponible" | "bajo" | "critico" | "agotado";

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  categoriaId: string;
  categoria: string;
  sucursalId: string;
  sucursal: string;
  stock: number;
  stockMinimo: number;
  precioUnitario: number;
  estado: EstadoStock;
  activo: boolean;
  actualizadoEn: string;
}

export type TipoAjuste = "entrada" | "salida" | "merma";

export interface AjusteStockPayload {
  productoId: string;
  tipo: TipoAjuste;
  cantidad: number;
  motivo: string;
}

export interface NuevoProductoPayload {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  sucursalId: string;
  stock: number;
  stockMinimo: number;
  precioUnitario: number;
}

export interface ProductoActualizacionPayload {
  id: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  precioUnitario: number;
  stockMinimo: number;
}
