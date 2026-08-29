export const ROLES = ["ADMINISTRADOR", "GERENTE", "OPERADOR"] as const;

export type Rol = (typeof ROLES)[number];

export const ROL_LABEL: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  GERENTE: "Gerente",
  OPERADOR: "Operador",
};

/** Los roles distintos de administrador siempre pertenecen a una sucursal. */
export function requiereSucursal(rol: Rol | ""): boolean {
  return rol === "GERENTE" || rol === "OPERADOR";
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
