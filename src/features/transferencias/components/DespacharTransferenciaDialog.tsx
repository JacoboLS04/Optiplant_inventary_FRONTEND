import { useState } from "react";
import { PackageCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDespacharTransferencia } from "../hooks/useTransferencias";
import type { Transferencia } from "../types";

const TRANSPORTISTA_DEFECTO = "Transportes OptiPlant";

function generarGuia(codigo: string): string {
  const hoy = new Date();
  const fecha = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("");
  const aleatorio = Math.floor(1000 + Math.random() * 9000);
  const num = codigo.replace(/\D/g, "") || "000";
  return `G-${num}-${fecha}-${aleatorio}`;
}

interface DespacharTransferenciaDialogProps {
  transferencia: Transferencia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DespacharTransferenciaDialog({
  transferencia,
  open,
  onOpenChange,
}: DespacharTransferenciaDialogProps) {
  const despachar = useDespacharTransferencia();
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [transportista, setTransportista] = useState(
    transferencia.transportista || TRANSPORTISTA_DEFECTO
  );
  const [guia, setGuia] = useState(generarGuia(transferencia.codigo));

  const confirmar = async () => {
    const lineas = transferencia.lineas.map((linea) => ({
      transferenciaLineaId: linea.id,
      cantidadDespachada:
        cantidades[linea.id] ?? linea.cantidadSolicitada,
    }));
    try {
      await despachar.mutateAsync({
        id: transferencia.id,
        lineas,
        transportista,
        guia,
      });
      toast.success(`${transferencia.codigo} despachada`, {
        description: `En tránsito hacia ${transferencia.nombreSucursalDestino}.`,
      });
      onOpenChange(false);
    } catch (error) {
      const mensaje = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error("No se pudo despachar", { description: mensaje });
    }
  };

  const editarCantidad = (lineaId: string, valor: string) => {
    const numero = Number(valor);
    setCantidades((prev) => ({
      ...prev,
      [lineaId]: Number.isNaN(numero) ? 0 : numero,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Despachar {transferencia.codigo}
          </DialogTitle>
          <DialogDescription>
            Confirmá las cantidades despachadas por ítem y los datos del
            transportista para dejar la transferencia en tránsito.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            {transferencia.lineas.map((linea) => (
              <div
                key={linea.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {linea.nombreProducto}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {linea.sku} · Solicitado: {linea.cantidadSolicitada} ·{" "}
                    Disp. origen: {linea.cantidadDisponibleOrigen}
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">Cant.</span>
                  <Input
                    type="number"
                    min={0}
                    className="w-20"
                    defaultValue={linea.cantidadSolicitada}
                    onChange={(e) => editarCantidad(linea.id, e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="despacho-transportista">Transportista</Label>
              <Input
                id="despacho-transportista"
                value={transportista}
                onChange={(e) => setTransportista(e.target.value)}
                placeholder="Nombre o empresa de transporte"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="despacho-guia">N° de guía</Label>
              <Input
                id="despacho-guia"
                value={guia}
                onChange={(e) => setGuia(e.target.value)}
                placeholder="Referencia de despacho"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={despachar.isPending}
            onClick={() => void confirmar()}
          >
            {despachar.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Despachando…
              </>
            ) : (
              "Confirmar despacho"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
