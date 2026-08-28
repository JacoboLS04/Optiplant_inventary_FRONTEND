import type { StatusTone } from "@/components/shared/StatusBadge";
import type { Step } from "@/components/shared/Stepper";
import type { EstadoOrdenCompra } from "../types";

export const ESTADO_ORDEN_LABEL: Record<EstadoOrdenCompra, string> = {
  borrador: "Borrador",
  enviada: "Enviada al proveedor",
  en_transito: "En tránsito",
  recibida: "Recibida",
  cancelada: "Cancelada",
};

export const ESTADO_ORDEN_TONE: Record<EstadoOrdenCompra, StatusTone> = {
  borrador: "neutral",
  enviada: "info",
  en_transito: "warning",
  recibida: "success",
  cancelada: "danger",
};

/** Etapas del envío que se muestran en la tarjeta de cada orden. */
export const ETAPAS_ENVIO: Step[] = [
  { id: "borrador", label: "Borrador" },
  { id: "enviada", label: "Enviada" },
  { id: "en_transito", label: "En tránsito" },
  { id: "recibida", label: "Recibida" },
];

export function etapaActual(estado: EstadoOrdenCompra): number {
  const indice = ETAPAS_ENVIO.findIndex((etapa) => etapa.id === estado);
  return indice === -1 ? 0 : indice;
}

/** Acciones de cambio de estado que el backend acepta según el estado actual
 *  (mapeadas de la máquina de estados: BORRADOR -> ENVIADA -> EN_TRANSITO ->
 *  RECIBIDA, y CANCELADA permitida desde BORRADOR/ENVIADA). */
export type AccionOrden =
  | "enviar"
  | "marcarEnTransito"
  | "marcarRecibida"
  | "cancelar"
  | "registrarRecepcion";

export const ACCIONES_DISPONIBLES: Record<
  EstadoOrdenCompra,
  AccionOrden[]
> = {
  borrador: ["enviar", "cancelar"],
  enviada: ["marcarEnTransito", "cancelar", "registrarRecepcion"],
  en_transito: ["marcarRecibida", "registrarRecepcion"],
  recibida: [],
  cancelada: [],
};

/** Destino de cada acción de cambio de estado. */
export const DESTINO_ACCION: Partial<Record<AccionOrden, EstadoOrdenCompra>> = {
  enviar: "enviada",
  marcarEnTransito: "en_transito",
  marcarRecibida: "recibida",
  cancelar: "cancelada",
};
