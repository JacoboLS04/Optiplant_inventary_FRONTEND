import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { useBanderaUrl, useOpcionUrl, useTextoUrl } from "./useEstadoUrl";

function conRuta(ruta: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
  );
}

describe("useTextoUrl", () => {
  it("lee el término que llega en la URL", () => {
    const { result } = renderHook(() => useTextoUrl("buscar"), {
      wrapper: conRuta("/inventario?buscar=rosa"),
    });

    expect(result.current[0]).toBe("rosa");
  });

  it("actualiza el valor y lo borra cuando queda vacío", () => {
    const { result } = renderHook(() => useTextoUrl("buscar"), {
      wrapper: conRuta("/inventario"),
    });

    act(() => result.current[1]("orquídea"));
    expect(result.current[0]).toBe("orquídea");

    act(() => result.current[1](""));
    expect(result.current[0]).toBe("");
  });
});

describe("useBanderaUrl", () => {
  it("se activa solo con el valor 1", () => {
    const { result } = renderHook(() => useBanderaUrl("nuevo"), {
      wrapper: conRuta("/compras?nuevo=1"),
    });

    expect(result.current[0]).toBe(true);

    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
  });
});

describe("useOpcionUrl", () => {
  const VISTAS = ["nueva", "historial"] as const;

  it("respeta una opción válida de la URL", () => {
    const { result } = renderHook(
      () => useOpcionUrl("vista", VISTAS, "nueva"),
      { wrapper: conRuta("/ventas?vista=historial") }
    );

    expect(result.current[0]).toBe("historial");
  });

  it("cae al respaldo cuando la URL trae un valor desconocido", () => {
    const { result } = renderHook(
      () => useOpcionUrl("vista", VISTAS, "nueva"),
      { wrapper: conRuta("/ventas?vista=inventada") }
    );

    expect(result.current[0]).toBe("nueva");
  });
});
