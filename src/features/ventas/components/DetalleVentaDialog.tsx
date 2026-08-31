import { Printer, Receipt } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { imprimirReciboVenta } from "../lib/documento-recibo";
import type { Venta } from "../types";

interface DetalleVentaDialogProps {
  venta: Venta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetalleVentaDialog({
  venta,
  open,
  onOpenChange,
}: DetalleVentaDialogProps) {
  const descuentoAplicado =
    venta.descuentoPorcentaje > 0
      ? Math.round(venta.subtotal * (venta.descuentoPorcentaje / 100))
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" aria-hidden="true" />
            {venta.codigo}
            <span className="ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imprimirReciboVenta(venta)}
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                Imprimir
              </Button>
            </span>
          </DialogTitle>
          <DialogDescription>
            Comprobante consultable de la venta registrada.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-4 rounded-lg bg-secondary/50 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Sucursal</dt>
            <dd className="text-sm font-medium">{venta.nombreSucursal}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Fecha</dt>
            <dd className="text-sm font-medium">
              {venta.fecha ? formatDate(venta.fecha) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Atendió</dt>
            <dd className="text-sm font-medium">{venta.nombreUsuario || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Ítems</dt>
            <dd className="text-sm font-medium">
              {formatNumber(venta.unidades)} unidades
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Medio de pago</dt>
            <dd className="text-sm font-medium">{venta.medioPago || "—"}</dd>
          </div>
        </dl>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">P. unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venta.lineas.map((linea) => (
              <TableRow key={linea.id}>
                <TableCell>
                  <span className="font-medium">{linea.nombreProducto}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {linea.sku}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(linea.cantidad)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(linea.precioUnitario)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(linea.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-col items-end gap-1 text-sm">
          <span className="text-muted-foreground">
            Subtotal: {formatCurrency(venta.subtotal)}
          </span>
          {descuentoAplicado > 0 ? (
            <span className="text-muted-foreground">
              Descuento ({venta.descuentoPorcentaje}%): −
              {formatCurrency(descuentoAplicado)}
            </span>
          ) : null}
          <span className="text-lg font-semibold tabular-nums">
            Total {formatCurrency(venta.total)}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
