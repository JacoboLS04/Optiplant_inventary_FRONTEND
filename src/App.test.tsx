import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@/features/dashboard/pages/Dashboard";

vi.mock("@/features/dashboard/api/dashboard.api", () => ({
  fetchInventorySummary: async () => ({
    summary: {
      totalValue: 284350000,
      totalUnits: 18642,
      skuCount: 412,
      branchCount: 4,
      inflowValue30d: 64120000,
      outflowValue30d: 34780000,
      changePercent: 8.4,
      updatedAt: new Date().toISOString(),
    },
    distribution: [{ category: "Fertilizantes", units: 6240, value: 98400000 }],
  }),
  fetchRecentMovements: async () => [
    {
      id: "MOV-2481",
      product: "Fertilizante triple 15 — 25 kg",
      sku: "FRT-1525",
      type: "entrada",
      branch: "Bodega central",
      quantity: 320,
      date: new Date().toISOString(),
    },
  ],
  fetchBranchNetwork: async () => ({
    nodes: [
      {
        id: "1",
        name: "Bodega central",
        kind: "warehouse",
        status: "ok",
        units: 11240,
        skuCount: 412,
        lowStockCount: 0,
        x: 50,
        y: 50,
      },
    ],
    links: [],
    alerts: [],
    updatedAt: new Date().toISOString(),
  }),
}));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el título", () => {
    renderDashboard();
    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" })
    ).toBeInTheDocument();
  });

  it("muestra las secciones del resumen y de la red de sucursales", async () => {
    renderDashboard();

    expect(
      await screen.findByText("Últimos movimientos de inventario")
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /Bodega central/ })
    ).toBeInTheDocument();
  });
});
