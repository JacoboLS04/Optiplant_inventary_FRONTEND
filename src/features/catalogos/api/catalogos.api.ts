import apiClient from "@/api/client";
import type { Categoria, Sucursal, UnidadMedida } from "../types";

/**
 * Punto único de acceso a los catálogos base. Reemplaza los mocks por
 * llamadas reales al backend. Estos endpoints devuelven listas simples
 * sin paginar.
 */

export function fetchSucursales(): Promise<Sucursal[]> {
  return apiClient.get<Sucursal[]>("/v1/sucursales").then((res) => res.data);
}

export function fetchCategorias(): Promise<Categoria[]> {
  return apiClient.get<Categoria[]>("/v1/categorias").then((res) => res.data);
}

export function fetchUnidadesMedida(): Promise<UnidadMedida[]> {
  return apiClient
    .get<UnidadMedida[]>("/v1/unidades-medida")
    .then((res) => res.data);
}
