export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string | null;
  activa: boolean;
}

/** Filtro de texto para buscar sucursales por nombre. */
export interface FiltrosSucursales {
  nombre: string;
}

export interface CrearSucursalPayload {
  nombre: string;
  direccion?: string;
}

export interface ActualizarSucursalPayload {
  nombre: string;
  direccion?: string;
}
