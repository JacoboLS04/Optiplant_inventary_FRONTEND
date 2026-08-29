import { useQuery } from "@tanstack/react-query";

import {
  fetchBranchNetwork,
  fetchInventorySummary,
  fetchRecentMovements,
  fetchRotacion,
  fetchVentasMensuales,
} from "../api/dashboard.api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  movements: () => [...dashboardKeys.all, "movements"] as const,
  network: () => [...dashboardKeys.all, "network"] as const,
  rotacion: () => [...dashboardKeys.all, "rotacion"] as const,
  ventasMensuales: () => [...dashboardKeys.all, "ventas-mensuales"] as const,
};

export function useInventorySummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchInventorySummary,
  });
}

export function useRecentMovements() {
  return useQuery({
    queryKey: dashboardKeys.movements(),
    queryFn: fetchRecentMovements,
  });
}

export function useBranchNetwork() {
  return useQuery({
    queryKey: dashboardKeys.network(),
    queryFn: fetchBranchNetwork,
    // El mapa de red se presenta como vista "en tiempo real".
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useRotacion() {
  return useQuery({
    queryKey: dashboardKeys.rotacion(),
    queryFn: fetchRotacion,
  });
}

export function useVentasMensuales() {
  return useQuery({
    queryKey: dashboardKeys.ventasMensuales(),
    queryFn: fetchVentasMensuales,
  });
}
