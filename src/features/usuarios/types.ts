import type { Rol } from "@/lib/roles";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  sucursalId: string | null;
  sucursalNombre: string | null;
  activo: boolean;
}

/** Respuesta paginada normalizada de `GET /v1/usuarios`. */
export interface PaginaUsuarios {
  usuarios: Usuario[];
  /** Página actual tal como la numera el backend (base 0). */
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface FiltrosUsuarios {
  /** Base 0, igual que el parámetro `page` del backend. */
  page: number;
  size: number;
  rol?: Rol;
  activo?: boolean;
  /** El backend expone el filtro de texto como `busqueda`, no como `nombre`. */
  busqueda?: string;
}

export interface CrearUsuarioPayload {
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
  /** Obligatorio para GERENTE/OPERADOR; se omite para ADMINISTRADOR. */
  sucursalId?: string;
}

export interface ActualizarUsuarioPayload {
  nombre: string;
  rol: Rol;
  sucursalId?: string;
  /** Se omite cuando no se quiere cambiar la contraseña. */
  password?: string;
}
