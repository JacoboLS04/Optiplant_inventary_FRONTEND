/** Estado de una orden de compra. Internamente el frontend usa minúsculas;
 *  el backend trabaja con el mismo conjunto en mayúsculas (BORRADOR, ENVIADA,
 *  CONFIRMADA, EN_TRANSITO, RECIBIDA, CANCELADA) y se mapea en la capa de API. */
export type EstadoOrdenCompra =
  | "borrador"
  | "enviada"
  | "confirmada"
  | "en_transito"
  | "recibida"
  | "cancelada";

/** Línea de una orden, conforme al `LineaResponse` del backend. */
export interface ItemOrdenCompra {
  /** id de la línea en el backend (se usa para recepciones). */
  lineaId: string;
  productoId: string;
  sku: string;
  nombre: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadPendiente: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

/** Orden de compra, conforme al `OrdenCompraResponse` del backend. */
export interface OrdenCompra {
  id: string;
  codigo: string;
  proveedorId: string;
  proveedor: string;
  sucursalDestinoId: string;
  sucursalDestino: string;
  usuarioId?: string;
  nombreUsuario?: string;
  estado: EstadoOrdenCompra;
  fechaEmision: string;
  fechaEntregaEstimada?: string;
  transportista?: string;
  guia?: string;
  condicionesPago?: string;
  /** Nota de seguimiento del transportador (el backend no lo expone; se reserva). */
  seguimiento?: string;
  items: ItemOrdenCompra[];
  total: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  condicionesGenerales?: string;
}

/** Cuerpo para crear una orden (POST /ordenes-compra). */
export interface NuevaOrdenCompraPayload {
  proveedorId: string;
  sucursalDestinoId: string;
  fechaEntregaEstimada?: string;
  transportista?: string;
  guia?: string;
  condicionesPago?: string;
  lineas: {
    productoId: string;
    cantidadOrdenada: number;
    precioUnitario: number;
    descuento: number;
  }[];
}

/** Línea de recepción: cantidad a recibir de una línea ya existente. */
export interface RecepcionLinea {
  lineaId: string;
  cantidadRecibida: number;
}
