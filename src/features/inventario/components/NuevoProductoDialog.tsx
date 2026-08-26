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
import {
  useCategorias,
  useSucursales,
} from "@/features/catalogos/hooks/useCatalogos";
import { useCrearProducto } from "../hooks/useInventario";

interface NuevoProductoForm {
  sku: string;
  nombre: string;
  categoriaId: string;
  sucursalId: string;
  stock: string;
  stockMinimo: string;
  precioUnitario: string;
}

const VALORES_INICIALES: NuevoProductoForm = {
  sku: "",
  nombre: "",
  categoriaId: "",
  sucursalId: "",
  stock: "",
  stockMinimo: "",
  precioUnitario: "",
};

interface NuevoProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NuevoProductoDialog({
  open,
  onOpenChange,
}: NuevoProductoDialogProps) {
  const { data: categorias = [] } = useCategorias();
  const { data: sucursales = [] } = useSucursales();
  const crearProducto = useCrearProducto();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NuevoProductoForm>({ defaultValues: VALORES_INICIALES });

  const cerrar = (siguiente: boolean) => {
    if (!siguiente) reset(VALORES_INICIALES);
    onOpenChange(siguiente);
  };

  const onSubmit = handleSubmit(async (values) => {
    await crearProducto.mutateAsync({
      sku: values.sku.trim().toUpperCase(),
      nombre: values.nombre.trim(),
      categoriaId: values.categoriaId,
      sucursalId: values.sucursalId,
      stock: Number(values.stock),
      stockMinimo: Number(values.stockMinimo),
      precioUnitario: Number(values.precioUnitario),
    });

    toast.success("Producto creado", {
      description: `${values.nombre.trim()} se agregó al inventario.`,
    });
    cerrar(false);
  });

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
          <DialogDescription>
            Registra un producto y su existencia inicial en una sucursal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="producto-sku" label="SKU" error={errors.sku?.message}>
              <Input
                id="producto-sku"
                placeholder="FRT-0001"
                aria-invalid={Boolean(errors.sku)}
                {...register("sku", { required: "El SKU es obligatorio" })}
              />
            </FormField>

            <FormField
              id="producto-nombre"
              label="Nombre"
              error={errors.nombre?.message}
            >
              <Input
                id="producto-nombre"
                aria-invalid={Boolean(errors.nombre)}
                {...register("nombre", { required: "El nombre es obligatorio" })}
              />
            </FormField>

            <FormField
              id="producto-categoria"
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
                      id="producto-categoria"
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
              id="producto-sucursal"
              label="Sucursal"
              error={errors.sucursalId?.message}
            >
              <Controller
                control={control}
                name="sucursalId"
                rules={{ required: "Selecciona una sucursal" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="producto-sucursal"
                      aria-invalid={Boolean(errors.sucursalId)}
                    >
                      <SelectValue placeholder="Selecciona una sucursal" />
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
              id="producto-stock"
              label="Existencia inicial"
              error={errors.stock?.message}
            >
              <Input
                id="producto-stock"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.stock)}
                {...register("stock", {
                  required: "Indica la existencia inicial",
                  min: { value: 0, message: "No puede ser negativa" },
                })}
              />
            </FormField>

            <FormField
              id="producto-stock-minimo"
              label="Stock mínimo"
              error={errors.stockMinimo?.message}
            >
              <Input
                id="producto-stock-minimo"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.stockMinimo)}
                {...register("stockMinimo", {
                  required: "Indica el stock mínimo",
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
            </FormField>

            <FormField
              id="producto-precio"
              label="Precio unitario (COP)"
              error={errors.precioUnitario?.message}
              className="sm:col-span-2"
            >
              <Input
                id="producto-precio"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.precioUnitario)}
                {...register("precioUnitario", {
                  required: "Indica el precio unitario",
                  min: { value: 0, message: "No puede ser negativo" },
                })}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => cerrar(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crearProducto.isPending}>
              {crearProducto.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Guardando…
                </>
              ) : (
                "Crear producto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
