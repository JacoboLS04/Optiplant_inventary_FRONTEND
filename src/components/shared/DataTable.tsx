import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ErrorState } from "./SectionState";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Clases aplicadas tanto a la celda como a su encabezado. */
  className?: string;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  errorTitle?: string;
  emptyState?: React.ReactNode;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  isError = false,
  onRetry,
  errorTitle,
  emptyState,
  skeletonRows = 6,
}: DataTableProps<T>) {
  if (isError && onRetry) {
    return <ErrorState title={errorTitle} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {Array.from({ length: skeletonRows }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.id}
              className={cn(
                column.align === "right" && "text-right",
                column.className
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={rowKey(row)}>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                className={cn(
                  column.align === "right" && "text-right",
                  column.className
                )}
              >
                {column.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
