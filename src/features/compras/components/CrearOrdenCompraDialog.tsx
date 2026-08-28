import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/shared/FormField";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { formatCurrency, formatNumber } from "@/lib/format";
import { useCrearOrdenCompra, useProveedores } from "../hooks/useCompras";
import {
  SeleccionProductosOrdenDialog,
  type ItemOrdenEnCreacion,
} from "./SeleccionProductosOrdenDialog";

interface OrdenForm {
  proveedorId: string;
  sucursalDestinoId: string;
  fechaEntregaEstimada: string;
  transportista: string;
  guia: string;
  condicionesPago: string;
}

/** Línea editable dentro del diálogo (fuera de RHF, como en Transferencias). */
export interface LineaOrdenForm {
  key: string;
  productoId: string;
  sku: string;
  nombre: string;
  cantidadOrdenada: number;
  precioUnitario: number;
  descuento: number;
}

const VALORES_INICIALES: OrdenForm = {
  proveedorId: "",
  sucursalDestinoId: "",
  fechaEntregaEstimada: "",
  transportista: "",
  guia: "",
  condicionesPago: "",
};

function nuevoKey(productoId: string, indice: number): string {
  return `${productoId}-${Date.now()}-${indice}`;
}

interface CrearOrdenCompraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrearOrdenCompraDialog({
  open,
  onOpenChange,
}: CrearOrdenCompraDialogProps) {
  const { data: proveedores = [] } = useProveedores();
  const { data: sucursales = [] } = useSucursales();
  const crearOrden = useCrearOrdenCompra();

  const [lineas, setLineas] = useState<LineaOrdenForm[]>([]);
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OrdenForm>({ defaultValues: VALORES_INICIALES });

  const cerrar = (siguiente: boolean) => {
    if (!siguiente) {
      reset(VALORES_INICIALES);
      setLineas([]);
    }
    onOpenChange(siguiente);
  };

  const agregarProductos = (nuevos: ItemOrdenEnCreacion[]) => {
    setLineas((actuales) => [
      ...actuales,
      ...nuevos.map((item, indice) => ({
        key: nuevoKey(item.productoId, indice),
        productoId: item.productoId,
        sku: item.sku,
        nombre: item.nombre,
        cantidadOrdenada: 1,
        precioUnitario: item.precioUnitario,
        descuento: 0,
      })),
    ]);
  };

  const cambiarCampo = (
    key: string,
    campo: Partial<LineaOrdenForm>
  ) => {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.key === key ? { ...linea, ...campo } : linea
      )
    );
  };

  const quitarLinea = (key: string) => {
    setLineas((actuales) => actuales.filter((linea) => linea.key !== key));
  };

  const total = lineas.reduce(
    (acc, linea) =>
      acc + linea.cantidadOrdenada * (linea.precioUnitario - linea.descuento),
    0
  );

  const onSubmit = handleSubmit(async (values) => {
    if (lineas.length === 0) {
      toast.error("Agrega al menos una línea de producto");
      return;
    }
    await crearOrden.mutateAsync({
      proveedorId: values.proveedorId,
      sucursalDestinoId: values.sucursalDestinoId,
      fechaEntregaEstimada: values.fechaEntregaEstimada
        ? new Date(values.fechaEntregaEstimada).toISOString()
        : undefined,
      transportista: values.transportista.trim() || undefined,
      guia: values.guia.trim() || undefined,
      condicionesPago: values.condicionesPago.trim() || undefined,
      lineas: lineas.map((linea) => ({
        productoId: linea.productoId,
        cantidadOrdenada: linea.cantidadOrdenada,
        precioUnitario: linea.precioUnitario,
        descuento: linea.descuento,
      })),
    });

    toast.success("Orden de compra creada", {
      description: "La orden quedó registrada como borrador.",
    });
    cerrar(false);
  });

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nueva orden de compra</DialogTitle>
          <DialogDescription>
            Define el proveedor, la sucursal de destino y las líneas de la
            orden. Se crea como borrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="orden-proveedor"
              label="Proveedor"
              error={errors.proveedorId?.message}
            >
              <Controller
                control={control}
                name="proveedorId"
                rules={{ required: "Selecciona un proveedor" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="orden-proveedor"
                      aria-invalid={Boolean(errors.proveedorId)}
                    >
                      <SelectValue placeholder="Selecciona el proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              id="orden-sucursal"
              label="Sucursal de destino"
              error={errors.sucursalDestinoId?.message}
            >
              <Controller
                control={control}
                name="sucursalDestinoId"
                rules={{ required: "Selecciona la sucursal de destino" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="orden-sucursal"
                      aria-invalid={Boolean(errors.sucursalDestinoId)}
                    >
                      <SelectValue placeholder="Selecciona la sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      {sucursales.map((sucursal) => (
                        <SelectItem key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              id="orden-fecha"
              label="Entrega estimada"
              hint="Opcional"
            >
              <Input
                id="orden-fecha"
                type="date"
                {...register("fechaEntregaEstimada")}
              />
            </FormField>

            <FormField id="orden-transportista" label="Transportista" hint="Opcional">
              <Input id="orden-transportista" {...register("transportista")} />
            </FormField>

            <FormField id="orden-guia" label="Guía" hint="Opcional">
              <Input id="orden-guia" {...register("guia")} />
            </FormField>

            <FormField
              id="orden-condiciones"
              label="Condiciones de pago"
              hint="Opcional"
            >
              <Input
                id="orden-condiciones"
                placeholder="P. ej. Contado"
                {...register("condicionesPago")}
              />
            </FormField>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Líneas de la orden</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectorAbierto(true)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar productos
              </Button>
            </div>

            {lineas.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                Aún no hay productos. Usa «Agregar productos» para incluir
                líneas.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">P. unitario</TableHead>
                    <TableHead className="text-right">Descuento</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-10" aria-label="Acciones" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineas.map((linea) => (
                    <TableRow key={linea.key}>
                      <TableCell className="max-w-[16rem] whitespace-normal">
                        <span className="block font-medium">{linea.nombre}</span>
                        <span className="block text-xs text-muted-foreground">
                          {linea.sku}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={1}
                          value={linea.cantidadOrdenada}
                          onChange={(e) =>
                            cambiarCampo(linea.key, {
                              cantidadOrdenada: Number(e.target.value),
                            })
                          }
                          className="ml-auto h-8 w-20 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          value={linea.precioUnitario}
                          onChange={(e) =>
                            cambiarCampo(linea.key, {
                              precioUnitario: Number(e.target.value),
                            })
                          }
                          className="ml-auto h-8 w-24 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          value={linea.descuento}
                          onChange={(e) =>
                            cambiarCampo(linea.key, {
                              descuento: Number(e.target.value),
                            })
                          }
                          className="ml-auto h-8 w-20 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(
                          linea.cantidadOrdenada *
                            (linea.precioUnitario - linea.descuento)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => quitarLinea(linea.key)}
                          aria-label={`Quitar ${linea.nombre} de la orden`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {lineas.length > 0 ? (
              <p className="ml-auto w-fit text-sm font-semibold tabular-nums">
                Total: {formatCurrency(total)}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => cerrar(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crearOrden.isPending}>
              {crearOrden.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creando…
                </>
              ) : (
                "Crear orden"
              )}
            </Button>
          </DialogFooter>
        </form>

        <SeleccionProductosOrdenDialog
          open={selectorAbierto}
          onOpenChange={setSelectorAbierto}
          itemsActuales={lineas.map((linea) => ({
            productoId: linea.productoId,
            sku: linea.sku,
            nombre: linea.nombre,
            precioUnitario: linea.precioUnitario,
          }))}
          onConfirm={agregarProductos}
        />
      </DialogContent>
    </Dialog>
  );
}
