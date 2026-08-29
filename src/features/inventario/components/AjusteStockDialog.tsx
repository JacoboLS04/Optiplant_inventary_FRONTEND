import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { formatNumber } from "@/lib/format";
import { useAjusteStock } from "../hooks/useInventario";
import type { Producto, TipoAjuste } from "../types";

interface AjusteStockForm {
  productoId: string;
  cantidad: string;
  motivo: string;
}

const VALORES_INICIALES: AjusteStockForm = {
  productoId: "",
  cantidad: "",
  motivo: "",
};

interface AjusteStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: TipoAjuste;
  productos: Producto[];
}

export function AjusteStockDialog({
  open,
  onOpenChange,
  tipo,
  productos,
}: AjusteStockDialogProps) {
  const ajusteStock = useAjusteStock();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AjusteStockForm>({ defaultValues: VALORES_INICIALES });

  // El select de producto es un Controller: cada cambio re-renderiza y la
  // lectura queda actualizada sin suscribirse con `watch`.
  const productoSeleccionado = productos.find(
    (producto) => producto.id === getValues("productoId")
  );

  const cerrar = (siguiente: boolean) => {
    if (!siguiente) reset(VALORES_INICIALES);
    onOpenChange(siguiente);
  };

  const onSubmit = handleSubmit(async (values) => {
    const producto = await ajusteStock.mutateAsync({
      productoId: values.productoId,
      tipo,
      cantidad: Number(values.cantidad),
      motivo: values.motivo.trim(),
    });

    toast.success(
      tipo === "entrada"
        ? "Entrada registrada"
        : tipo === "merma"
          ? "Merma registrada"
          : "Salida registrada",
      {
        description: `${producto.nombre}: ${formatNumber(producto.stock)} unidades disponibles.`,
      }
    );
    cerrar(false);
  });

  const esEntrada = tipo === "entrada";
  const esMerma = tipo === "merma";

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {esEntrada
              ? "Registrar entrada de stock"
              : esMerma
                ? "Registrar merma"
                : "Registrar salida de stock"}
          </DialogTitle>
          <DialogDescription>
            {esEntrada
              ? "Suma unidades a la existencia de un producto."
              : esMerma
                ? "Descuenta unidades de la existencia por pérdida, daño o caducidad."
                : "Descuenta unidades de la existencia de un producto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            id="ajuste-producto"
            label="Producto"
            error={errors.productoId?.message}
            hint={
              productoSeleccionado
                ? `Existencia actual: ${formatNumber(productoSeleccionado.stock)} unidades en ${productoSeleccionado.sucursal}`
                : undefined
            }
          >
            <Controller
              control={control}
              name="productoId"
              rules={{ required: "Selecciona un producto" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="ajuste-producto"
                    aria-invalid={Boolean(errors.productoId)}
                  >
                    <SelectValue placeholder="Busca un producto" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        {producto.sku} · {producto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="ajuste-cantidad"
            label="Cantidad"
            error={errors.cantidad?.message}
          >
            <Input
              id="ajuste-cantidad"
              type="number"
              min={1}
              aria-invalid={Boolean(errors.cantidad)}
              {...register("cantidad", {
                required: "Indica la cantidad",
                min: { value: 1, message: "Debe ser mayor que cero" },
                validate: (value) =>
                  esEntrada ||
                  !productoSeleccionado ||
                  Number(value) <= productoSeleccionado.stock ||
                  "La cantidad supera la existencia disponible",
              })}
            />
          </FormField>

          <FormField id="ajuste-motivo" label="Motivo" error={errors.motivo?.message}>
            <Textarea
              id="ajuste-motivo"
              rows={3}
              aria-invalid={Boolean(errors.motivo)}
              {...register("motivo", { required: "Describe el motivo del ajuste" })}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => cerrar(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={ajusteStock.isPending}>
              {ajusteStock.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Registrando…
                </>
              ) : esEntrada ? (
                "Registrar entrada"
              ) : esMerma ? (
                "Registrar merma"
              ) : (
                "Registrar salida"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
