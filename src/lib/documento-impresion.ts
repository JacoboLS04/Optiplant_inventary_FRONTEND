/**
 * Impresión de documentos con la estética de plantilla (encabezado con logo,
 * cámara de empresa, tablas de ítems y firmas). Abre una ventana/iframe oculta
 * al estilo de impresión del navegador y dispara "Imprimir / Guardar PDF" sin
 * añadir dependencias.
 */

function formatearFecha(iso: string): string {
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

function formatearFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatearAhora(): { fecha: string; hora: string } {
  const ahora = new Date();
  return {
    fecha: ahora.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    hora: ahora.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function formatearNumero(valor: number): string {
  return new Intl.NumberFormat("es-CO").format(valor);
}

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export const formatoFecha = formatearFecha;
export const formatoFechaHora = formatearFechaHora;
export const formatoNumero = formatearNumero;
export const formatoMoneda = formatearMoneda;

/** Escapa texto para insertarlo en HTML sin romper el marcado. */
export function escaparHtml(texto: string | number | null | undefined): string {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ESTILOS = `
:root{
  --border:#1C2541;
  --gray-bg:#EEEEEC;
  --ink:#1C2541;
  --route:#E8590C;
  --muted:#8A8F98;
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{
  font-family:'Space Grotesk', Arial, Helvetica, sans-serif;
  background:#fff;
  color:var(--ink);
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
.sheet{
  max-width:900px;
  margin:0 auto;
  background:#fff;
  border:1px solid var(--ink);
  padding:24px 28px;
}
.header-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:2px solid var(--border);
  padding-bottom:12px;
  margin-bottom:6px;
}
.company-logo svg{display:block;}
.company-info{text-align:center;flex:1;}
.company-info h1{
  font-family:'Space Grotesk', sans-serif;
  font-size:22px;
  font-weight:700;
  margin:0 0 6px 0;
  letter-spacing:0.01em;
  color:var(--ink);
}
.company-info h1 .accent{color:var(--route);}
.company-info .tagline{
  font-family:'JetBrains Mono', monospace;
  font-size:9px;
  letter-spacing:0.28em;
  text-transform:uppercase;
  color:var(--muted);
}
.company-info div{font-size:11px;line-height:1.5;}
.print-info{text-align:right;font-size:11px;line-height:1.5;min-width:150px;color:var(--ink);}
.doc-title{
  text-align:center;
  font-size:14px;
  font-weight:700;
  letter-spacing:1px;
  margin:8px 0 4px 0;
  color:var(--route);
}
.page-line{
  display:flex;
  justify-content:space-between;
  font-size:11px;
  border-bottom:1px solid var(--border);
  padding-bottom:4px;
  margin-bottom:8px;
}
table.meta{
  width:100%;
  border-collapse:collapse;
  font-size:11px;
  margin-bottom:10px;
}
table.meta td{
  border:1px solid var(--border);
  padding:4px 6px;
  vertical-align:middle;
}
table.meta td.label{
  background:var(--gray-bg);
  font-weight:bold;
  width:16%;
}
table.meta td.valor{
  background:transparent;
}
table.items{
  width:100%;
  border-collapse:collapse;
  font-size:11px;
  margin-bottom:12px;
}
table.items th{
  background:var(--gray-bg);
  border:1px solid var(--border);
  padding:5px 4px;
  font-weight:bold;
  text-align:left;
}
table.items td{
  border:1px solid var(--border);
  padding:4px;
}
table.items td.num{text-align:right;}
table.totales{
  width:40%;
  margin-left:auto;
  border-collapse:collapse;
  font-size:11px;
  margin-bottom:24px;
}
table.totales td{
  border:1px solid var(--border);
  padding:5px 8px;
}
table.totales td.label{
  background:var(--gray-bg);
  font-weight:bold;
}
table.totales td.valor{text-align:right;}
.nose-observa{font-size:11px;margin-bottom:12px;}
.signatures{
  display:flex;
  justify-content:space-between;
  margin-top:54px;
  gap:20px;
}
.sig{flex:1;text-align:center;}
.sig .line{
  border-bottom:1px solid var(--border);
  height:22px;
  margin-bottom:4px;
}
.sig .cap{font-size:11px;}
@media print{
  html,body{background:#fff;}
  .sheet{border:none;padding:0;box-shadow:none;}
}
`;

/**
 * Envuelve el cuerpo de un documento en la plantilla (encabezado, título,
 * líneas de página e impresión) y abre la vista de impresión del navegador.
 */
export function imprimirDocumento({
  tituloDocumento,
  cuerpo,
  numeroDocumento,
  fechaDocumento,
  estadoDocumento = "",
}: {
  tituloDocumento: string;
  cuerpo: string;
  numeroDocumento?: string;
  fechaDocumento?: string;
  estadoDocumento?: string;
}): void {
  const ahora = formatearAhora();

  const paginaHoja = `
<div class="sheet">
  <div class="header-top">
    <div class="company-logo">
      <svg width="82" height="82" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path d="M18 54 L60 24 L102 54" stroke="#1C2541" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24 52 V96 H96 V52" stroke="#1C2541" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M46 96 V70 H74 V96" stroke="#1C2541" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 83 H46" stroke="#E8590C" stroke-width="6" stroke-linecap="round"/>
        <path d="M74 83 L100 62" stroke="#E8590C" stroke-width="6" stroke-linecap="round"/>
        <path d="M90 60 L102 61 L101 73" stroke="#E8590C" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    </div>
    <div class="company-info">
      <h1>Opti<span class="accent">Plant</span></h1>
      <div class="tagline">Gestión de inventario</div>
    </div>
    <div class="print-info">
      Fecha impresión:<br>
      <strong>${escaparHtml(ahora.fecha)}</strong><br>
      Hora: <strong>${escaparHtml(ahora.hora)}</strong>
    </div>
  </div>

  <div class="doc-title">${escaparHtml(tituloDocumento)}</div>
  <div class="page-line">
    <span>Página: 1 de 1</span>
    <span>N.º: <strong>${escaparHtml(numeroDocumento ?? "—")}</strong></span>
    <span>Fecha: <strong>${escaparHtml(
      fechaDocumento ? formatearFechaHora(fechaDocumento) : ahora.fecha
    )}</strong></span>
    ${estadoDocumento ? `<span>Estado: ${escaparHtml(estadoDocumento)}</span>` : ""}
  </div>

  ${cuerpo}
</div>`;

  const htmlCompleto = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<title>${escaparHtml(tituloDocumento)}</title>
<style>${ESTILOS}</style>
</head>
<body>
${paginaHoja}
<script>
window.addEventListener("load", function () {
  setTimeout(function () { window.print(); }, 300);
});
</`+`script>
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(htmlCompleto);
  doc.close();
}

export function filaMeta(label: string, valor: string | number): string {
  return `<tr>
    <td class="label">${escaparHtml(label)}</td>
    <td class="valor">${escaparHtml(valor)}</td>
  </tr>`;
}

export function celda(titulo: string): string {
  return `<th>${escaparHtml(titulo)}</th>`;
}

export function columna(numero: string | number): string {
  return `<td class="num">${escaparHtml(numero)}</td>`;
}

export function columnaTexto(texto: string | number): string {
  return `<td>${escaparHtml(texto)}</td>`;
}

export function filaFirma(capitacion: string): string {
  return `
  <div class="sig">
    <div class="line"></div>
    <div class="cap">${escaparHtml(capitacion)}</div>
  </div>`;
}
