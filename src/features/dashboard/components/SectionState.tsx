import { AlertCircle, RefreshCw, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function ErrorState({
  title = "No se pudo cargar la información",
  description = "Revisa tu conexión e inténtalo de nuevo.",
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center",
        className
      )}
    >
      <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
      >
        <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
        {isRetrying ? "Reintentando…" : "Reintentar"}
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-secondary/40 px-6 py-10 text-center",
        className
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
