import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

/** Ventana de máximo 3 números de página centrada en la página actual. */
function visiblePages(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  return Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i);
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = "registros",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Mostrando {formatNumber(first)}–{formatNumber(last)} de{" "}
        {formatNumber(totalItems)} {itemLabel}
      </p>

      <nav className="flex items-center gap-1" aria-label="Paginación">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages(page, totalPages).map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === page ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onPageChange(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}
            aria-label={`Página ${pageNumber}`}
            className={cn(pageNumber === page && "font-semibold")}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
