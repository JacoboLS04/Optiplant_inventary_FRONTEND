export type EstadoTransferencia =
  | "SOLICITADA"
  | "RECHAZADA"
  | "APROBADA"
  | "EN_PREPARACION"
  | "EN_TRANSITO"
  | "RECIBIDA"
  | "CON_FALTANTES"
  | "CANCELADA";

export type UrgenciaTransferencia = "BAJA" | "NORMAL" | "ALTA" | "CRITICA";
export type RolAprobacion = "ORIGEN" | "DESTINO";
export type DecisionAprobacion = "APROBADO" | "RECHAZADO";
export type TratamientoFaltante = "REENVIO" | "AJUSTE" | "RECLAMACION";

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

export interface Faltante {
  id: string;
  productoId: string;
  nombreProducto: string;
  cantidadFaltante: number;
  tratamiento: TratamientoFaltante;
}

export interface LineaTransferencia {
  id: string;
  productoId: string;
  sku: string;
  nombreProducto: string;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadRecibida: number;
  cantidadDisponibleOrigen: number;
  faltantes: Faltante[];
}

export interface Aprobacion {
  id: string;
  gerenteId: string;
  nombreGerente: string;
  rolAprobacion: RolAprobacion;
  decision: DecisionAprobacion;
  fecha: string;
  observacion: string;
}

export interface Transferencia {
  id: string;
  codigo: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  nombreSucursalOrigen: string;
  nombreSucursalDestino: string;
  usuarioSolicitanteId: string;
  nombreUsuarioSolicitante: string;
  urgencia: UrgenciaTransferencia;
  transportista: string;
  guia: string;
  fechaEstimadaLlegada: string;
  estado: EstadoTransferencia;
  fechaSolicitud: string;
  fechaDespacho: string;
  fechaRecepcion: string;
  totalUnidades: number;
  lineas: LineaTransferencia[];
  aprobaciones: Aprobacion[];
}

export interface FiltrosTransferencias {
  sucursalOrigenId?: string;
  sucursalDestinoId?: string;
  estado?: EstadoTransferencia;
  busqueda?: string;
}
