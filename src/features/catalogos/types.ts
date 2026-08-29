export interface Sucursal {
  id: string;
  nombre: string;
  tipo?: "bodega" | "sucursal";
  direccion?: string;
  estado?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface UnidadMedida {
  id: string;
  nombre: string;
}
