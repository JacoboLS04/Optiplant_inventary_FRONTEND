import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ESTADO_ORDEN_LABEL } from "../lib/estado-orden";
import type { EstadoOrdenCompra } from "../types";

export interface FiltrosComprasValue {
  estados: EstadoOrdenCompra[];
  sucursalId: string;
}

interface FiltrosComprasProps {
  value: FiltrosComprasValue;
  onChange: (value: FiltrosComprasValue) => void;
  conteoPorEstado: Record<EstadoOrdenCompra, number>;
  onReset: () => void;
}

const ESTADOS = Object.keys(ESTADO_ORDEN_LABEL) as EstadoOrdenCompra[];

export function FiltrosCompras({
  value,
  onChange,
  conteoPorEstado,
  onReset,
}: FiltrosComprasProps) {
  const { data: sucursales = [] } = useSucursales();

  const alternarEstado = (estado: EstadoOrdenCompra) => {
    const activo = value.estados.includes(estado);
    onChange({
      ...value,
      estados: activo
        ? value.estados.filter((item) => item !== estado)
        : [...value.estados, estado],
    });
  };

  const hayFiltros = value.estados.length > 0 || value.sucursalId !== "todas";

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="text-base">Estado de la compra</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <fieldset className="space-y-1.5">
          <legend className="sr-only">Filtrar por estado</legend>
          {ESTADOS.map((estado) => {
            const activo = value.estados.includes(estado);
            return (
              <button
                key={estado}
                type="button"
                onClick={() => alternarEstado(estado)}
                aria-pressed={activo}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activo
                    ? "border-foreground/25 bg-secondary font-medium"
                    : "border-transparent hover:bg-secondary/60"
                )}
              >
                <span className="truncate">{ESTADO_ORDEN_LABEL[estado]}</span>
                <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                  {formatNumber(conteoPorEstado[estado] ?? 0)}
                </span>
              </button>
            );
          })}
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="compras-sucursal" className="text-xs text-muted-foreground">
            Sucursal de destino
          </Label>
          <Select
            value={value.sucursalId}
            onValueChange={(sucursalId) => onChange({ ...value, sucursalId })}
          >
            <SelectTrigger id="compras-sucursal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las sucursales</SelectItem>
              {sucursales.map((sucursal) => (
                <SelectItem key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hayFiltros ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="w-full"
          >
            Limpiar filtros
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
