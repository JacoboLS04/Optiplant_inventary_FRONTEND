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
import type { Sucursal } from "../types";

interface ConfirmarInactivarDialogProps {
  /** Sucursal a inactivar; `null` mantiene el diálogo cerrado. */
  sucursal: Sucursal | null;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  isPending: boolean;
}

export function ConfirmarInactivarDialog({
  sucursal,
  onOpenChange,
  onConfirmar,
  isPending,
}: ConfirmarInactivarDialogProps) {
  return (
    <Dialog open={sucursal !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inactivar sucursal</DialogTitle>
          <DialogDescription>
            {sucursal?.nombre} dejará de operar y no podrá volver a activarse desde
            esta pantalla. Esta acción no se puede deshacer.
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
            variant="destructive"
            onClick={onConfirmar}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Aplicando…
              </>
            ) : (
              "Inactivar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
