import { Controller, useForm } from "react-hook-form";
import { Loader2, Pencil } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategorias } from "@/features/catalogos/hooks/useCatalogos";
import { formatNumber } from "@/lib/format";
import { useActualizarProducto } from "../hooks/useInventario";
import type { Producto } from "../types";

interface EditarProductoForm {
  nombre: string;
  descripcion: string;
  categoriaId: string;
  precioUnitario: string;
  stockMinimo: string;
}

interface EditarProductoDialogProps {
  producto: Producto | null;
  onOpenChange: (open: boolean) => void;
}

export function EditarProductoDialog({
  producto,
  onOpenChange,
}: EditarProductoDialogProps) {
  const { data: categorias = [] } = useCategorias();
  const actualizar = useActualizarProducto();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditarProductoForm>({
    values: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      categoriaId: producto?.categoriaId ?? "",
      precioUnitario: String(producto?.precioUnitario ?? 0),
      stockMinimo: String(producto?.stockMinimo ?? 0),
    },
  });

  const abierto = producto !== null;

  const cerrar = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!producto) return;
    await actualizar.mutateAsync({
      id: producto.id,
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
      categoriaId: values.categoriaId,
      precioUnitario: Number(values.precioUnitario),
      stockMinimo: Number(values.stockMinimo),
    });

    toast.success("Producto actualizado", {
      description: `${values.nombre.trim()} guardado correctamente.`,
    });
    cerrar();
  });

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && cerrar()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" aria-hidden="true" />
            Editar producto
          </DialogTitle>
          <DialogDescription>
            Actualiza los datos del producto. El stock se gestiona desde
            "Gestionar stock".
          </DialogDescription>
        </DialogHeader>

        {producto ? (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="text-sm font-medium">{producto.sku}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Sucursal / Existencia</p>
                <p className="text-sm font-medium">
                  {producto.sucursal} · {formatNumber(producto.stock)} unidades
                </p>
              </div>

              <FormField
                id="edit-nombre"
                label="Nombre"
                error={errors.nombre?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="edit-nombre"
                  aria-invalid={Boolean(errors.nombre)}
                  {...register("nombre", { required: "El nombre es obligatorio" })}
                />
              </FormField>

              <FormField
                id="edit-descripcion"
                label="Descripción"
                error={errors.descripcion?.message}
                className="sm:col-span-2"
                hint="Opcional"
              >
                <Textarea
                  id="edit-descripcion"
                  rows={3}
                  placeholder="Detalles del producto…"
                  aria-invalid={Boolean(errors.descripcion)}
                  {...register("descripcion")}
                />
              </FormField>

              <FormField
                id="edit-categoria"
                label="Categoría"
                error={errors.categoriaId?.message}
              >
                <Controller
                  control={control}
                  name="categoriaId"
                  rules={{ required: "Selecciona una categoría" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="edit-categoria"
                        aria-invalid={Boolean(errors.categoriaId)}
                      >
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                id="edit-precio"
                label="Precio unitario (COP)"
                error={errors.precioUnitario?.message}
              >
                <Input
                  id="edit-precio"
                  type="number"
                  min={0}
                  aria-invalid={Boolean(errors.precioUnitario)}
                  {...register("precioUnitario", {
                    required: "Indica el precio unitario",
                    min: { value: 0, message: "No puede ser negativo" },
                  })}
                />
              </FormField>

              <FormField
                id="edit-stock-minimo"
                label="Stock mínimo"
                error={errors.stockMinimo?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="edit-stock-minimo"
                  type="number"
                  min={0}
                  aria-invalid={Boolean(errors.stockMinimo)}
                  {...register("stockMinimo", {
                    required: "Indica el stock mínimo",
                    min: { value: 0, message: "No puede ser negativo" },
                  })}
                />
              </FormField>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={cerrar}>
                Cancelar
              </Button>
              <Button type="submit" disabled={actualizar.isPending}>
                {actualizar.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Guardando…
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
