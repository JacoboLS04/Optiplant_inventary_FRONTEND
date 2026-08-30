import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Estado vivido en la query string. Se usa para que otras partes de la app
 * (buscador global, acciones rápidas) puedan enlazar directo a un módulo con
 * una búsqueda aplicada o con un diálogo abierto, sin acoplarse a su estado
 * interno. Las escrituras reemplazan la entrada del historial para no llenar
 * el botón "atrás" con cada tecla.
 */
function useParametro(
  clave: string
): [string | null, (valor: string | null) => void] {
  const [parametros, setParametros] = useSearchParams();

  const asignar = useCallback(
    (valor: string | null) => {
      setParametros(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          if (valor === null || valor === "") {
            siguientes.delete(clave);
          } else {
            siguientes.set(clave, valor);
          }
          return siguientes;
        },
        { replace: true }
      );
    },
    [clave, setParametros]
  );

  return [parametros.get(clave), asignar];
}

/** Texto libre en la URL (por ejemplo `?buscar=rosa`). */
export function useTextoUrl(clave: string): [string, (valor: string) => void] {
  const [valor, asignar] = useParametro(clave);
  return [valor ?? "", asignar];
}

/** Bandera booleana en la URL (por ejemplo `?nuevo=1`). */
export function useBanderaUrl(clave: string): [boolean, (valor: boolean) => void] {
  const [valor, asignar] = useParametro(clave);

  const asignarBandera = useCallback(
    (activa: boolean) => asignar(activa ? "1" : null),
    [asignar]
  );

  return [valor === "1", asignarBandera];
}

/** Valor de un conjunto cerrado, con respaldo cuando la URL trae algo inválido. */
export function useOpcionUrl<T extends string>(
  clave: string,
  opciones: readonly T[],
  respaldo: T
): [T, (valor: T) => void] {
  const [valor, asignar] = useParametro(clave);
  const actual = opciones.find((opcion) => opcion === valor) ?? respaldo;

  const asignarOpcion = useCallback(
    (siguiente: T) => asignar(siguiente === respaldo ? null : siguiente),
    [asignar, respaldo]
  );

  return [actual, asignarOpcion];
}
