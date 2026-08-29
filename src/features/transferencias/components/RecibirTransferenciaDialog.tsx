import { useState } from "react";
import { ClipboardCheck, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecibirTransferencia } from "../hooks/useTransferencias";
import type { Transferencia, TratamientoFaltante } from "../types";

interface RecibirTransferenciaDialogProps {
  transferencia: Transferencia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRATAMIENTO_LABEL: Record<TratamientoFaltante, string> = {
  REENVIO: "Reenvío",
  AJUSTE: "Ajuste",
  RECLAMACION: "Reclamación",
};

export function RecibirTransferenciaDialog({
  transferencia,
  open,
  onOpenChange,
}: RecibirTransferenciaDialogProps) {
  const recibir = useRecibirTransferencia();
  const [recibidas, setRecibidas] = useState<Record<string, number>>({});
  const [tratamiento, setTratamiento] = useState<TratamientoFaltante>("RECLAMACION");

  const confirmar = async () => {
    try {
      const lineaConFaltante = transferencia.lineas.some(
        (linea) =>
          (recibidas[linea.id] ?? linea.cantidadDespachada) <
          linea.cantidadDespachada
      );
      const resultado = await recibir.mutateAsync({
        id: transferencia.id,
        lineas: transferencia.lineas.map((linea) => ({
          transferenciaLineaId: linea.id,
          cantidadRecibida: recibidas[linea.id] ?? linea.cantidadDespachada,
          tratamiento: lineaConFaltante ? tratamiento : undefined,
        })),
      });
      toast.success(
        resultado.estado === "CON_FALTANTES"
          ? "Recepción con faltantes registrada"
          : `Recepción de ${transferencia.codigo} completada`,
        {
          description:
            resultado.estado === "CON_FALTANTES"
              ? `Se registró el faltante como tratamiento «${TRATAMIENTO_LABEL[tratamiento]}».`
              : `Stock actualizado en ${transferencia.nombreSucursalDestino}.`,
        }
      );
      setRecibidas({});
      setTratamiento("RECLAMACION");
      onOpenChange(false);
    } catch (error) {
      const mensaje = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error("No se pudo registrar la recepción", { description: mensaje });
    }
  };

  const editarCantidad = (lineaId: string, valor: string) => {
    const numero = Number(valor);
    setRecibidas((prev) => ({
      ...prev,
      [lineaId]: Number.isNaN(numero) ? 0 : numero,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Recibir {transferencia.codigo}
          </DialogTitle>
          <DialogDescription>
            Confirmá la cantidad recibida por ítem. Si algo llega incompleto,
            la transferencia pasará a «Con faltantes».
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
                    {linea.sku} · Despachado: {linea.cantidadDespachada}
                  </p>
                </div>
                <label className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">Rec.</span>
                  <Input
                    type="number"
                    min={0}
                    className="w-20"
                    defaultValue={linea.cantidadDespachada}
                    onChange={(e) => editarCantidad(linea.id, e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recep-tratamiento">
              Tratamiento de faltantes (si aplica)
            </Label>
            <Select
              value={tratamiento}
              onValueChange={(v) => setTratamiento(v as TratamientoFaltante)}
            >
              <SelectTrigger id="recep-tratamiento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TRATAMIENTO_LABEL) as TratamientoFaltante[]).map(
                  (t) => (
                    <SelectItem key={t} value={t}>
                      {TRATAMIENTO_LABEL[t]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={recibir.isPending}
            onClick={() => void confirmar()}
          >
            {recibir.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Recibiendo…
              </>
            ) : (
              "Confirmar recepción"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
