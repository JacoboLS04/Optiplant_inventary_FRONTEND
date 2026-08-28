import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { useRegistrarRecepcion } from "../hooks/useCompras";
import type { OrdenCompra } from "../types";

interface RecepcionOrdenDialogProps {
  orden: OrdenCompra;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecepcionOrdenDialog({
  orden,
  open,
  onOpenChange,
}: RecepcionOrdenDialogProps) {
  const registrarRecepcion = useRegistrarRecepcion();

  const [cantidades, setCantidades] = useState<Record<string, number>>(() => {
    const iniciales: Record<string, number> = {};
    for (const linea of orden.items) {
      iniciales[linea.lineaId] = linea.cantidadPendiente;
    }
    return iniciales;
  });

  const cerrar = (siguiente: boolean) => {
    if (!siguiente) onOpenChange(false);
  };

  const cambiarCantidad = (lineaId: string, value: number) => {
    setCantidades((actuales) => ({ ...actuales, [lineaId]: value }));
  };

  const hayCambios = orden.items.some(
    (linea) =>
      (cantidades[linea.lineaId] ?? 0) > 0 &&
      (cantidades[linea.lineaId] ?? 0) !== linea.cantidadPendiente
  );

  const onSubmit = async () => {
    const lineas = orden.items
      .filter((linea) => (cantidades[linea.lineaId] ?? 0) > 0)
      .map((linea) => ({
        lineaId: linea.lineaId,
        cantidadRecibida: cantidades[linea.lineaId],
      }));

    if (lineas.length === 0) {
      toast.error("Indica al menos una cantidad a recibir");
      return;
    }

    await registrarRecepcion.mutateAsync({ id: orden.id, lineas });
    toast.success("Recepción registrada", {
      description: `Líneas actualizadas en la orden ${orden.codigo}.`,
    });
    cerrar(false);
  };

  const totalPendiente = orden.items.reduce(
    (acc, linea) => acc + linea.cantidadPendiente,
    0
  );
  const totalARecebir = Object.values(cantidades).reduce(
    (acc, cantidad) => acc + (Number.isFinite(cantidad) ? cantidad : 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar recepción · {orden.codigo}</DialogTitle>
          <DialogDescription>
            Indica cuánto se recibe de cada línea. La orden avanza a «Recibida»
            cuando todas las líneas quedan cubiertas.
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Ordenado</TableHead>
              <TableHead className="text-right">Pendiente</TableHead>
              <TableHead className="text-right">A recibir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orden.items.map((linea) => {
              const pendiente = linea.cantidadPendiente;
              const valor = cantidades[linea.lineaId] ?? 0;
              const excede = valor > pendiente;
              return (
                <TableRow key={linea.lineaId}>
                  <TableCell className="max-w-[16rem] whitespace-normal">
                    <span className="block font-medium">{linea.nombre}</span>
                    <span className="block text-xs text-muted-foreground">
                      {linea.sku}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(linea.cantidadOrdenada)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatNumber(pendiente)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      max={pendiente}
                      value={valor}
                      aria-invalid={excede}
                      onChange={(e) =>
                        cambiarCantidad(linea.lineaId, Number(e.target.value))
                      }
                      className="ml-auto h-8 w-24 text-right"
                    />
                    {excede ? (
                      <span
                        role="alert"
                        className="mt-1 block text-xs text-destructive"
                      >
                        No puede superar lo pendiente
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <p className="ml-auto w-fit text-sm tabular-nums text-muted-foreground">
          {formatNumber(totalARecebir)} / {formatNumber(totalPendiente)} de
          pendiente
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => cerrar(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={registrarRecepcion.isPending || totalARecebir === 0}
          >
            {registrarRecepcion.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Registrando…
              </>
            ) : hayCambios ? (
              "Guardar recepción parcial"
            ) : (
              "Registrar recepción"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
