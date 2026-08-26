export type EstadoTransferencia = "borrador" | "en_transito" | "recibida";

/** Producto con existencia en la sucursal de origen, disponible para transferir. */
export interface ProductoDisponible {
  productoId: string;
  sku: string;
  nombre: string;
  categoria: string;
  stockDisponible: number;
}

export interface ItemTransferencia {
  productoId: string;
  sku: string;
  nombre: string;
  stockDisponible: number;
  cantidad: number;
}

/** Campos del formulario de creación (paso 1 del asistente). */
export interface TransferenciaFormValues {
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  fechaEnvio: string;
  responsable: string;
  transportador: string;
  observaciones: string;
}

export interface NuevaTransferenciaPayload {
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  fechaEnvio: string;
  responsable: string;
  transportador: string;
  observaciones: string;
  items: Array<{ productoId: string; cantidad: number }>;
}

export interface Transferencia {
  id: string;
  codigo: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  estado: EstadoTransferencia;
  fechaEnvio: string;
  responsable: string;
  totalUnidades: number;
}
