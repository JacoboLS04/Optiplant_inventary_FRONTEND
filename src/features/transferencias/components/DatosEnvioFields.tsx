import { Controller, type UseFormReturn } from "react-hook-form";

import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import type { TransferenciaFormValues } from "../types";

interface DatosEnvioFieldsProps {
  form: UseFormReturn<TransferenciaFormValues>;
}

export function DatosEnvioFields({ form }: DatosEnvioFieldsProps) {
  const { data: sucursales = [] } = useSucursales();
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const origenSeleccionado = watch("sucursalOrigenId");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        id="transferencia-origen"
        label="Sucursal de origen"
        error={errors.sucursalOrigenId?.message}
      >
        <Controller
          control={control}
          name="sucursalOrigenId"
          rules={{ required: "Selecciona la sucursal de origen" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="transferencia-origen"
                aria-invalid={Boolean(errors.sucursalOrigenId)}
              >
                <SelectValue placeholder="Selecciona el origen" />
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
        id="transferencia-destino"
        label="Sucursal de destino"
        error={errors.sucursalDestinoId?.message}
      >
        <Controller
          control={control}
          name="sucursalDestinoId"
          rules={{
            required: "Selecciona la sucursal de destino",
            validate: (value) =>
              value !== origenSeleccionado ||
              "El destino debe ser distinto del origen",
          }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="transferencia-destino"
                aria-invalid={Boolean(errors.sucursalDestinoId)}
              >
                <SelectValue placeholder="Selecciona el destino" />
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
        id="transferencia-fecha"
        label="Fecha de envío"
        error={errors.fechaEnvio?.message}
      >
        <Input
          id="transferencia-fecha"
          type="date"
          aria-invalid={Boolean(errors.fechaEnvio)}
          {...register("fechaEnvio", { required: "Indica la fecha de envío" })}
        />
      </FormField>

      <FormField
        id="transferencia-responsable"
        label="Responsable del despacho"
        error={errors.responsable?.message}
      >
        <Input
          id="transferencia-responsable"
          aria-invalid={Boolean(errors.responsable)}
          {...register("responsable", { required: "Indica el responsable" })}
        />
      </FormField>

      <FormField
        id="transferencia-transportador"
        label="Transportador"
        hint="Opcional"
      >
        <Input id="transferencia-transportador" {...register("transportador")} />
      </FormField>

      <FormField
        id="transferencia-observaciones"
        label="Observaciones"
        hint="Opcional"
      >
        <Textarea
          id="transferencia-observaciones"
          rows={2}
          {...register("observaciones")}
        />
      </FormField>
    </div>
  );
}
