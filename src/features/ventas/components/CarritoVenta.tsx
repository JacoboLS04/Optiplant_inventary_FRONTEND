import { Loader2, Minus, Plus, ShoppingCart, Tag, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/SectionState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { LineaVenta } from "../types";

export const MEDIOS_DE_PAGO = [
  "Efectivo",
  "Tarjeta débito",
  "Tarjeta crédito",
  "Transferencia",
  "Yape / Plin",
  "Crédito",
] as const;

interface CarritoVentaProps {
  lineas: LineaVenta[];
  subtotal: number;
  descuentoPorcentaje: number;
  total: number;
  sucursalNombre?: string;
  medioPago?: string;
  isSubmitting: boolean;
  onCantidadChange: (productoId: string, cantidad: number) => void;
  onQuitar: (productoId: string) => void;
  onAbrirDescuento: () => void;
  onMedioPagoChange: (medio: string) => void;
  onRegistrar: () => void;
  onVaciar: () => void;
}

export function CarritoVenta({
  lineas,
  subtotal,
  descuentoPorcentaje,
  total,
  sucursalNombre,
  medioPago,
  isSubmitting,
  onCantidadChange,
  onQuitar,
  onAbrirDescuento,
  onMedioPagoChange,
  onRegistrar,
  onVaciar,
}: CarritoVentaProps) {
  const unidades = lineas.reduce((acc, linea) => acc + linea.cantidad, 0);

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Ítems de la venta</CardTitle>
        <CardDescription>
          {lineas.length === 0
            ? "Agrega productos desde el catálogo."
            : `${formatNumber(unidades)} unidades · ${sucursalNombre ?? ""}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {lineas.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="La venta está vacía"
            description="Selecciona productos del catálogo para iniciar."
          />
        ) : (
          <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {lineas.map((linea) => (
              <li key={linea.productoId} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{linea.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(linea.precioUnitario)} c/u
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onQuitar(linea.productoId)}
                    aria-label={`Quitar ${linea.nombre} de la venta`}
                  >
                    <Trash2 />
                  </Button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        onCantidadChange(linea.productoId, linea.cantidad - 1)
                      }
                      disabled={linea.cantidad <= 1}
                      aria-label={`Disminuir cantidad de ${linea.nombre}`}
                    >
                      <Minus />
                    </Button>
                    <span
                      className="w-10 text-center text-sm font-medium tabular-nums"
                      aria-live="polite"
                    >
                      {formatNumber(linea.cantidad)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        onCantidadChange(linea.productoId, linea.cantidad + 1)
                      }
                      disabled={linea.cantidad >= linea.stockDisponible}
                      aria-label={`Aumentar cantidad de ${linea.nombre}`}
                    >
                      <Plus />
                    </Button>
                  </div>

                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(linea.precioUnitario * linea.cantidad)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Separator />

        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(subtotal)}</dd>
          </div>
          {descuentoPorcentaje > 0 ? (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Descuento ({descuentoPorcentaje} %)
              </dt>
              <dd className="font-medium tabular-nums text-destructive">
                −{formatCurrency(subtotal - total)}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-base">
            <dt className="font-medium">Total</dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(total)}</dd>
          </div>
        </dl>

        <div className="space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor="medio-pago">Medio de pago</Label>
            <Select
              value={medioPago ?? ""}
              onValueChange={onMedioPagoChange}
              disabled={lineas.length === 0}
            >
              <SelectTrigger
                id="medio-pago"
                className={lineas.length === 0 ? "opacity-60" : ""}
              >
                <SelectValue placeholder="Selecciona el medio de pago" />
              </SelectTrigger>
              <SelectContent>
                {MEDIOS_DE_PAGO.map((medio) => (
                  <SelectItem key={medio} value={medio}>
                    {medio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onAbrirDescuento}
            disabled={lineas.length === 0}
          >
            <Tag className="h-4 w-4" aria-hidden="true" />
            {descuentoPorcentaje > 0
              ? `Descuento aplicado: ${descuentoPorcentaje} %`
              : "Aplicar descuento"}
          </Button>

          <Button
            type="button"
            className="w-full"
            onClick={onRegistrar}
            disabled={lineas.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Registrando…
              </>
            ) : (
              "Registrar venta"
            )}
          </Button>

          {lineas.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onVaciar}
              disabled={isSubmitting}
            >
              Vaciar venta
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
