export type EstadoOrdenCompra =
  | "borrador"
  | "enviada"
  | "en_transito"
  | "recibida"
  | "cancelada";

export interface ItemOrdenCompra {
  sku: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenCompra {
  id: string;
  codigo: string;
  proveedor: string;
  sucursalDestinoId: string;
  sucursalDestino: string;
  estado: EstadoOrdenCompra;
  fechaEmision: string;
  fechaEntregaEstimada: string;
  /** Nota de seguimiento del transportador, si la orden ya fue despachada. */
  seguimiento?: string;
  items: ItemOrdenCompra[];
  total: number;
}
