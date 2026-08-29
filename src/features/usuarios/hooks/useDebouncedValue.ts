import { useEffect, useState } from "react";

/** Retrasa la propagación del valor para no consultar el API en cada tecla. */
export function useDebouncedValue<T>(valor: T, retrasoMs = 350): T {
  const [valorDiferido, setValorDiferido] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDiferido(valor), retrasoMs);
    return () => clearTimeout(temporizador);
  }, [valor, retrasoMs]);

  return valorDiferido;
}
