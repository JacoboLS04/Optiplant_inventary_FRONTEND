import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

/**
 * Botón global de refresco: re-invalida todas las consultas activas de
 * react-query para traer los datos más recientes sin recargar el navegador.
 * Útil tras operar con otro usuario o cajero, o cuando otra sucursal movió
 * stock.
 */
export function RefreshButton() {
  const queryClient = useQueryClient();
  const [refrescando, setRefrescando] = useState(false);

  const refrescar = async () => {
    setRefrescando(true);
    try {
      await queryClient.invalidateQueries();
      toast.success("Datos actualizados");
    } catch {
      toast.error("No se pudieron actualizar los datos");
    } finally {
      setRefrescando(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void refrescar()}
      disabled={refrescando}
    >
      <RefreshCw
        className={`h-4 w-4 ${refrescando ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      Refrescar
    </Button>
  );
}
