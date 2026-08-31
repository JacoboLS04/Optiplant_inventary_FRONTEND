import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, PackagePlus, Plus } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/SectionState";
import { Stepper, type Step } from "@/components/shared/Stepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { formatNumber } from "@/lib/format";
import { DatosEnvioFields } from "./DatosEnvioFields";
import { ItemsTransferenciaTable } from "./ItemsTransferenciaTable";
import { SeleccionProductosDialog } from "./SeleccionProductosDialog";
import { useCrearTransferencia } from "../hooks/useTransferencias";
import type { ItemTransferencia, TransferenciaFormValues } from "../types";

const PASOS: Step[] = [
  { id: "datos", label: "Origen y destino" },
  { id: "items", label: "Productos" },
  { id: "revision", label: "Revisión" },
];

const VALORES_INICIALES: TransferenciaFormValues = {
  sucursalOrigenId: "",
  sucursalDestinoId: "",
  fechaEnvio: "",
  responsable: "",
  transportador: "Transportes OptiPlant",
  observaciones: "",
};

interface CrearTransferenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrearTransferenciaDialog({
  open,
  onOpenChange,
}: CrearTransferenciaDialogProps) {
  const form = useForm<TransferenciaFormValues>({
    defaultValues: VALORES_INICIALES,
  });
  const { data: sucursales = [] } = useSucursales();
  const crearTransferencia = useCrearTransferencia();

  const [paso, setPaso] = useState(0);
  const [items, setItems] = useState<ItemTransferencia[]>([]);
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  const valores = form.getValues();
  const nombreSucursal = (id: string) =>
    sucursales.find((sucursal) => sucursal.id === id)?.nombre ?? "—";

  const totalUnidades = items.reduce((acc, item) => acc + item.cantidad, 0);
  const hayExcesos = items.some((item) => item.cantidad > item.stockDisponible);

  const irAlPasoDeItems = async () => {
    const valido = await form.trigger([
      "sucursalOrigenId",
      "sucursalDestinoId",
      "fechaEnvio",
      "responsable",
    ]);
    if (valido) setPaso(1);
  };

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    setItems((actuales) =>
      actuales.map((item) =>
        item.productoId === productoId
          ? { ...item, cantidad: Number.isNaN(cantidad) ? 0 : cantidad }
          : item
      )
    );
  };

  const quitarItem = (productoId: string) => {
    setItems((actuales) => actuales.filter((item) => item.productoId !== productoId));
  };

  const reiniciar = () => {
    form.reset(VALORES_INICIALES);
    setItems([]);
    setPaso(0);
  };

  const cerrar = () => {
    reiniciar();
    onOpenChange(false);
  };

  const confirmar = async () => {
    const transferencia = await crearTransferencia.mutateAsync({
      sucursalOrigenId: valores.sucursalOrigenId,
      sucursalDestinoId: valores.sucursalDestinoId,
      fechaEnvio: valores.fechaEnvio,
      responsable: valores.responsable.trim(),
      transportador: valores.transportador.trim(),
      observaciones: valores.observaciones.trim(),
      items: items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      })),
    });

    toast.success(`Solicitud ${transferencia.codigo} creada`, {
      description: `${formatNumber(transferencia.totalUnidades)} unidades solicitadas de ${nombreSucursal(valores.sucursalOrigenId)} hacia ${nombreSucursal(valores.sucursalDestinoId)}.`,
    });
    cerrar();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva transferencia</DialogTitle>
          <Stepper
            steps={PASOS}
            currentStep={paso}
            onStepChange={(indice) => setPaso(indice)}
          />
        </DialogHeader>

        <div className="space-y-6">
          {paso === 0 ? (
            <>
              <DatosEnvioFields form={form} />
              <div className="flex justify-end">
                <Button type="button" onClick={() => void irAlPasoDeItems()}>
                  Continuar
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </>
          ) : null}

          {paso === 1 ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Existencias disponibles en {nombreSucursal(valores.sucursalOrigenId)}.
                </p>
                <Button type="button" onClick={() => setSelectorAbierto(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Agregar ítems
                </Button>
              </div>

              {items.length === 0 ? (
                <EmptyState
                  icon={PackagePlus}
                  title="Aún no hay ítems en la transferencia"
                  description="Agrega productos con existencia en la sucursal de origen."
                />
              ) : (
                <>
                  <ItemsTransferenciaTable
                    items={items}
                    onCantidadChange={actualizarCantidad}
                    onRemove={quitarItem}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatNumber(items.length)}{" "}
                      {items.length === 1 ? "referencia" : "referencias"}
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatNumber(totalUnidades)} unidades
                    </span>
                  </div>
                </>
              )}

              <Separator />
              <div className="flex flex-wrap justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setPaso(0)}>
                  Volver
                </Button>
                <Button
                  type="button"
                  onClick={() => setPaso(2)}
                  disabled={items.length === 0 || hayExcesos || totalUnidades === 0}
                >
                  Revisar transferencia
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </>
          ) : null}

          {paso === 2 ? (
            <>
              <dl className="grid gap-4 rounded-lg bg-secondary/50 p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Ruta</dt>
                  <dd className="text-sm font-medium">
                    {nombreSucursal(valores.sucursalOrigenId)} →{" "}
                    {nombreSucursal(valores.sucursalDestinoId)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Responsable</dt>
                  <dd className="text-sm font-medium">{valores.responsable}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Transportador</dt>
                  <dd className="text-sm font-medium">
                    {valores.transportador || "Sin asignar"}
                  </dd>
                </div>
                {valores.observaciones ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Observaciones</dt>
                    <dd className="text-sm">{valores.observaciones}</dd>
                  </div>
                ) : null}
              </dl>

              <ItemsTransferenciaTable
                items={items}
                onCantidadChange={actualizarCantidad}
                onRemove={quitarItem}
                readOnly
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total a transferir</span>
                <span className="font-semibold tabular-nums">
                  {formatNumber(totalUnidades)} unidades
                </span>
              </div>

              <Separator />
              <div className="flex flex-wrap justify-between gap-3">
                <Button type="button" variant="outline" onClick={() => setPaso(1)}>
                  Volver
                </Button>
                <Button
                  type="button"
                  onClick={() => void confirmar()}
                  disabled={crearTransferencia.isPending}
                >
                  {crearTransferencia.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Confirmando…
                    </>
                  ) : (
                    "Confirmar transferencia"
                  )}
                </Button>
              </div>
            </>
          ) : null}
        </div>

        <SeleccionProductosDialog
          open={selectorAbierto}
          onOpenChange={setSelectorAbierto}
          sucursalOrigenId={valores.sucursalOrigenId}
          itemsActuales={items}
          onConfirm={(nuevos) => setItems((actuales) => [...actuales, ...nuevos])}
        />
      </DialogContent>
    </Dialog>
  );
}
