import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Usuario } from "../types";

interface ConfirmarEstadoDialogProps {
  /** Usuario cuyo estado se va a cambiar; `null` mantiene el diálogo cerrado. */
  usuario: Usuario | null;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  isPending: boolean;
}

export function ConfirmarEstadoDialog({
  usuario,
  onOpenChange,
  onConfirmar,
  isPending,
}: ConfirmarEstadoDialogProps) {
  const desactivando = usuario?.activo ?? false;

  return (
    <Dialog open={usuario !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {desactivando ? "Desactivar usuario" : "Activar usuario"}
          </DialogTitle>
          <DialogDescription>
            {desactivando
              ? `${usuario?.nombre} perderá el acceso al sistema y su sesión activa dejará de ser válida.`
              : `${usuario?.nombre} volverá a poder iniciar sesión con sus credenciales actuales.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={desactivando ? "destructive" : "default"}
            onClick={onConfirmar}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Aplicando…
              </>
            ) : desactivando ? (
              "Desactivar"
            ) : (
              "Activar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
