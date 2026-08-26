import { useState } from "react";

import { FormField } from "@/components/shared/FormField";
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

interface DescuentoFormProps {
  descuentoActual: number;
  onAplicar: (porcentaje: number) => void;
  onCerrar: () => void;
}

/** Se monta solo cuando el diálogo se abre, así el campo parte del valor vigente. */
function DescuentoForm({
  descuentoActual,
  onAplicar,
  onCerrar,
}: DescuentoFormProps) {
  const [valor, setValor] = useState(
    descuentoActual > 0 ? String(descuentoActual) : ""
  );
  const [error, setError] = useState<string>();

  const aplicar = () => {
    const porcentaje = Number(valor);

    if (valor.trim().length === 0 || Number.isNaN(porcentaje)) {
      setError("Ingresa un porcentaje válido");
      return;
    }
    if (porcentaje < 0 || porcentaje > 100) {
      setError("El descuento debe estar entre 0 % y 100 %");
      return;
    }

    onAplicar(porcentaje);
    onCerrar();
  };

  return (
    <>
      <FormField id="descuento-porcentaje" label="Descuento (%)" error={error}>
        <Input
          id="descuento-porcentaje"
          type="number"
          min={0}
          max={100}
          value={valor}
          aria-invalid={Boolean(error)}
          onChange={(event) => setValor(event.target.value)}
        />
      </FormField>

      <DialogFooter>
        {descuentoActual > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onAplicar(0);
              onCerrar();
            }}
          >
            Quitar descuento
          </Button>
        ) : null}
        <Button type="button" onClick={aplicar}>
          Aplicar
        </Button>
      </DialogFooter>
    </>
  );
}

interface DescuentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  descuentoActual: number;
  onAplicar: (porcentaje: number) => void;
}

export function DescuentoDialog({
  open,
  onOpenChange,
  descuentoActual,
  onAplicar,
}: DescuentoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Aplicar descuento</DialogTitle>
          <DialogDescription>
            El porcentaje se aplica sobre el subtotal de la venta.
          </DialogDescription>
        </DialogHeader>

        <DescuentoForm
          descuentoActual={descuentoActual}
          onAplicar={onAplicar}
          onCerrar={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
