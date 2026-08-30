import {
  celda,
  columna,
  columnaTexto,
  escaparHtml,
  filaFirma,
  filaMeta,
  formatoMoneda,
  formatoNumero,
  imprimirDocumento,
} from "@/lib/documento-impresion";
import type { Venta } from "../types";

export function imprimirReciboVenta(venta: Venta): void {
  const filas = venta.lineas
    .map(
      (linea) => `
      <tr>
        ${columnaTexto(linea.sku)}
        ${columnaTexto(linea.nombreProducto)}
        ${columna(linea.cantidad)}
        ${columna(formatoMoneda(linea.precioUnitario))}
        ${columna(linea.descuento > 0 ? formatoMoneda(linea.descuento) : "—")}
        ${columna(formatoMoneda(linea.subtotal))}
      </tr>`
    )
    .join("");

  const descuentoAplicado =
    venta.descuentoPorcentaje > 0
      ? Math.round(venta.subtotal * (venta.descuentoPorcentaje / 100))
      : 0;

  const cuerpo = `
<div class="nose-observa">
  Comprobante de la venta registrada. Montos en pesos colombianos (COP).
</div>
<table class="meta">
  ${filaMeta("Sucursal", venta.nombreSucursal)}
  ${filaMeta("Atendió", venta.nombreUsuario || "—")}
  ${filaMeta("Fecha", fecha(venta.fecha))}
  ${filaMeta("Unidades", formatoNumero(venta.unidades))}
</table>

<table class="items">
  <thead>
    <tr>
      ${celda("SKU")}
      ${celda("Producto")}
      ${celda("Cant.")}
      ${celda("P. unit.")}
      ${celda("Descuento")}
      ${celda("Subtotal")}
    </tr>
  </thead>
  <tbody>
    ${filas || `<tr>${columnaTexto("Sin ítems")}</tr>`}
  </tbody>
</table>

<table class="totales">
  <tr>
    <td class="label">Subtotal</td>
    <td class="valor">${escaparHtml(formatoMoneda(venta.subtotal))}</td>
  </tr>
  ${
    descuentoAplicado > 0
      ? `<tr>
    <td class="label">Descuento (${escaparHtml(
      String(venta.descuentoPorcentaje)
    )}%)</td>
    <td class="valor">-${escaparHtml(formatoMoneda(descuentoAplicado))}</td>
  </tr>`
      : ""
  }
  <tr>
    <td class="label">Total</td>
    <td class="valor">${escaparHtml(formatoMoneda(venta.total))}</td>
  </tr>
</table>

<div class="signatures">
  ${filaFirma("Elaboró")}
  ${filaFirma("Cliente")}
  ${filaFirma("Recibido por")}
</div>
`;

  imprimirDocumento({
    tituloDocumento: "RECIBO DE VENTA",
    numeroDocumento: venta.codigo,
    fechaDocumento: venta.fecha,
    cuerpo,
  });
}

function fecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
