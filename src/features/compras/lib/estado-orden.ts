import type { StatusTone } from "@/components/shared/StatusBadge";
import type { Step } from "@/components/shared/Stepper";
import type { EstadoOrdenCompra } from "../types";

export const ESTADO_ORDEN_LABEL: Record<EstadoOrdenCompra, string> = {
  borrador: "Borrador",
  enviada: "Enviada al proveedor",
  confirmada: "Confirmada por el proveedor",
  en_transito: "En tránsito",
  recibida: "Recibida",
  cancelada: "Cancelada",
};

export const ESTADO_ORDEN_TONE: Record<EstadoOrdenCompra, StatusTone> = {
  borrador: "neutral",
  enviada: "info",
  confirmada: "info",
  en_transito: "warning",
  recibida: "success",
  cancelada: "danger",
};

/** Etapas del envío que se muestran en la tarjeta de cada orden. */
export const ETAPAS_ENVIO: Step[] = [
  { id: "borrador", label: "Borrador" },
  { id: "enviada", label: "Enviada" },
  { id: "confirmada", label: "Confirmada" },
  { id: "en_transito", label: "En tránsito" },
  { id: "recibida", label: "Recibida" },
];

export function etapaActual(estado: EstadoOrdenCompra): number {
  const indice = ETAPAS_ENVIO.findIndex((etapa) => etapa.id === estado);
  return indice === -1 ? 0 : indice;
}

/** Acciones de cambio de estado que el backend acepta según el estado actual
 *  (mapeadas de la máquina de estados: BORRADOR -> ENVIADA -> CONFIRMADA ->
 *  EN_TRANSITO -> RECIBIDA. CONFIRMADA y EN_TRANSITO las ejecuta el proveedor
 *  desde su portal; el usuario interno solo envía, cancela y recibe). */
export type AccionOrden =
  | "enviar"
  | "cancelar"
  | "registrarRecepcion";

export const ACCIONES_DISPONIBLES: Record<
  EstadoOrdenCompra,
  AccionOrden[]
> = {
  borrador: ["enviar", "cancelar"],
  enviada: ["cancelar"],
  confirmada: ["cancelar"],
  en_transito: ["registrarRecepcion"],
  recibida: [],
  cancelada: [],
};

/** Destino de cada acción de cambio de estado. */
export const DESTINO_ACCION: Partial<Record<AccionOrden, EstadoOrdenCompra>> = {
  enviar: "enviada",
  cancelar: "cancelada",
};
