export interface ProductoVenta {
  productoId: string;
  sku: string;
  nombre: string;
  categoriaId: string;
  categoria: string;
  sucursalId: string;
  sucursal: string;
  precioUnitario: number;
  stockDisponible: number;
}

export interface LineaVenta {
  productoId: string;
  sku: string;
  nombre: string;
  sucursalId: string;
  sucursal: string;
  precioUnitario: number;
  stockDisponible: number;
  cantidad: number;
}

export interface NuevaVentaPayload {
  sucursalId: string;
  descuentoPorcentaje: number;
  lineas: Array<{ productoId: string; cantidad: number }>;
}

export interface Venta {
  id: string;
  codigo: string;
  sucursalId: string;
  total: number;
  unidades: number;
  fecha: string;
}
