import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  Building2,
  ClipboardList,
  PackagePlus,
  ShoppingCart,
  UserPlus,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/context/AuthContext";
import { normalizarRol, type Rol } from "@/lib/roles";

interface AccionRapida {
  label: string;
  icon: LucideIcon;
  /** Destino con el parámetro que abre el diálogo de creación del módulo. */
  to: string;
  roles?: Rol[];
}

const ACCIONES: AccionRapida[] = [
  { label: "Nuevo producto", icon: PackagePlus, to: "/inventario?nuevo=1" },
  { label: "Registrar venta", icon: ShoppingCart, to: "/ventas?vista=nueva" },
  { label: "Nueva orden de compra", icon: ClipboardList, to: "/compras?nuevo=1" },
  { label: "Nueva transferencia", icon: ArrowUpDown, to: "/transferencias?nuevo=1" },
  {
    label: "Nuevo usuario",
    icon: UserPlus,
    to: "/administracion/usuarios?nuevo=1",
    roles: ["ADMINISTRADOR"],
  },
  {
    label: "Nueva sucursal",
    icon: Building2,
    to: "/administracion/sucursales?nuevo=1",
    roles: ["ADMINISTRADOR"],
  },
];

interface AccionesRapidasProps {
  onNavigate?: () => void;
}

export function AccionesRapidas({ onNavigate }: AccionesRapidasProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rol = normalizarRol(user?.role);

  const acciones = useMemo(
    () => ACCIONES.filter((accion) => !accion.roles || (rol && accion.roles.includes(rol))),
    [rol]
  );

  const ir = (to: string) => {
    onNavigate?.();
    navigate(to);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-white/8 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-white/10 data-[state=open]:text-sidebar-foreground"
        aria-label="Acciones rápidas"
      >
        <Zap className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Acciones rápidas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {acciones.map((accion) => (
          <DropdownMenuItem key={accion.to} onSelect={() => ir(accion.to)}>
            <accion.icon aria-hidden="true" />
            {accion.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
