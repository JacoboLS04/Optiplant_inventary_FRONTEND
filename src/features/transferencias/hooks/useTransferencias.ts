import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  aprobarTransferencia,
  cancelarTransferencia,
  crearTransferencia,
  despacharTransferencia,
  fetchProductosDisponibles,
  fetchTransferencia,
  fetchTransferencias,
  prepararTransferencia,
  recibirTransferencia,
  type AprobarTransferenciaPayload,
  type DespacharTransferenciaPayload,
  type RecibirTransferenciaPayload,
} from "../api/transferencias.api";
import type { FiltrosTransferencias } from "../types";

export const transferenciasKeys = {
  all: ["transferencias"] as const,
  disponibles: (sucursalId: string) =>
    [...transferenciasKeys.all, "disponibles", sucursalId] as const,
  listado: (filtros: FiltrosTransferencias, page: number, size: number) =>
    [...transferenciasKeys.all, "listado", filtros, page, size] as const,
  detalle: (id: string) => [...transferenciasKeys.all, "detalle", id] as const,
};

export function useProductosDisponibles(sucursalId: string) {
  return useQuery({
    queryKey: transferenciasKeys.disponibles(sucursalId),
    queryFn: () => fetchProductosDisponibles(sucursalId),
    enabled: sucursalId.length > 0,
  });
}

export function useTransferencias(
  filtros: FiltrosTransferencias,
  page: number,
  size: number
) {
  return useQuery({
    queryKey: transferenciasKeys.listado(filtros, page, size),
    queryFn: () => fetchTransferencias(filtros, page, size),
    placeholderData: (prev) => prev,
  });
}

export function useTransferencia(id: string) {
  return useQuery({
    queryKey: transferenciasKeys.detalle(id),
    queryFn: () => fetchTransferencia(id),
    enabled: id.length > 0,
  });
}

export function invalidarTransferencias() {
  return { queryKey: transferenciasKeys.all };
}

function useInvalidar() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: transferenciasKeys.all,
    });
}

export function useCrearTransferencia() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: crearTransferencia,
    onSuccess: invalidar,
  });
}

export function useAprobarTransferencia() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (payload: AprobarTransferenciaPayload) =>
      aprobarTransferencia(payload),
    onSuccess: invalidar,
  });
}

export function usePrepararTransferencia() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: prepararTransferencia,
    onSuccess: invalidar,
  });
}

export function useDespacharTransferencia() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (payload: DespacharTransferenciaPayload) =>
      despacharTransferencia(payload),
    onSuccess: invalidar,
  });
}

export function useRecibirTransferencia() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (payload: RecibirTransferenciaPayload) =>
      recibirTransferencia(payload),
    onSuccess: invalidar,
  });
}

export function useCancelarTransferencia() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: cancelarTransferencia,
    onSuccess: invalidar,
  });
}
