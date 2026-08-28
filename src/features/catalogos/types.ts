export interface Sucursal {
  id: string;
  nombre: string;
  tipo?: "bodega" | "sucursal";
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface UnidadMedida {
  id: string;
  nombre: string;
}
