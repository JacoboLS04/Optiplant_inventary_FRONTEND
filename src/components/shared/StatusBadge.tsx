import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * Tono semántico compartido por los estados de los distintos módulos
 * (stock, órdenes de compra, transferencias, ventas) para que un mismo
 * significado use siempre el mismo color en toda la aplicación.
 */
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_VARIANT: Record<
  StatusTone,
  "default" | "warning" | "destructive" | "info" | "secondary"
> = {
  success: "default",
  warning: "warning",
  danger: "destructive",
  info: "info",
  neutral: "secondary",
};

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
  icon?: LucideIcon;
}

export function StatusBadge({ tone, label, icon: Icon }: StatusBadgeProps) {
  return (
    <Badge variant={TONE_VARIANT[tone]}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {label}
    </Badge>
  );
}
