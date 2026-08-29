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
import { cn } from "@/lib/utils";
import {
  ESTADOS_TRANSFERENCIA,
  ESTADO_TRANSFERENCIA_LABEL,
} from "../lib/estado-transferencia";
import type { EstadoTransferencia } from "../types";

export interface FiltrosTransferenciasValue {
  estado?: EstadoTransferencia;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
}

interface FiltrosTransferenciasProps {
  value: FiltrosTransferenciasValue;
  onChange: (value: FiltrosTransferenciasValue) => void;
  onReset: () => void;
}

export function FiltrosTransferencias({
  value,
  onChange,
  onReset,
}: FiltrosTransferenciasProps) {
  const { data: sucursales = [] } = useSucursales();

  const activo = value.estado;
  const elegirEstado = (estado?: EstadoTransferencia) =>
    onChange({ ...value, estado });
  const hayFiltros =
    Boolean(value.estado) ||
    value.sucursalOrigenId !== "todas" ||
    value.sucursalDestinoId !== "todas";

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="text-base">Filtrar transferencias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <fieldset className="space-y-1.5">
          <legend className="sr-only">Filtrar por estado</legend>
          <button
            type="button"
            onClick={() => elegirEstado(undefined)}
            aria-pressed={!activo}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !activo
                ? "border-foreground/25 bg-secondary font-medium"
                : "border-transparent hover:bg-secondary/60"
            )}
          >
            <span>Todas</span>
          </button>
          {ESTADOS_TRANSFERENCIA.map((estado) => {
            const seleccionado = activo === estado;
            return (
              <button
                key={estado}
                type="button"
                onClick={() => elegirEstado(estado)}
                aria-pressed={seleccionado}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  seleccionado
                    ? "border-foreground/25 bg-secondary font-medium"
                    : "border-transparent hover:bg-secondary/60"
                )}
              >
                <span className="truncate">{ESTADO_TRANSFERENCIA_LABEL[estado]}</span>
              </button>
            );
          })}
        </fieldset>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tf-origen" className="text-xs text-muted-foreground">
              Sucursal origen
            </Label>
            <Select
              value={value.sucursalOrigenId}
              onValueChange={(v) => onChange({ ...value, sucursalOrigenId: v })}
            >
              <SelectTrigger id="tf-origen">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {sucursales.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tf-destino" className="text-xs text-muted-foreground">
              Sucursal destino
            </Label>
            <Select
              value={value.sucursalDestinoId}
              onValueChange={(v) => onChange({ ...value, sucursalDestinoId: v })}
            >
              <SelectTrigger id="tf-destino">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {sucursales.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
