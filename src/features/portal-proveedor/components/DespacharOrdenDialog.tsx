import { useState } from "react";
import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrdenCompra } from "@/features/compras/types";
import { useDespacharOrden } from "../hooks/usePortal";

interface DespacharOrdenDialogProps {
  orden: OrdenCompra;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DespacharOrdenDialog({
  orden,
  open,
  onOpenChange,
}: DespacharOrdenDialogProps) {
  const despachar = useDespacharOrden();

  const [transportista, setTransportista] = useState(
    orden.transportista ?? "Transportes OptiPlant"
  );
  const [guia, setGuia] = useState(orden.guia ?? "");
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState(
    orden.fechaEntregaEstimada ?? ""
  );

  const onSubmit = async () => {
    await despachar.mutateAsync({
      id: orden.id,
      payload: {
        transportista: transportista || undefined,
        guia: guia || undefined,
        fechaEntregaEstimada: fechaEntregaEstimada || undefined,
      },
    });
    toast.success("Pedido despachado", {
      description: `${orden.codigo} quedó «En tránsito» con ${guia || "guía sin registrar"}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Despachar pedido · {orden.codigo}</DialogTitle>
          <DialogDescription>
            Confirma que el pedido salió hacia {orden.sucursalDestino}. Con esto
            queda «En tránsito» y la sucursal podrá registrarlo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="transportista">Transportista</Label>
            <Input
              id="transportista"
              value={transportista}
              onChange={(e) => setTransportista(e.target.value)}
              placeholder="Ej. Rutas del Norte"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guia">N° guía de remisión</Label>
            <Input
              id="guia"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              placeholder="Ej. G-2041"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fechaEntrega">
              Nueva fecha estimada de entrega (opcional)
            </Label>
            <Input
              id="fechaEntrega"
              type="date"
              value={fechaEntregaEstimada}
              onChange={(e) => setFechaEntregaEstimada(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={despachar.isPending}
          >
            {despachar.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Despachando…
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" aria-hidden="true" />
                Confirmar despacho
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}