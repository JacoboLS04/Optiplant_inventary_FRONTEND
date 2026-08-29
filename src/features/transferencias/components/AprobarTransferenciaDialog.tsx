import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useAprobarTransferencia } from "../hooks/useTransferencias";
import type { RolAprobacion, Transferencia } from "../types";

interface AprobarTransferenciaDialogProps {
  transferencia: Transferencia;
  decision: "APROBADO" | "RECHAZADO";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROL_LABEL: Record<RolAprobacion, string> = {
  ORIGEN: "Sucursal origen",
  DESTINO: "Sucursal destino",
};

export function AprobarTransferenciaDialog({
  transferencia,
  decision,
  open,
  onOpenChange,
}: AprobarTransferenciaDialogProps) {
  const { user } = useAuth();
  const aprobar = useAprobarTransferencia();
  const [rol, setRol] = useState<RolAprobacion>("ORIGEN");
  const [observacion, setObservacion] = useState("");

  const esAprobacion = decision === "APROBADO";

  const confirmar = async () => {
    try {
      const resultado = await aprobar.mutateAsync({
        transferenciaId: transferencia.id,
        gerenteId: user?.usuarioId ?? "",
        rolAprobacion: rol,
        decision,
        observacion,
      });
      toast.success(
        esAprobacion
          ? `Aprobación de ${ROL_LABEL[rol].toLowerCase()} registrada`
          : "Transferencia rechazada",
        {
          description: resultado.estado === "APROBADA"
            ? "Ambas sucursales aprobaron: la transferencia queda aprobada."
            : `${transferencia.codigo} en estado «${resultado.estado}».`,
        }
      );
      setRol("ORIGEN");
      setObservacion("");
      onOpenChange(false);
    } catch (error) {
      const mensaje = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error("No se pudo registrar la decisión", { description: mensaje });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {esAprobacion ? (
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
            )}
            {esAprobacion ? "Aprobar" : "Rechazar"} {transferencia.codigo}
          </DialogTitle>
          <DialogDescription>
            {esAprobacion
              ? "Registra la aprobación de la sucursal que representas. Se requiere la de origen y destino para aprobarla."
              : "Rechazar detiene el flujo y deja la transferencia en estado «Rechazada»."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rol-aprobacion">Rol de la sucursal</Label>
            <Select
              value={rol}
              onValueChange={(v) => setRol(v as RolAprobacion)}
            >
              <SelectTrigger id="rol-aprobacion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROL_LABEL) as RolAprobacion[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROL_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacion-aprobacion">Observación (opcional)</Label>
            <Textarea
              id="observacion-aprobacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder={esAprobacion ? "Comentario de la aprobación…" : "Motivo del rechazo…"}
              rows={3}
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
            variant={esAprobacion ? "default" : "destructive"}
            disabled={aprobar.isPending || !user?.usuarioId}
            onClick={() => void confirmar()}
          >
            {aprobar.isPending ? "Guardando…" : esAprobacion ? "Aprobar" : "Rechazar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
