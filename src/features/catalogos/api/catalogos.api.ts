import apiClient from "@/api/client";
import type { Categoria, Sucursal, UnidadMedida } from "../types";

/**
 * Punto único de acceso a los catálogos base. Reemplaza los mocks por
 * llamadas reales al backend. Estos endpoints devuelven listas simples
 * sin paginar.
 *
 * El backend envía los ids como números; aquí se normalizan a `string` porque
 * es lo que declaran los tipos y lo que comparan los filtros y los `Select`
 * (un id numérico dejaría el selector en blanco al no coincidir con el valor).
 */

interface ConId {
  id: number | string;
}

function conIdTexto<T extends ConId>(registro: T): T & { id: string } {
  return { ...registro, id: String(registro.id) };
}

export function fetchSucursales(): Promise<Sucursal[]> {
  return apiClient
    .get<Sucursal[]>("/v1/sucursales")
    .then((res) => (res.data ?? []).map(conIdTexto));
}

export function fetchCategorias(): Promise<Categoria[]> {
  return apiClient
    .get<Categoria[]>("/v1/categorias")
    .then((res) => (res.data ?? []).map(conIdTexto));
}

export function fetchUnidadesMedida(): Promise<UnidadMedida[]> {
  return apiClient
    .get<UnidadMedida[]>("/v1/unidades-medida")
    .then((res) => (res.data ?? []).map(conIdTexto));
}
