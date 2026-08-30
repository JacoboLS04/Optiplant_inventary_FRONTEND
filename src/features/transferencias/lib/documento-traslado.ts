import {
  celda,
  columna,
  columnaTexto,
  escaparHtml,
  filaFirma,
  filaMeta,
  formatoNumero,
  imprimirDocumento,
} from "@/lib/documento-impresion";
import { ESTADO_TRANSFERENCIA_LABEL, URGENCIA_LABEL } from "./estado-transferencia";
import type { Transferencia } from "../types";

export function imprimirSolicitudTraslado(transferencia: Transferencia): void {
  const filas = transferencia.lineas
    .map(
      (linea) => `
      <tr>
        ${columnaTexto(linea.sku)}
        ${columnaTexto(linea.nombreProducto)}
        ${columna(linea.cantidadSolicitada)}
        ${columna(linea.cantidadDespachada)}
        ${columna(linea.cantidadRecibida)}
      </tr>`
    )
    .join("");

  const cuerpo = `
<table class="meta">
  ${filaMeta("Sucursal origen", transferencia.nombreSucursalOrigen)}
  ${filaMeta("Sucursal destino", transferencia.nombreSucursalDestino)}
  ${filaMeta("Solicitante", transferencia.nombreUsuarioSolicitante || "—")}
  ${filaMeta("Urgencia", URGENCIA_LABEL[transferencia.urgencia] ?? transferencia.urgencia)}
  ${filaMeta("Transportista", transferencia.transportista || "—")}
  ${filaMeta("Guía", transferencia.guia || "—")}
  ${filaMeta("Unidades solicitadas", formatoNumero(transferencia.totalUnidades))}
</table>

<div class="nose-observa">
  Detalle de las existencias trasladadas entre las sucursales indicadas.
</div>

<table class="items">
  <thead>
    <tr>
      ${celda("Código")}
      ${celda("Producto")}
      ${celda("Solicitada")}
      ${celda("Despachada")}
      ${celda("Recibida")}
    </tr>
  </thead>
  <tbody>
    ${filas || `<tr>${columnaTexto("Sin ítems")}</tr>`}
  </tbody>
</table>

<table class="totales">
  <tr>
    <td class="label">Unidades</td>
    <td class="valor">${escaparHtml(formatoNumero(transferencia.totalUnidades))}</td>
  </tr>
</table>

<div class="signatures">
  ${filaFirma("Solicitado por")}
  ${filaFirma("Origen")}
  ${filaFirma("Destino")}
  ${filaFirma("Recibido por")}
</div>
`;

  imprimirDocumento({
    tituloDocumento: "SOLICITUD DE TRASLADO",
    numeroDocumento: transferencia.codigo,
    fechaDocumento: transferencia.fechaSolicitud || transferencia.fechaDespacho,
    estadoDocumento:
      ESTADO_TRANSFERENCIA_LABEL[transferencia.estado] ?? transferencia.estado,
    cuerpo,
  });
}
