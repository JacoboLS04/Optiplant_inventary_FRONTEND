import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CarritoVenta } from "../components/CarritoVenta";
import { CatalogoProductos } from "../components/CatalogoProductos";
import { DescuentoDialog } from "../components/DescuentoDialog";
import { HistorialVentas } from "../components/HistorialVentas";
import { useRegistrarVenta } from "../hooks/useVentas";
import type { LineaVenta, ProductoVenta } from "../types";

type VistaVentas = "nueva" | "historial";

export default function Ventas() {
  const registrarVenta = useRegistrarVenta();
  const [vista, setVista] = useState<VistaVentas>("nueva");

  const [lineas, setLineas] = useState<LineaVenta[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [dialogoDescuento, setDialogoDescuento] = useState(false);

  const sucursalActiva = lineas[0]?.sucursalId;
  const sucursalNombre = lineas[0]?.sucursal;

  const subtotal = useMemo(
    () =>
      lineas.reduce(
        (acc, linea) => acc + linea.precioUnitario * linea.cantidad,
        0
      ),
    [lineas]
  );
  const total = Math.round(subtotal * (1 - descuento / 100));

  const cantidadesEnCarrito = useMemo(
    () =>
      Object.fromEntries(
        lineas.map((linea) => [linea.productoId, linea.cantidad])
      ),
    [lineas]
  );

  const agregar = (producto: ProductoVenta) => {
    if (sucursalActiva && sucursalActiva !== producto.sucursalId) {
      toast.error("Sucursal distinta", {
        description:
          "Una venta solo puede incluir productos de una misma sucursal. Vacía la venta para cambiar de sede.",
      });
      return;
    }

    setLineas((actuales) => {
      const existente = actuales.find(
        (linea) => linea.productoId === producto.productoId
      );

      if (existente) {
        return actuales.map((linea) =>
          linea.productoId === producto.productoId
            ? {
                ...linea,
                cantidad: Math.min(linea.cantidad + 1, linea.stockDisponible),
              }
            : linea
        );
      }

      return [
        ...actuales,
        {
          productoId: producto.productoId,
          sku: producto.sku,
          nombre: producto.nombre,
          sucursalId: producto.sucursalId,
          sucursal: producto.sucursal,
          precioUnitario: producto.precioUnitario,
          stockDisponible: producto.stockDisponible,
          cantidad: 1,
        },
      ];
    });
  };

  const cambiarCantidad = (productoId: string, cantidad: number) => {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.productoId === productoId
          ? {
              ...linea,
              cantidad: Math.max(
                1,
                Math.min(cantidad, linea.stockDisponible)
              ),
            }
          : linea
      )
    );
  };

  const vaciar = () => {
    setLineas([]);
    setDescuento(0);
  };

  const registrar = async () => {
    if (!sucursalActiva) return;

    const venta = await registrarVenta.mutateAsync({
      sucursalId: sucursalActiva,
      descuentoPorcentaje: descuento,
      lineas: lineas.map((linea) => ({
        productoId: linea.productoId,
        cantidad: linea.cantidad,
      })),
    });

    toast.success(`Venta ${venta.codigo} registrada`, {
      description: `Total ${formatCurrency(venta.total)} · existencias actualizadas.`,
    });
    vaciar();
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        title="Ventas"
        description="Registro de ventas y comprobantes sobre las existencias."
        actions={
          <div className="inline-flex rounded-lg border bg-background p-1">
            <button
              type="button"
              onClick={() => setVista("nueva")}
              aria-pressed={vista === "nueva"}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                vista === "nueva"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Nueva venta
            </button>
            <button
              type="button"
              onClick={() => setVista("historial")}
              aria-pressed={vista === "historial"}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                vista === "historial"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Historial
            </button>
          </div>
        }
      />

      {vista === "historial" ? (
        <HistorialVentas />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
            <CatalogoProductos
              onAgregar={agregar}
              cantidadesEnCarrito={cantidadesEnCarrito}
            />

            <CarritoVenta
              lineas={lineas}
              subtotal={subtotal}
              descuentoPorcentaje={descuento}
              total={total}
              sucursalNombre={sucursalNombre}
              isSubmitting={registrarVenta.isPending}
              onCantidadChange={cambiarCantidad}
              onQuitar={(productoId) =>
                setLineas((actuales) =>
                  actuales.filter((linea) => linea.productoId !== productoId)
                )
              }
              onAbrirDescuento={() => setDialogoDescuento(true)}
              onRegistrar={() => void registrar()}
              onVaciar={vaciar}
            />
          </div>

          <DescuentoDialog
            open={dialogoDescuento}
            onOpenChange={setDialogoDescuento}
            descuentoActual={descuento}
            onAplicar={setDescuento}
          />
        </>
      )}
    </div>
  );
}
