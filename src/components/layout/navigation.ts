import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  Shield,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Rol } from "@/lib/roles";

export interface NavLink {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Si se omite, el ítem es visible para cualquier rol autenticado. */
  roles?: Rol[];
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  roles?: Rol[];
  items: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export function esGrupo(entrada: NavEntry): entrada is NavGroup {
  return "items" in entrada;
}

/**
 * Estructura del menú lateral. Para añadir una pantalla de administración
 * basta con agregar un `NavLink` a `items` del grupo correspondiente; para una
 * sección nueva, otro `NavGroup` con su propia lista de `roles`.
 */
export const navegacion: NavEntry[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventario", label: "Inventario", icon: Package },
  { to: "/compras", label: "Compras", icon: ShoppingCart },
  { to: "/ventas", label: "Ventas", icon: TrendingUp },
  { to: "/transferencias", label: "Transferencias", icon: ArrowLeftRight },
  {
    id: "administracion",
    label: "Administración",
    icon: Shield,
    roles: ["ADMINISTRADOR"],
    items: [
      { to: "/administracion/usuarios", label: "Usuarios", icon: Users },
      { to: "/administracion/sucursales", label: "Sucursales", icon: Store },
    ],
  },
];

function permitido(roles: Rol[] | undefined, rol: Rol | null): boolean {
  return !roles || (rol !== null && roles.includes(rol));
}

/** Menú filtrado por rol: lo no permitido no se renderiza en absoluto. */
export function navegacionVisible(rol: Rol | null): NavEntry[] {
  return navegacion
    .filter((entrada) => permitido(entrada.roles, rol))
    .map((entrada) =>
      esGrupo(entrada)
        ? {
            ...entrada,
            items: entrada.items.filter((item) => permitido(item.roles, rol)),
          }
        : entrada
    )
    .filter((entrada) => !esGrupo(entrada) || entrada.items.length > 0);
}
