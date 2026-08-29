import type { StatusTone } from "@/components/shared/StatusBadge";
import type {
  EstadoTransferencia,
  UrgenciaTransferencia,
} from "../types";

export const ESTADO_TRANSFERENCIA_LABEL: Record<EstadoTransferencia, string> = {
  SOLICITADA: "Solicitada",
  RECHAZADA: "Rechazada",
  APROBADA: "Aprobada",
  EN_PREPARACION: "En preparación",
  EN_TRANSITO: "En tránsito",
  RECIBIDA: "Recibida",
  CON_FALTANTES: "Con faltantes",
  CANCELADA: "Cancelada",
};

export const ESTADO_TRANSFERENCIA_TONE: Record<EstadoTransferencia, StatusTone> = {
  SOLICITADA: "info",
  RECHAZADA: "danger",
  APROBADA: "warning",
  EN_PREPARACION: "warning",
  EN_TRANSITO: "info",
  RECIBIDA: "success",
  CON_FALTANTES: "danger",
  CANCELADA: "neutral",
};

export const URGENCIA_LABEL: Record<UrgenciaTransferencia, string> = {
  BAJA: "Baja",
  NORMAL: "Normal",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

export const ESTADOS_TRANSFERENCIA = Object.keys(
  ESTADO_TRANSFERENCIA_LABEL
) as EstadoTransferencia[];

/** Definición de las acciones de flujo disponibles por estado (máquina de estado backend). */
export type AccionTransferencia =
  | "aprobarOrigen"
  | "aprobarDestino"
  | "rechazar"
  | "preparar"
  | "despachar"
  | "recibir"
  | "cancelar";

export const ACCIONES_DISPONIBLES: Record<
  EstadoTransferencia,
  AccionTransferencia[]
> = {
  SOLICITADA: ["aprobarOrigen", "aprobarDestino", "rechazar", "cancelar"],
  RECHAZADA: [],
  APROBADA: ["preparar", "cancelar"],
  EN_PREPARACION: ["despachar"],
  EN_TRANSITO: ["recibir"],
  RECIBIDA: [],
  CON_FALTANTES: [],
  CANCELADA: [],
};
