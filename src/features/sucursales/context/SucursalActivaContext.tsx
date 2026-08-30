import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Sucursal sobre la que está trabajando el usuario. El selector del sidebar la
 * fija y los módulos que sí pueden filtrar por sucursal en el backend la
 * consumen (inventario, ventas y compras). El dashboard queda fuera: sus
 * endpoints devuelven agregados de toda la red y no aceptan filtro.
 */

export const TODAS_LAS_SUCURSALES = "todas";

const CLAVE_ALMACENAMIENTO = "optiplant:sucursal-activa";

interface SucursalActivaContextType {
  /** Id de la sucursal activa o `"todas"`. */
  sucursalId: string;
  /** `undefined` cuando no hay sucursal concreta, listo para query params. */
  sucursalIdFiltro: string | undefined;
  esTodas: boolean;
  setSucursalId: (sucursalId: string) => void;
}

const SucursalActivaContext = createContext<SucursalActivaContextType | null>(
  null
);

function leerSucursalGuardada(): string {
  try {
    return localStorage.getItem(CLAVE_ALMACENAMIENTO) ?? TODAS_LAS_SUCURSALES;
  } catch {
    return TODAS_LAS_SUCURSALES;
  }
}

export function SucursalActivaProvider({ children }: { children: ReactNode }) {
  const [sucursalId, setSucursalIdInterno] = useState<string>(
    leerSucursalGuardada
  );

  const setSucursalId = useCallback((siguiente: string) => {
    setSucursalIdInterno(siguiente);
    try {
      if (siguiente === TODAS_LAS_SUCURSALES) {
        localStorage.removeItem(CLAVE_ALMACENAMIENTO);
      } else {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, siguiente);
      }
    } catch {
      // Sin persistencia la selección sigue viva en memoria.
    }
  }, []);

  const valor = useMemo<SucursalActivaContextType>(() => {
    const esTodas = sucursalId === TODAS_LAS_SUCURSALES;
    return {
      sucursalId,
      sucursalIdFiltro: esTodas ? undefined : sucursalId,
      esTodas,
      setSucursalId,
    };
  }, [sucursalId, setSucursalId]);

  return (
    <SucursalActivaContext.Provider value={valor}>
      {children}
    </SucursalActivaContext.Provider>
  );
}

export function useSucursalActiva() {
  const contexto = useContext(SucursalActivaContext);
  if (!contexto) {
    throw new Error(
      "useSucursalActiva debe usarse dentro de un SucursalActivaProvider"
    );
  }
  return contexto;
}
