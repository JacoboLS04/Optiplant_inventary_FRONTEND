import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatSignedNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useRecentMovements } from "../hooks/useDashboardQueries";
import type { InventoryMovement, MovementType } from "../types";
import { EmptyState, ErrorState } from "./SectionState";

const MOVEMENT_LABELS: Record<MovementType, string> = {
  entrada: "Entrada",
  salida: "Salida",
  transferencia: "Transferencia",
  ajuste: "Ajuste",
};

const MOVEMENT_VARIANTS: Record<
  MovementType,
  "default" | "secondary" | "outline" | "warning"
> = {
  entrada: "default",
  salida: "secondary",
  transferencia: "outline",
  ajuste: "warning",
};

function MovementRow({ movement }: { movement: InventoryMovement }) {
  return (
    <TableRow>
      <TableCell className="max-w-[16rem] whitespace-normal">
        <span className="block font-medium">{movement.product}</span>
        <span className="block text-xs text-muted-foreground">
          {movement.sku}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={MOVEMENT_VARIANTS[movement.type]}>
          {MOVEMENT_LABELS[movement.type]}
        </Badge>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {movement.branch}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-medium tabular-nums",
          movement.quantity >= 0 ? "text-emerald-700" : "text-destructive"
        )}
      >
        {formatSignedNumber(movement.quantity)}
      </TableCell>
      <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
        {formatDateTime(movement.date)}
      </TableCell>
    </TableRow>
  );
}

function MovementsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="hidden h-9 w-28 sm:block" />
          <Skeleton className="h-9 w-16" />
        </div>
      ))}
    </div>
  );
}

export function RecentMovementsCard() {
  const { data, isPending, isError, isFetching, refetch } =
    useRecentMovements();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Últimos movimientos de inventario</CardTitle>
        <CardDescription>
          Entradas, salidas, transferencias y ajustes registrados recientemente.
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link to="/inventario">Ver inventario</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <MovementsSkeleton />
        ) : isError ? (
          <ErrorState
            title="No se pudieron cargar los movimientos"
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin movimientos registrados"
            description="Cuando se registren entradas, salidas o transferencias aparecerán aquí."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">
                  Sucursal / ruta
                </TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Fecha
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((movement) => (
                <MovementRow key={movement.id} movement={movement} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
