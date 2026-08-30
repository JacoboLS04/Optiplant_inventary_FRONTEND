import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ClipboardList,
  Loader2,
  Package,
  Search,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  esGrupo,
  navegacionVisible,
  type NavLink,
} from "@/components/layout/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { normalizarRol } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { MINIMO_CARACTERES, useBusquedaGlobal } from "../hooks/useBusquedaGlobal";
import {
  ETIQUETA_GRUPO,
  ORDEN_GRUPOS,
  type ResultadoBusqueda,
  type TipoResultado,
} from "../types";

const ICONO_POR_TIPO: Record<TipoResultado, LucideIcon> = {
  navegacion: Search,
  producto: Package,
  venta: TrendingUp,
  transferencia: ArrowLeftRight,
  orden: ClipboardList,
  usuario: Users,
};

type ResultadoConIcono = ResultadoBusqueda & { icono: LucideIcon };

interface BuscadorGlobalProps {
  onNavigate?: () => void;
}

/** Campo del sidebar que abre la paleta de búsqueda (también con Ctrl/⌘ + K). */
export function BuscadorGlobal({ onNavigate }: BuscadorGlobalProps) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key.toLowerCase() === "k" && (evento.metaKey || evento.ctrlKey)) {
        evento.preventDefault();
        setAbierto((previo) => !previo);
      }
    };

    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="relative flex h-9 w-full items-center gap-2 rounded-lg bg-white/10 pr-2 pl-9 text-sm text-sidebar-foreground/40 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4"
          aria-hidden="true"
        />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="hidden rounded border border-sidebar-border px-1.5 py-0.5 font-sans text-[10px] text-sidebar-foreground/40 lg:inline">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        {/* El contenido se monta al abrir para empezar siempre en blanco. */}
        {abierto ? (
          <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 [&>button]:hidden">
            <DialogTitle className="sr-only">Búsqueda global</DialogTitle>
            <PaletaBusqueda
              onCerrar={() => setAbierto(false)}
              onNavigate={onNavigate}
            />
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}

interface PaletaBusquedaProps {
  onCerrar: () => void;
  onNavigate?: () => void;
}

function PaletaBusqueda({ onCerrar, onNavigate }: PaletaBusquedaProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [termino, setTermino] = useState("");
  const [claveActiva, setClaveActiva] = useState<string | null>(null);

  const terminoLimpio = termino.trim();
  const terminoDiferido = useDebouncedValue(terminoLimpio, 300);
  const consulta = useBusquedaGlobal(terminoDiferido);

  const rol = normalizarRol(user?.role);

  const resultadosNavegacion = useMemo<ResultadoConIcono[]>(() => {
    const filtro = terminoLimpio.toLowerCase();
    if (filtro.length === 0) return [];

    const enlaces: NavLink[] = navegacionVisible(rol).flatMap((entrada) =>
      esGrupo(entrada) ? entrada.items : [entrada]
    );

    return enlaces
      .filter((enlace) => enlace.label.toLowerCase().includes(filtro))
      .map((enlace) => ({
        clave: `navegacion-${enlace.to}`,
        tipo: "navegacion" as const,
        titulo: enlace.label,
        subtitulo: enlace.to,
        destino: enlace.to,
        icono: enlace.icon,
      }));
  }, [rol, terminoLimpio]);

  const resultados = useMemo<ResultadoConIcono[]>(() => {
    const remotos: ResultadoConIcono[] = (consulta.data ?? []).map(
      (resultado) => ({
        ...resultado,
        icono: ICONO_POR_TIPO[resultado.tipo],
      })
    );

    const todos = [...resultadosNavegacion, ...remotos];

    return ORDEN_GRUPOS.flatMap((tipo) =>
      todos.filter((resultado) => resultado.tipo === tipo)
    );
  }, [consulta.data, resultadosNavegacion]);

  const indiceActivo = Math.max(
    0,
    resultados.findIndex((resultado) => resultado.clave === claveActiva)
  );

  const abrir = (resultado: ResultadoConIcono) => {
    onCerrar();
    onNavigate?.();
    navigate(resultado.destino);
  };

  const alTeclear = (evento: React.KeyboardEvent) => {
    if (resultados.length === 0) return;

    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      const salto = evento.key === "ArrowDown" ? 1 : -1;
      const siguiente =
        (indiceActivo + salto + resultados.length) % resultados.length;
      setClaveActiva(resultados[siguiente].clave);
      return;
    }

    if (evento.key === "Enter") {
      evento.preventDefault();
      abrir(resultados[indiceActivo]);
    }
  };

  const buscando = consulta.isFetching && terminoDiferido.length >= MINIMO_CARACTERES;
  const sinResultados =
    terminoDiferido.length >= MINIMO_CARACTERES &&
    !consulta.isFetching &&
    resultados.length === 0;

  let indiceGlobal = -1;

  return (
    <div>
      <div className="relative border-b">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          autoFocus
          type="text"
          value={termino}
          onChange={(evento) => {
            setTermino(evento.target.value);
            setClaveActiva(null);
          }}
          onKeyDown={alTeclear}
          placeholder="Buscar productos, ventas, transferencias, órdenes…"
          aria-label="Buscar en toda la aplicación"
          className="h-14 w-full bg-transparent pr-12 pl-11 text-sm outline-none placeholder:text-muted-foreground"
        />
        {buscando ? (
          <Loader2
            className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="max-h-[22rem] overflow-y-auto p-2">
        {terminoLimpio.length < MINIMO_CARACTERES ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Escribe al menos {MINIMO_CARACTERES} caracteres para buscar en
            productos, ventas, transferencias y órdenes de compra.
          </p>
        ) : sinResultados ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Sin coincidencias para «{terminoDiferido}».
          </p>
        ) : (
          ORDEN_GRUPOS.map((tipo) => {
            const grupo = resultados.filter(
              (resultado) => resultado.tipo === tipo
            );
            if (grupo.length === 0) return null;

            return (
              <div key={tipo} className="mb-1 last:mb-0">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {ETIQUETA_GRUPO[tipo]}
                </p>
                <ul>
                  {grupo.map((resultado) => {
                    indiceGlobal += 1;
                    const activo = indiceGlobal === indiceActivo;

                    return (
                      <li key={resultado.clave}>
                        <button
                          type="button"
                          onClick={() => abrir(resultado)}
                          onMouseEnter={() => setClaveActiva(resultado.clave)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                            activo ? "bg-accent" : "hover:bg-accent/60"
                          )}
                        >
                          <resultado.icono
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {resultado.titulo}
                            </span>
                            {resultado.subtitulo ? (
                              <span className="block truncate text-xs text-muted-foreground">
                                {resultado.subtitulo}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span>↑ ↓ para navegar · Enter para abrir</span>
        <span>Esc para cerrar</span>
      </div>
    </div>
  );
}
