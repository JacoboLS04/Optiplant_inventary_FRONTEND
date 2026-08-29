import { useState } from "react";
import {
  Ban,
  Loader2,
  Package,
  PackageCheck,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/format";
import {
  ACCIONES_DISPONIBLES,
  ESTADO_TRANSFERENCIA_LABEL,
  ESTADO_TRANSFERENCIA_TONE,
  URGENCIA_LABEL,
  type AccionTransferencia,
} from "../lib/estado-transferencia";
import { useCancelarTransferencia, usePrepararTransferencia } from "../hooks/useTransferencias";
import type { Transferencia } from "../types";
import { AprobarTransferenciaDialog } from "./AprobarTransferenciaDialog";
import { DespacharTransferenciaDialog } from "./DespacharTransferenciaDialog";
import { RecibirTransferenciaDialog } from "./RecibirTransferenciaDialog";

interface TransferenciaCardProps {
  transferencia: Transferencia;
}

const ETIQUETA_ACCION: Record<
  AccionTransferencia,
  { icon: typeof ThumbsUp; label: string; variant?: "destructive" | "default" | "outline" }
> = {
  aprobarOrigen: { icon: ThumbsUp, label: "Aprobar (origen)" },
  aprobarDestino: { icon: ThumbsUp, label: "Aprobar (destino)" },
  rechazar: { icon: XCircle, label: "Rechazar", variant: "destructive" },
  preparar: { icon: Package, label: "Preparar" },
  despachar: { icon: PackageCheck, label: "Despachar" },
  recibir: { icon: PackageCheck, label: "Recibir" },
  cancelar: { icon: Ban, label: "Cancelar", variant: "destructive" },
};

export function TransferenciaCard({ transferencia }: TransferenciaCardProps) {
  const preparar = usePrepararTransferencia();
  const cancelar = useCancelarTransferencia();
  const [aprobacion, setAprobacion] = useState<{
    abierta: boolean;
    decision: "APROBADO" | "RECHAZADO";
  }>({ abierta: false, decision: "APROBADO" });
  const [despachoAbierto, setDespachoAbierto] = useState(false);
  const [recepcionAbierta, setRecepcionAbierta] = useState(false);

  const acciones = ACCIONES_DISPONIBLES[transferencia.estado];

  const ejecutar = async (accion: AccionTransferencia) => {
    if (accion === "aprobarOrigen" || accion === "aprobarDestino") {
      setAprobacion({ abierta: true, decision: "APROBADO" });
      return;
    }
    if (accion === "rechazar") {
      setAprobacion({ abierta: true, decision: "RECHAZADO" });
      return;
    }
    if (accion === "despachar") {
      setDespachoAbierto(true);
      return;
    }
    if (accion === "recibir") {
      setRecepcionAbierta(true);
      return;
    }
    if (accion === "preparar") {
      try {
        await preparar.mutateAsync(transferencia.id);
        toast.success("Transferencia en preparación", {
          description: `${transferencia.codigo} ya puede ser despachada.`,
        });
      } catch (error) {
        const mensaje = (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        toast.error("No se pudo preparar", { description: mensaje });
      }
      return;
    }
    if (accion === "cancelar") {
      try {
        await cancelar.mutateAsync(transferencia.id);
        toast.success("Transferencia cancelada", {
          description: `${transferencia.codigo} fue cancelada.`,
        });
      } catch (error) {
        const mensaje = (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        toast.error("No se pudo cancelar", { description: mensaje });
      }
    }
  };

  const ocupado = preparar.isPending || cancelar.isPending;

  return (
    <>
      <Card className="gap-4 py-5">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-foreground px-2 py-0.5 font-mono text-xs font-medium text-background">
              {transferencia.codigo}
            </span>
            <StatusBadge
              tone={ESTADO_TRANSFERENCIA_TONE[transferencia.estado]}
              label={ESTADO_TRANSFERENCIA_LABEL[transferencia.estado]}
            />
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              Urgencia {URGENCIA_LABEL[transferencia.urgencia]}
            </span>
          </div>
          <p className="text-base font-medium">
            {transferencia.nombreSucursalOrigen} →{" "}
            {transferencia.nombreSucursalDestino}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Solicitante</dt>
              <dd>{transferencia.nombreUsuarioSolicitante || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Unidades</dt>
              <dd className="font-semibold tabular-nums">
                {formatNumber(transferencia.totalUnidades)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Solicitud</dt>
              <dd className="text-muted-foreground">
                {transferencia.fechaSolicitud
                  ? formatDate(transferencia.fechaSolicitud)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Despacho</dt>
              <dd className="text-muted-foreground">
                {transferencia.fechaDespacho
                  ? formatDate(transferencia.fechaDespacho)
                  : "—"}
              </dd>
            </div>
          </dl>

          {transferencia.transportista || transferencia.guia ? (
            <p className="rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
              {[transferencia.transportista, transferencia.guia && `Guía ${transferencia.guia}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}

          {transferencia.aprobaciones.length > 0 ? (
            <ul className="space-y-1.5">
              {transferencia.aprobaciones.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 text-sm"
                >
                  <span>
                    {a.nombreGerente}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({a.rolAprobacion === "ORIGEN" ? "origen" : "destino"}) —{" "}
                      {a.decision}
                    </span>
                  </span>
                  {a.observacion ? (
                    <span className="text-xs text-muted-foreground">
                      {a.observacion}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <details className="group">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Ver ítems de la transferencia
            </summary>
            <ul className="mt-2 space-y-1.5 border-t pt-3">
              {transferencia.lineas.map((linea) => (
                <li
                  key={linea.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {linea.nombreProducto}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {linea.sku}
                    </span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    Solicitado {formatNumber(linea.cantidadSolicitada)} ·{" "}
                    Despachado {formatNumber(linea.cantidadDespachada)} · Recibido{" "}
                    {formatNumber(linea.cantidadRecibida)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </CardContent>

        {acciones.length > 0 ? (
          <CardFooter className="flex flex-wrap gap-2">
            {acciones.map((accion) => {
              const { icon: Icon, label, variant = "outline" } =
                ETIQUETA_ACCION[accion];
              return (
                <Button
                  key={accion}
                  type="button"
                  size="sm"
                  variant={variant}
                  disabled={ocupado}
                  onClick={() => void ejecutar(accion)}
                >
                  {ocupado ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {label}
                </Button>
              );
            })}
          </CardFooter>
        ) : null}
      </Card>

      <AprobarTransferenciaDialog
        transferencia={transferencia}
        decision={aprobacion.decision}
        open={aprobacion.abierta}
        onOpenChange={(abierta) => setAprobacion((prev) => ({ ...prev, abierta }))}
      />
      <DespacharTransferenciaDialog
        transferencia={transferencia}
        open={despachoAbierto}
        onOpenChange={setDespachoAbierto}
      />
      <RecibirTransferenciaDialog
        transferencia={transferencia}
        open={recepcionAbierta}
        onOpenChange={setRecepcionAbierta}
      />
    </>
  );
}
