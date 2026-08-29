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
  fetchRotacion: async () => ({
    periodoDias: 30,
    totalUnidades: 12840,
    altaDemanda: [
      {
        productoId: "1",
        sku: "FRT-1525",
        nombre: "Fertilizante triple 15 — 25 kg",
        unidades: 520,
        stockActual: 640,
        rotacion: 0.8,
      },
    ],
    bajaDemanda: [
      {
        productoId: "2",
        sku: "SEM-0520",
        nombre: "Semilla de lechuga crespa",
        unidades: 0,
        stockActual: 254,
        rotacion: 0,
      },
    ],
    updatedAt: new Date().toISOString(),
  }),
  fetchVentasMensuales: async () => ({
    mesesConsiderados: 4,
    totalPeriodo: 118500000,
    meses: [
      { anio: 2026, mes: 5, etiqueta: "may 2026", total: 24700000 },
      { anio: 2026, mes: 6, etiqueta: "jun 2026", total: 28100000 },
      { anio: 2026, mes: 7, etiqueta: "jul 2026", total: 30200000 },
      { anio: 2026, mes: 8, etiqueta: "ago 2026", total: 35500000 },
    ],
    updatedAt: new Date().toISOString(),
  }),
}));

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "5",
      email: "admin2@optiplant.com",
      nombre: "Admin",
      role: "ADMINISTRADOR",
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
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
