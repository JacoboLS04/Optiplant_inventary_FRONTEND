import type { Producto } from "../types";

const COLUMNAS = [
  "SKU",
  "Producto",
  "Categoría",
  "Sucursal",
  "Stock",
  "Stock mínimo",
  "Precio unitario",
  "Estado",
  "Actualizado",
] as const;

function escaparCelda(valor: string | number): string {
  const texto = String(valor);
  return /[",;\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** Genera y descarga un CSV con los productos actualmente filtrados. */
export function exportarProductosCsv(productos: Producto[]): void {
  const filas = productos.map((producto) =>
    [
      producto.sku,
      producto.nombre,
      producto.categoria,
      producto.sucursal,
      producto.stock,
      producto.stockMinimo,
      producto.precioUnitario,
      producto.estado,
      producto.actualizadoEn,
    ]
      .map(escaparCelda)
      .join(";")
  );

  const contenido = [COLUMNAS.join(";"), ...filas].join("\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${contenido}`], { type: "text/csv;charset=utf-8;" })
  );

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}
