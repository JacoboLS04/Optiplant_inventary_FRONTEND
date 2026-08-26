import type { StatusTone } from "@/components/shared/StatusBadge";
import type { EstadoStock } from "../types";

export function resolverEstadoStock(
  stock: number,
  stockMinimo: number
): EstadoStock {
  if (stock <= 0) return "agotado";
  if (stock < stockMinimo * 0.5) return "critico";
  if (stock < stockMinimo) return "bajo";
  return "disponible";
}

export const ESTADO_STOCK_LABEL: Record<EstadoStock, string> = {
  disponible: "Disponible",
  bajo: "Stock bajo",
  critico: "Stock crítico",
  agotado: "Agotado",
};

export const ESTADO_STOCK_TONE: Record<EstadoStock, StatusTone> = {
  disponible: "success",
  bajo: "warning",
  critico: "danger",
  agotado: "neutral",
};
