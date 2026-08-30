import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  default: { get: vi.fn() },
}));

import apiClient from "@/api/client";
import { fetchAlertasStock } from "./alertas.api";

const get = vi.mocked(apiClient.get);

function responderCon(content: unknown[]) {
  get.mockResolvedValue({ data: { content, totalElements: content.length } });
}

describe("fetchAlertasStock", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("deja fuera las existencias sanas y ordena por gravedad", async () => {
    responderCon([
      {
        id: 1,
        sku: "SKU-1",
        nombreProducto: "Rosa",
        nombreSucursal: "Norte",
        cantidadDisponible: 40,
        stockMinimo: 10,
        estadoStock: "disponible",
      },
      {
        id: 2,
        sku: "SKU-2",
        nombreProducto: "Orquídea",
        nombreSucursal: "Sur",
        cantidadDisponible: 8,
        stockMinimo: 10,
        estadoStock: "bajo",
      },
      {
        id: 3,
        sku: "SKU-3",
        nombreProducto: "Girasol",
        nombreSucursal: "Centro",
        cantidadDisponible: 0,
        stockMinimo: 5,
        estadoStock: "critico",
      },
      {
        id: 4,
        sku: "SKU-4",
        nombreProducto: "Tulipán",
        nombreSucursal: "Norte",
        cantidadDisponible: 2,
        stockMinimo: 10,
        estadoStock: "critico",
      },
    ]);

    const alertas = await fetchAlertasStock();

    expect(alertas.map((alerta) => [alerta.sku, alerta.estado])).toEqual([
      ["SKU-3", "agotado"],
      ["SKU-4", "critico"],
      ["SKU-2", "bajo"],
    ]);
  });

  it("clasifica por stock mínimo cuando el backend no envía el estado", async () => {
    responderCon([
      {
        id: 5,
        sku: "SKU-5",
        nombreProducto: "Helecho",
        cantidadDisponible: 9,
        stockMinimo: 10,
      },
      {
        id: 6,
        sku: "SKU-6",
        nombreProducto: "Cactus",
        cantidadDisponible: 3,
        stockMinimo: 10,
      },
    ]);

    const alertas = await fetchAlertasStock();

    expect(alertas.map((alerta) => [alerta.sku, alerta.estado])).toEqual([
      ["SKU-6", "critico"],
      ["SKU-5", "bajo"],
    ]);
  });

  it("acota la consulta a la sucursal activa", async () => {
    responderCon([]);

    await fetchAlertasStock("7");

    expect(get).toHaveBeenCalledWith(
      "/v1/existencias",
      expect.objectContaining({
        params: expect.objectContaining({ sucursalId: 7 }),
      })
    );
  });
});
