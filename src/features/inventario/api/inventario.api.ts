import apiClient from "@/api/client";
import type {
  AjusteStockPayload,
  NuevoProductoPayload,
  Producto,
  ProductoActualizacionPayload,
} from "../types";

/**
 * Único punto de acceso a Productos/Existencias/Movimientos. Reemplaza los
 * mocks por llamadas reales al backend.
 *
 * La UI de Inventario consume un arreglo plano de `Producto` y aplica
 * filtrado/paginación en el cliente. Por eso `fetchProductos` recolecta todas
 * las páginas de `/existencias` y las mapea a la forma que esperan los
 * componentes. Una iteración posterior puede mover el filtrado/paginado al
 * servidor.
 */

/** Envelope de paginación que devuelve el backend Spring. */
interface PageEnvelope<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** DTO real de `GET /existencias` (confirmado contra el backend). */
interface ExistenciaDto {
  id: number;
  productoId: number;
  sku?: string;
  nombreProducto?: string;
  sucursalId?: number;
  nombreSucursal?: string;
  cantidadFisica?: number;
  cantidadReservada?: number;
  cantidadDisponible?: number;
  stockMinimo?: number;
  estadoStock?: string;
  precio?: number;
  updatedAt?: string;
}

/** DTO real de `GET /productos` (usado para resolver categoría por producto). */
interface ProductoDto {
  id?: number;
  sku?: string;
  nombre?: string;
  descripcion?: string;
  categoriaId?: number;
  categoriaNombre?: string;
  unidadBaseId?: number;
  estado?: string;
}

/** DTO real de `GET /unidades-medida`. */
interface UnidadMedidaDto {
  id: number;
  nombre: string;
  simbolo?: string;
}

const PAGE_SIZE = 100;

function getId(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

async function fetchAllPages<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const primera = await apiClient.get<PageEnvelope<T>>(url, {
    params: { page: 0, size: PAGE_SIZE, ...params },
  });
  const { content, totalPages } = primera.data;
  if (totalPages <= 1) return content;

  const resto = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      apiClient.get<PageEnvelope<T>>(url, {
        params: { page: i + 1, size: PAGE_SIZE, ...params },
      })
    )
  );
  return [...content, ...resto.flatMap((res) => res.data.content)];
}

function toProducto(
  dto: ExistenciaDto,
  productos: Map<number, ProductoDto>
): Producto {
  const productoId = dto.productoId ?? dto.id;
  const prod = productos.get(Number(productoId));
  const categoriaId = prod?.categoriaId;
  const stock = Number(dto.cantidadDisponible ?? 0);
  const stockMinimo = Number(dto.stockMinimo ?? 0);

  return {
    // La UI trata cada fila como un "producto"; su identidad es el productoId
    // real (cada producto tiene una existencia en una sucursal en estos datos).
    id: getId(productoId),
    sku: dto.sku ?? prod?.sku ?? "",
    nombre: dto.nombreProducto ?? prod?.nombre ?? "",
    descripcion: prod?.descripcion ?? "",
    categoriaId: getId(categoriaId),
    categoria: prod?.categoriaNombre ?? "—",
    sucursalId: getId(dto.sucursalId),
    sucursal: dto.nombreSucursal ?? "—",
    stock,
    stockMinimo,
    precioUnitario: Number(dto.precio ?? 0),
    estado: (dto.estadoStock ?? "disponible") as Producto["estado"],
    activo: (prod?.estado ?? "activo") !== "inactivo",
    actualizadoEn: dto.updatedAt ?? new Date().toISOString(),
  };
}

async function fetchAllProductos(): Promise<Map<number, ProductoDto>> {
  const list = await fetchAllPages<ProductoDto>("/v1/productos");
  return new Map(
    list
      .filter((p) => p.id !== undefined)
      .map((p) => [p.id as number, p])
  );
}

export async function fetchProductos(): Promise<Producto[]> {
  const [existencias, productos] = await Promise.all([
    fetchAllPages<ExistenciaDto>("/v1/existencias"),
    fetchAllProductos(),
  ]);
  return existencias.map((dto) => toProducto(dto, productos));
}

export async function crearProducto(
  payload: NuevoProductoPayload
): Promise<Producto> {
  // 1) Crear el producto (el backend no acepta stock/precio/sucursal aquí).
  const unidades = await apiClient
    .get<UnidadMedidaDto[]>("/v1/unidades-medida")
    .then((res) => res.data);
  const unidadBaseId = unidades[0]?.id ?? 1;

  const creado = await apiClient
    .post<ExistenciaDto>("/v1/productos", {
      sku: payload.sku,
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? undefined,
      categoriaId: Number(payload.categoriaId),
      unidadBaseId,
    })
    .then((res) => res.data);
  const productoId = creado.id ?? creado.productoId;

  // 2) Fijar precio del producto si se indicó.
  if (payload.precioUnitario > 0) {
    await apiClient.post("/v1/precios", {
      productoId,
      precio: payload.precioUnitario,
    });
  }

  // 3) Crear la existencia inicial vía movimiento de ingreso.
  if (payload.stock > 0) {
    await apiClient.post("/v1/movimientos-inventario", {
      productoId,
      sucursalId: Number(payload.sucursalId),
      tipo: "ingreso",
      cantidad: payload.stock,
      motivo: "Existencia inicial",
    });
  }

  // 4) Ajustar el stock mínimo de la existencia recién creada.
  if (payload.stockMinimo > 0) {
    const existencias = await fetchAllPages<ExistenciaDto>("/v1/existencias", {
      search: payload.sku,
    });
    const existencia = existencias.find(
      (e) => String(e.productoId ?? e.id) === String(productoId)
    );
    if (existencia?.id) {
      await apiClient.put(`/v1/existencias/${existencia.id}`, {
        stockMinimo: payload.stockMinimo,
      });
    }
  }

  return (await fetchProductos()).find(
    (p) => p.sku.toLowerCase() === payload.sku.toLowerCase()
  ) ?? {
    id: String(productoId),
    sku: payload.sku,
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? "",
    categoriaId: payload.categoriaId,
    categoria: "—",
    sucursalId: payload.sucursalId,
    sucursal: "—",
    stock: payload.stock,
    stockMinimo: payload.stockMinimo,
    precioUnitario: payload.precioUnitario,
    estado: "agotado",
    activo: true,
    actualizadoEn: new Date().toISOString(),
  };
}

export async function inactivarProducto(id: string): Promise<void> {
  await apiClient.patch(`/v1/productos/${id}/estado`);
}

export async function actualizarProducto(
  payload: ProductoActualizacionPayload
): Promise<Producto> {
  // El PUT del backend exige unidadBaseId; lo recuperamos del producto actual.
  const actual = await apiClient
    .get<ProductoDto>(`/v1/productos/${Number(payload.id)}`)
    .then((res) => res.data);

  await apiClient.put(`/v1/productos/${Number(payload.id)}`, {
    nombre: payload.nombre,
    descripcion: payload.descripcion || undefined,
    categoriaId: Number(payload.categoriaId),
    unidadBaseId: actual.unidadBaseId ?? 1,
    sku: actual.sku,
  });

  // Actualizar precio si cambió.
  if (payload.precioUnitario >= 0) {
    await apiClient.put(`/v1/precios/${Number(payload.id)}`, {
      precio: payload.precioUnitario,
    });
  }

  // Actualizar stock mínimo de la existencia de la sucursal correspondiente.
  const existencias = await fetchAllPages<ExistenciaDto>("/v1/existencias", {
    search: actual.sku,
  });
  const existencia = existencias.find(
    (e) => String(e.productoId ?? e.id) === String(payload.id)
  );
  if (existencia?.id) {
    await apiClient.put(`/v1/existencias/${existencia.id}`, {
      stockMinimo: payload.stockMinimo,
    });
  }

  const resultado = (await fetchProductos()).find((p) => p.id === payload.id);
  if (!resultado) throw new Error("No se pudo recuperar el producto actualizado");
  return resultado;
}

export async function registrarAjusteStock(
  payload: AjusteStockPayload
): Promise<Producto> {
  const existencias = await fetchAllPages<ExistenciaDto>("/v1/existencias");
  const fila = existencias.find(
    (e) => String(e.productoId ?? e.id) === String(payload.productoId)
  );

  if (!fila?.sucursalId) {
    throw new Error("No se encontró la existencia del producto seleccionado");
  }

  // El backend usa "ingreso"/"retiro"/"merma"; el usuario se resuelve del token.
  await apiClient.post("/v1/movimientos-inventario", {
    productoId: Number(payload.productoId),
    sucursalId: fila.sucursalId,
    tipo:
      payload.tipo === "entrada"
        ? "ingreso"
        : payload.tipo === "merma"
          ? "merma"
          : "retiro",
    cantidad: payload.cantidad,
    motivo: payload.motivo,
  });

  // Re-obtener existencias para devolver el estado actualizado del producto.
  const actualizado = await fetchProductos();
  const resultado =
    actualizado.find((p) => p.id === String(payload.productoId)) ??
    actualizado.find((p) => p.sku === fila.sku);

  if (!resultado) {
    throw new Error("No se pudo recuperar el estado actualizado del producto");
  }

  return resultado;
}
