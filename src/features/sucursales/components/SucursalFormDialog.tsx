import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, MapPin, Store } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { mensajeDeError } from "@/lib/api-error";
import { zodResolver } from "@/lib/zod-resolver";
import { useActualizarSucursal, useCrearSucursal } from "../hooks/useSucursales";
import type { Sucursal } from "../types";

interface SucursalFormValues {
  nombre: string;
  direccion: string;
}

const schema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  direccion: z.string(),
});

interface SucursalFormProps {
  sucursal: Sucursal | null;
  onCerrar: () => void;
}

/** Se monta solo con el diálogo abierto para que los valores partan limpios. */
function SucursalForm({ sucursal, onCerrar }: SucursalFormProps) {
  const crear = useCrearSucursal();
  const actualizar = useActualizarSucursal();

  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const resolver = useMemo(() => zodResolver<SucursalFormValues>(schema), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SucursalFormValues>({
    resolver,
    defaultValues: {
      nombre: sucursal?.nombre ?? "",
      direccion: sucursal?.direccion ?? "",
    },
  });

  const onSubmit = handleSubmit(async (valores) => {
    setErrorServidor(null);
    const nombre = valores.nombre.trim();
    const direccion = valores.direccion.trim() || undefined;

    try {
      if (sucursal) {
        await actualizar.mutateAsync({
          id: sucursal.id,
          payload: { nombre, direccion },
        });
        toast.success("Sucursal actualizada", {
          description: `Se guardaron los cambios de ${nombre}.`,
        });
      } else {
        await crear.mutateAsync({ nombre, direccion });
        toast.success("Sucursal creada", {
          description: `${nombre} quedó registrada en el sistema.`,
        });
      }

      onCerrar();
    } catch (error) {
      setErrorServidor(
        mensajeDeError(
          error,
          sucursal
            ? "No se pudo actualizar la sucursal."
            : "No se pudo crear la sucursal."
        )
      );
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {errorServidor ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorServidor}
        </div>
      ) : null}

      <FormField id="sucursal-nombre" label="Nombre" error={errors.nombre?.message}>
        <div className="relative">
          <Store
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="sucursal-nombre"
            className="pl-9"
            aria-invalid={Boolean(errors.nombre)}
            {...register("nombre")}
          />
        </div>
      </FormField>

      <FormField
        id="sucursal-direccion"
        label="Dirección"
        error={errors.direccion?.message}
        hint={sucursal ? undefined : "Opcional."}
      >
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="sucursal-direccion"
            className="pl-9"
            aria-invalid={Boolean(errors.direccion)}
            {...register("direccion")}
          />
        </div>
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Guardando…
            </>
          ) : sucursal ? (
            "Guardar cambios"
          ) : (
            "Crear sucursal"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface SucursalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sucursal a editar; `null` abre el formulario de creación. */
  sucursal: Sucursal | null;
}

export function SucursalFormDialog({
  open,
  onOpenChange,
  sucursal,
}: SucursalFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {sucursal ? "Editar sucursal" : "Nueva sucursal"}
          </DialogTitle>
          <DialogDescription>
            {sucursal
              ? "Actualiza los datos generales de esta sucursal."
              : "Registra una nueva sucursal dentro de la organización."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <SucursalForm
            sucursal={sucursal}
            onCerrar={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
