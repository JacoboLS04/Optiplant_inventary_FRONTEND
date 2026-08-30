import { Download, Printer, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategorias, useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { ESTADO_STOCK_LABEL } from "../lib/estado-stock";
import type { EstadoStock } from "../types";

export type PeriodoActualizacion = "todos" | "hoy" | "7d" | "30d";

export interface FiltrosInventarioValue {
  categoriaId: string;
  sucursalId: string;
  estado: EstadoStock | "todos";
  periodo: PeriodoActualizacion;
}

interface FiltrosInventarioProps {
  value: FiltrosInventarioValue;
  onChange: (value: FiltrosInventarioValue) => void;
  onExport: () => void;
  exportDisabled?: boolean;
  onPrint?: () => void;
}

const PERIODO_LABEL: Record<PeriodoActualizacion, string> = {
  todos: "Cualquier fecha",
  hoy: "Últimas 24 horas",
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
};

export function FiltrosInventario({
  value,
  onChange,
  onExport,
  exportDisabled = false,
  onPrint,
}: FiltrosInventarioProps) {
  const { data: categorias = [] } = useCategorias();
  const { data: sucursales = [] } = useSucursales();

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-secondary/50 p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="filtro-categoria" className="text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Categoría
          </Label>
          <Select
            value={value.categoriaId}
            onValueChange={(categoriaId) => onChange({ ...value, categoriaId })}
          >
            <SelectTrigger id="filtro-categoria" className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-sucursal" className="text-xs text-muted-foreground">
            Sucursal
          </Label>
          <Select
            value={value.sucursalId}
            onValueChange={(sucursalId) => onChange({ ...value, sucursalId })}
          >
            <SelectTrigger id="filtro-sucursal" className="bg-card">
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

        <div className="space-y-1.5">
          <Label htmlFor="filtro-estado" className="text-xs text-muted-foreground">
            Estado de stock
          </Label>
          <Select
            value={value.estado}
            onValueChange={(estado) =>
              onChange({ ...value, estado: estado as FiltrosInventarioValue["estado"] })
            }
          >
            <SelectTrigger id="filtro-estado" className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {(Object.keys(ESTADO_STOCK_LABEL) as EstadoStock[]).map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {ESTADO_STOCK_LABEL[estado]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-periodo" className="text-xs text-muted-foreground">
            Actualizado
          </Label>
          <Select
            value={value.periodo}
            onValueChange={(periodo) =>
              onChange({ ...value, periodo: periodo as PeriodoActualizacion })
            }
          >
            <SelectTrigger id="filtro-periodo" className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PERIODO_LABEL) as PeriodoActualizacion[]).map((periodo) => (
                <SelectItem key={periodo} value={periodo}>
                  {PERIODO_LABEL[periodo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        {onPrint ? (
          <Button
            type="button"
            variant="outline"
            onClick={onPrint}
            disabled={exportDisabled}
            className="bg-card"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Imprimir hoja
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={onExport}
          disabled={exportDisabled}
          className="bg-card"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportar CSV
        </Button>
      </div>
    </div>
  );
}
