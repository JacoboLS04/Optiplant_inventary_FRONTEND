import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import type { ItemTransferencia } from "../types";

interface ItemsTransferenciaTableProps {
  items: ItemTransferencia[];
  onCantidadChange: (productoId: string, cantidad: number) => void;
  onRemove: (productoId: string) => void;
  readOnly?: boolean;
}

export function ItemsTransferenciaTable({
  items,
  onCantidadChange,
  onRemove,
  readOnly = false,
}: ItemsTransferenciaTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead className="hidden text-right sm:table-cell">
            Disponible
          </TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          {readOnly ? null : <TableHead className="w-12" aria-label="Acciones" />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const excede = item.cantidad > item.stockDisponible;

          return (
            <TableRow key={item.productoId}>
              <TableCell className="max-w-[18rem] whitespace-normal">
                <span className="block font-medium">{item.nombre}</span>
                <span className="block text-xs text-muted-foreground">
                  {item.sku}
                </span>
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                {formatNumber(item.stockDisponible)}
              </TableCell>
              <TableCell className="text-right">
                {readOnly ? (
                  <span className="tabular-nums">{formatNumber(item.cantidad)}</span>
                ) : (
                  <>
                    <label htmlFor={`cantidad-${item.productoId}`} className="sr-only">
                      Cantidad de {item.nombre}
                    </label>
                    <Input
                      id={`cantidad-${item.productoId}`}
                      type="number"
                      min={1}
                      max={item.stockDisponible}
                      value={item.cantidad}
                      aria-invalid={excede}
                      onChange={(event) =>
                        onCantidadChange(
                          item.productoId,
                          Number(event.target.value)
                        )
                      }
                      className="ml-auto h-8 w-24 text-right"
                    />
                    {excede ? (
                      <span role="alert" className="mt-1 block text-xs text-destructive">
                        Supera lo disponible
                      </span>
                    ) : null}
                  </>
                )}
              </TableCell>
              {readOnly ? null : (
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemove(item.productoId)}
                    aria-label={`Quitar ${item.nombre} de la transferencia`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
