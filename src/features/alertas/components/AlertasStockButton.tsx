import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, PackageCheck } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ESTADO_STOCK_LABEL,
  ESTADO_STOCK_TONE,
} from "@/features/inventario/lib/estado-stock";
import { formatNumber } from "@/lib/format";
import { useAlertasStock } from "../hooks/useAlertasStock";

const MAXIMO_VISIBLE = 6;

interface AlertasStockButtonProps {
  /** Ámbito mostrado en el encabezado: nombre de sucursal o toda la red. */
  ambito: string;
  onNavigate?: () => void;
}

export function AlertasStockButton({
  ambito,
  onNavigate,
}: AlertasStockButtonProps) {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const { data: alertas = [], isPending, isError, refetch } = useAlertasStock();

  const total = alertas.length;
  const visibles = alertas.slice(0, MAXIMO_VISIBLE);

  const ir = (destino: string) => {
    setAbierto(false);
    onNavigate?.();
    navigate(destino);
  };

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-white/8 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-white/10 data-[state=open]:text-sidebar-foreground"
        aria-label={
          total > 0
            ? `Alertas de stock (${total})`
            : "Alertas de stock"
        }
      >
        <Bell className="h-4 w-4" />
        {total > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white tabular-nums">
            {total > 9 ? "9+" : total}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0">
        <div className="border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Alertas de stock</p>
          <p className="text-xs text-muted-foreground">{ambito}</p>
        </div>

        {isPending ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 3 }, (_, indice) => (
              <Skeleton key={indice} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="space-y-3 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No se pudieron cargar las alertas.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : total === 0 ? (
          <div className="space-y-1 p-6 text-center">
            <PackageCheck
              className="mx-auto h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">Sin alertas de stock</p>
            <p className="text-xs text-muted-foreground">
              Ningún producto está por debajo de su mínimo.
            </p>
          </div>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {visibles.map((alerta) => (
              <li key={alerta.existenciaId}>
                <button
                  type="button"
                  onClick={() =>
                    ir(`/inventario?buscar=${encodeURIComponent(alerta.sku)}`)
                  }
                  className="flex w-full flex-col gap-1 px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{alerta.nombre}</span>
                    <StatusBadge
                      tone={ESTADO_STOCK_TONE[alerta.estado]}
                      label={ESTADO_STOCK_LABEL[alerta.estado]}
                    />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {alerta.sucursal} · {formatNumber(alerta.stock)} de{" "}
                    {formatNumber(alerta.stockMinimo)} unidades mínimas
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {total > 0 ? (
          <div className="border-t px-3 py-2">
            <button
              type="button"
              onClick={() => ir("/inventario")}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
            >
              {total > MAXIMO_VISIBLE
                ? `Ver las ${formatNumber(total)} alertas en Inventario`
                : "Ver en Inventario"}
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
