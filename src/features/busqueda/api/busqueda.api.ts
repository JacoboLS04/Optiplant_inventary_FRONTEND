import apiClient from "@/api/client";
import { ESTADO_ORDEN_LABEL } from "@/features/compras/lib/estado-orden";
import { ESTADO_TRANSFERENCIA_LABEL } from "@/features/transferencias/lib/estado-transferencia";
import { fetchTransferencias } from "@/features/transferencias/api/transferencias.api";
import { fetchUsuarios } from "@/features/usuarios/api/usuarios.api";
import { fetchVentas } from "@/features/ventas/api/ventas.api";
import { formatCurrency, formatNumber } from "@/lib/format";
import { ROL_LABEL } from "@/lib/roles";
import type { ResultadoBusqueda } from "../types";

/**
 * Búsqueda transversal sobre los módulos que aceptan filtro de texto en el
 * backend. Cada origen se consulta en paralelo y por separado: si uno falla
 * (por ejemplo usuarios, restringido a administradores) el resto sigue
 * respondiendo. Los resultados enlazan al módulo con la búsqueda ya aplicada.
 */

const LIMITE_POR_ORIGEN = 5;

interface PageEnvelope<T> {
  content: T[];
}

interface ExistenciaDto {
  id: number;
  productoId?: number;
  sku?: string;
  nombreProducto?: string;
  nombreSucursal?: string;
  cantidadDisponible?: number;
}

interface OrdenCompraDto {
  id: number;
  codigo?: string;
  nombreProveedor?: string;
  nombreSucursal?: string;
  estado?: string;
}

const ESTADO_ORDEN_BACKEND: Record<string, keyof typeof ESTADO_ORDEN_LABEL> = {
  BORRADOR: "borrador",
  ENVIADA: "enviada",
  EN_TRANSITO: "en_transito",
  RECIBIDA: "recibida",
  CANCELADA: "cancelada",
};

function conFiltro(ruta: string, termino: string): string {
  return `${ruta}${ruta.includes("?") ? "&" : "?"}buscar=${encodeURIComponent(termino)}`;
}

async function buscarProductos(termino: string): Promise<ResultadoBusqueda[]> {
  const { data } = await apiClient.get<PageEnvelope<ExistenciaDto>>(
    "/v1/existencias",
    { params: { search: termino, page: 0, size: LIMITE_POR_ORIGEN } }
  );

  return data.content.map((dto) => ({
    clave: `producto-${dto.id}`,
    tipo: "producto" as const,
    titulo: dto.nombreProducto ?? "Producto sin nombre",
    subtitulo: [
      dto.sku,
      dto.nombreSucursal,
      `${formatNumber(Number(dto.cantidadDisponible ?? 0))} unidades`,
    ]
      .filter(Boolean)
      .join(" · "),
    destino: conFiltro("/inventario", dto.sku ?? termino),
  }));
}

async function buscarVentas(termino: string): Promise<ResultadoBusqueda[]> {
  const pagina = await fetchVentas({ busqueda: termino }, 0, LIMITE_POR_ORIGEN);

  return pagina.content.map((venta) => ({
    clave: `venta-${venta.id}`,
    tipo: "venta" as const,
    titulo: venta.codigo,
    subtitulo: [venta.nombreSucursal, formatCurrency(venta.total)]
      .filter(Boolean)
      .join(" · "),
    destino: conFiltro("/ventas?vista=historial", venta.codigo),
  }));
}

async function buscarTransferencias(
  termino: string
): Promise<ResultadoBusqueda[]> {
  const pagina = await fetchTransferencias(
    { busqueda: termino },
    0,
    LIMITE_POR_ORIGEN
  );

  return pagina.content.map((transferencia) => ({
    clave: `transferencia-${transferencia.id}`,
    tipo: "transferencia" as const,
    titulo: transferencia.codigo,
    subtitulo: `${transferencia.nombreSucursalOrigen} → ${transferencia.nombreSucursalDestino} · ${ESTADO_TRANSFERENCIA_LABEL[transferencia.estado]}`,
    destino: conFiltro("/transferencias", transferencia.codigo),
  }));
}

async function buscarOrdenes(termino: string): Promise<ResultadoBusqueda[]> {
  const { data } = await apiClient.get<PageEnvelope<OrdenCompraDto>>(
    "/v1/ordenes-compra",
    { params: { busqueda: termino, page: 0, size: LIMITE_POR_ORIGEN } }
  );

  return data.content.map((dto) => {
    const estado = dto.estado ? ESTADO_ORDEN_BACKEND[dto.estado] : undefined;

    return {
      clave: `orden-${dto.id}`,
      tipo: "orden" as const,
      titulo: dto.codigo ?? `Orden ${dto.id}`,
      subtitulo: [
        dto.nombreProveedor,
        dto.nombreSucursal,
        estado ? ESTADO_ORDEN_LABEL[estado] : undefined,
      ]
        .filter(Boolean)
        .join(" · "),
      destino: conFiltro("/compras", dto.codigo ?? termino),
    };
  });
}

async function buscarUsuarios(termino: string): Promise<ResultadoBusqueda[]> {
  const pagina = await fetchUsuarios({
    page: 0,
    size: LIMITE_POR_ORIGEN,
    busqueda: termino,
  });

  return pagina.usuarios.map((usuario) => ({
    clave: `usuario-${usuario.id}`,
    tipo: "usuario" as const,
    titulo: usuario.nombre,
    subtitulo: [usuario.email, ROL_LABEL[usuario.rol]].filter(Boolean).join(" · "),
    destino: conFiltro("/administracion/usuarios", usuario.email),
  }));
}

export async function buscarEnTodosLosModulos(
  termino: string,
  { incluirUsuarios }: { incluirUsuarios: boolean }
): Promise<ResultadoBusqueda[]> {
  const origenes = [
    buscarProductos(termino),
    buscarVentas(termino),
    buscarTransferencias(termino),
    buscarOrdenes(termino),
    ...(incluirUsuarios ? [buscarUsuarios(termino)] : []),
  ];

  const respuestas = await Promise.allSettled(origenes);

  return respuestas.flatMap((respuesta) =>
    respuesta.status === "fulfilled" ? respuesta.value : []
  );
}
