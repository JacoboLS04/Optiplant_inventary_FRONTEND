import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Resolver mínimo de zod para react-hook-form. El proyecto no incluye
 * `@hookform/resolvers` y no se añaden dependencias nuevas, así que se traduce
 * el resultado de `safeParse` al formato de errores que espera RHF.
 */
export function zodResolver<TValues extends FieldValues>(
  schema: ZodType
): Resolver<TValues> {
  return (values) => {
    const resultado = schema.safeParse(values);

    if (resultado.success) {
      return { values, errors: {} };
    }

    const errors: Record<string, { type: string; message: string }> = {};

    for (const issue of resultado.error.issues) {
      const campo = issue.path.join(".");
      // Solo el primer error de cada campo: es el que se muestra bajo el input.
      if (campo && !errors[campo]) {
        errors[campo] = { type: issue.code, message: issue.message };
      }
    }

    return { values: {}, errors: errors as FieldErrors<TValues> };
  };
}
