import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { useAuth } from "@/features/auth/context/AuthContext";
import { normalizarRol } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { esGrupo, navegacionVisible, type NavGroup, type NavLink } from "./navigation";

const ITEM_BASE =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring";
const ITEM_ACTIVO = "bg-sidebar-primary text-sidebar-primary-foreground";
const ITEM_INACTIVO =
  "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

interface SidebarNavProps {
  onNavigate: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const location = useLocation();
  const { user } = useAuth();

  const entradas = useMemo(
    () => navegacionVisible(normalizarRol(user?.role)),
    [user?.role]
  );

  // Solo guarda los grupos que el usuario abrió o cerró a mano; el resto sigue
  // el estado natural (abierto si contiene la ruta activa).
  const [alternados, setAlternados] = useState<Record<string, boolean>>({});

  const rutaActiva = (to: string) => location.pathname === to;
  const grupoContieneRutaActiva = (grupo: NavGroup) =>
    grupo.items.some((item) => location.pathname.startsWith(item.to));

  const enlace = (item: NavLink, anidado = false) => {
    const activo = rutaActiva(item.to);
    const Icon = item.icon;

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        aria-current={activo ? "page" : undefined}
        className={cn(
          ITEM_BASE,
          anidado && "py-2 text-[13px]",
          activo ? ITEM_ACTIVO : ITEM_INACTIVO
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  };

  const grupo = (entrada: NavGroup) => {
    const abierto = alternados[entrada.id] ?? grupoContieneRutaActiva(entrada);
    const Icon = entrada.icon;
    const listaId = `nav-grupo-${entrada.id}`;

    return (
      <div key={entrada.id}>
        <button
          type="button"
          onClick={() =>
            setAlternados((actual) => ({ ...actual, [entrada.id]: !abierto }))
          }
          aria-expanded={abierto}
          aria-controls={listaId}
          className={cn(ITEM_BASE, "w-full", ITEM_INACTIVO)}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{entrada.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              abierto && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {abierto ? (
          <div
            id={listaId}
            className="mt-0.5 ml-4 space-y-0.5 border-l border-sidebar-border pl-3"
          >
            {entrada.items.map((item) => enlace(item, true))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <nav className="flex-1 space-y-0.5 px-3" aria-label="Navegación principal">
      {entradas.map((entrada) =>
        esGrupo(entrada) ? grupo(entrada) : enlace(entrada)
      )}
    </nav>
  );
}
