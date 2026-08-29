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
import type { Producto } from "../types";

interface BajaProductoDialogProps {
  /** Producto a dar de baja; `null` mantiene el diálogo cerrado. */
  producto: Producto | null;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  isPending: boolean;
}

export function BajaProductoDialog({
  producto,
  onOpenChange,
  onConfirmar,
  isPending,
}: BajaProductoDialogProps) {
  return (
    <Dialog open={producto !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dar de baja producto</DialogTitle>
          <DialogDescription>
            {producto?.nombre} quedará marcado como inactivo. Dejará de aparecer
            en catálogos y no podrá usarse en nuevas compras, ventas o
            transferencias. Su stock histórico se conserva.
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
                Dando de baja…
              </>
            ) : (
              "Dar de baja"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
