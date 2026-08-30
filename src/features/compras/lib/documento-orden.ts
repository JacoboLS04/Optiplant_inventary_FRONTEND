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
import { ESTADO_ORDEN_LABEL } from "./estado-orden";
import type { OrdenCompra } from "../types";

export function imprimirOrdenCompra(orden: OrdenCompra): void {
  const filas = orden.items
    .map(
      (item) => `
      <tr>
        ${columnaTexto(item.sku)}
        ${columnaTexto(item.nombre)}
        ${columna(item.cantidadOrdenada)}
        ${columna(formatoMoneda(item.precioUnitario))}
        ${columna(item.descuento > 0 ? formatoMoneda(item.descuento) : "—")}
        ${columna(formatoMoneda(item.subtotal))}
      </tr>`
    )
    .join("");

  const cuerpo = `
<div class="nose-observa">
  Documento de orden de compra emitida al proveedor indicado. Montos en pesos
  colombianos (COP).
</div>
<table class="meta">
  ${filaMeta("Proveedor", orden.proveedor)}
  ${filaMeta("Sucursal destino", orden.sucursalDestino)}
  ${filaMeta("Solicitó", orden.nombreUsuario || "—")}
  ${filaMeta("Estado", ESTADO_ORDEN_LABEL[orden.estado] ?? orden.estado)}
  ${filaMeta("Fecha de emisión", formatoFecha(orden.fechaEmision))}
  ${filaMeta(
    "Entrega estimada",
    orden.fechaEntregaEstimada ? formatoFecha(orden.fechaEntregaEstimada) : "—"
  )}
  ${filaMeta("Transportista", orden.transportista || "—")}
  ${filaMeta("Guía", orden.guia || "—")}
  ${filaMeta("Condiciones de pago", orden.condicionesPago || "—")}
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
    <td class="label">Total orden</td>
    <td class="valor">${escaparHtml(formatoMoneda(orden.total))}</td>
  </tr>
  <tr>
    <td class="label">Referencias</td>
    <td class="valor">${escaparHtml(formatoNumero(orden.items.length))}</td>
  </tr>
</table>

<div class="signatures">
  ${filaFirma("Elaboró")}
  ${filaFirma("Solicitante")}
  ${filaFirma("Proveedor")}
  ${filaFirma("Recibido por")}
</div>
`;

  imprimirDocumento({
    tituloDocumento: "ORDEN DE COMPRA",
    numeroDocumento: orden.codigo,
    fechaDocumento: orden.fechaEmision,
    estadoDocumento: ESTADO_ORDEN_LABEL[orden.estado] ?? orden.estado,
    cuerpo,
  });
}

function formatoFecha(iso: string): string {
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
