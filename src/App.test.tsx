import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@/features/dashboard/pages/Dashboard";

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
