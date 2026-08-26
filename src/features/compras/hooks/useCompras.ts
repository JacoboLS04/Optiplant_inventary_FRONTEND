import { useQuery } from "@tanstack/react-query";

import { fetchOrdenesCompra } from "../api/compras.api";

export const comprasKeys = {
  all: ["compras"] as const,
  ordenes: () => [...comprasKeys.all, "ordenes"] as const,
};

export function useOrdenesCompra() {
  return useQuery({
    queryKey: comprasKeys.ordenes(),
    queryFn: fetchOrdenesCompra,
  });
}
