export const ROLES = ["ADMINISTRADOR", "GERENTE", "OPERADOR", "PROVEEDOR"] as const;

export type Rol = (typeof ROLES)[number];

export const ROL_LABEL: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  GERENTE: "Gerente",
  OPERADOR: "Operador",
  PROVEEDOR: "Proveedor",
};

/**
 * Los roles internos (Gerente/Operador) siempre pertenecen a una sucursal.
 * El PROVEEDOR no; se vincula a su proveedor y trabaja desde su portal.
 */
export function requiereSucursal(rol: Rol | ""): boolean {
  return rol === "GERENTE" || rol === "OPERADOR";
}

export function esProveedor(valor?: string | null): boolean {
  return normalizarRol(valor) === "PROVEEDOR";
}

/**
 * Normaliza el rol que llega en el token/sesión. Tolera el prefijo `ROLE_`
 * de Spring Security y diferencias de mayúsculas.
 */
export function normalizarRol(valor?: string | null): Rol | null {
  if (!valor) return null;

  const limpio = valor.trim().toUpperCase().replace(/^ROLE_/, "");
  return ROLES.find((rol) => rol === limpio) ?? null;
}

export function esAdministrador(valor?: string | null): boolean {
  return normalizarRol(valor) === "ADMINISTRADOR";
}
