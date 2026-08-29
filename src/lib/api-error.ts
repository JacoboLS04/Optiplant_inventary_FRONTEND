import axios from "axios";

/**
 * El backend responde los errores de negocio con `{ message }` (por ejemplo
 * email duplicado o combinación rol/sucursal inválida). Esta función extrae
 * ese mensaje y cae en un texto por defecto para errores de red o inesperados.
 */
export function mensajeDeError(error: unknown, respaldo: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;

    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }

    if (error.response?.status === 403) {
      return "No tienes permisos para realizar esta acción.";
    }

    if (!error.response) {
      return "No se pudo contactar al servidor. Revisa tu conexión.";
    }
  }

  return respaldo;
}
