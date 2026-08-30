import {
  celda,
  columna,
  columnaTexto,
  filaFirma,
  filaMeta,
  formatoMoneda,
  formatoNumero,
  imprimirDocumento,
} from "@/lib/documento-impresion";
import type { Producto } from "../types";

export interface HojaInventarioMeta {
  sucursal: string;
  estado: string;
  categoria: string;
}

export function imprimirHojaInventario(
  productos: Producto[],
  meta: HojaInventarioMeta
): void {
  const filas = productos
    .map(
      (p) => `
      <tr>
        ${columnaTexto(p.sku)}
        ${columnaTexto(p.nombre)}
        ${columnaTexto(p.categoria)}
        ${columnaTexto(p.sucursal)}
        ${columna(p.stock)}
        ${columna(p.stockMinimo)}
        ${columna(formatoMoneda(p.precioUnitario))}
        ${columnaTexto(p.estado)}
      </tr>`
    )
    .join("");

  const cuerpo = `
<div class="nose-observa">
  Hoja de inventario generada a partir de los productos activos y los filtros
  aplicados. Montos en pesos colombianos (COP).
</div>
<table class="meta">
  ${filaMeta("Sucursal", meta.sucursal)}
  ${filaMeta("Estado de stock", meta.estado)}
  ${filaMeta("Categoría", meta.categoria)}
  ${filaMeta("Total de productos", formatoNumero(productos.length))}
</table>

<table class="items">
  <thead>
    <tr>
      ${celda("SKU")}
      ${celda("Producto")}
      ${celda("Categoría")}
      ${celda("Sucursal")}
      ${celda("Stock")}
      ${celda("Stock mín.")}
      ${celda("Precio unit.")}
      ${celda("Estado")}
    </tr>
  </thead>
  <tbody>
    ${filas || `<tr>${columnaTexto("Sin resultados")}</tr>`}
  </tbody>
</table>

<div class="signatures">
  ${filaFirma("Elaboró")}
  ${filaFirma("Revisó")}
  ${filaFirma("Aprobó")}
</div>
`;

  imprimirDocumento({
    tituloDocumento: "HOJA DE INVENTARIO",
    cuerpo,
  });
}
