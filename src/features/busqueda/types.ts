export type TipoResultado =
  | "navegacion"
  | "producto"
  | "venta"
  | "transferencia"
  | "orden"
  | "usuario";

export interface ResultadoBusqueda {
  clave: string;
  tipo: TipoResultado;
  titulo: string;
  subtitulo: string;
  /** Ruta con los parámetros que dejan el módulo filtrado por el resultado. */
  destino: string;
}

export const ORDEN_GRUPOS: TipoResultado[] = [
  "navegacion",
  "producto",
  "venta",
  "transferencia",
  "orden",
  "usuario",
];

export const ETIQUETA_GRUPO: Record<TipoResultado, string> = {
  navegacion: "Ir a",
  producto: "Productos",
  venta: "Ventas",
  transferencia: "Transferencias",
  orden: "Órdenes de compra",
  usuario: "Usuarios",
};
