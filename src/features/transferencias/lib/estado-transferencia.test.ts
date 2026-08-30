import { describe, expect, it } from "vitest";

import { accionesVisibles } from "./estado-transferencia";

describe("accionesVisibles (RF-064)", () => {
  it("Gerente y Administrador pueden aprobar/rechazar en estado SOLICITADA", () => {
    const aprobar = ["aprobarOrigen", "aprobarDestino", "rechazar"];
    for (const rol of ["GERENTE", "ADMINISTRADOR"] as const) {
      const acciones = accionesVisibles("SOLICITADA", rol);
      aprobar.forEach((accion) =>
        expect(acciones).toContain(accion as never)
      );
    }
  });

  it("Operador no puede aprobar ni rechazar", () => {
    const acciones = accionesVisibles("SOLICITADA", "OPERADOR");
    expect(acciones).not.toContain("aprobarOrigen");
    expect(acciones).not.toContain("aprobarDestino");
    expect(acciones).not.toContain("rechazar");
    expect(acciones).toContain("cancelar");
  });

  it("Operador conserva las acciones operativas (preparar/despachar/recibir)", () => {
    expect(accionesVisibles("APROBADA", "OPERADOR")).toEqual([
      "preparar",
      "cancelar",
    ]);
    expect(accionesVisibles("EN_PREPARACION", "OPERADOR")).toEqual([
      "despachar",
    ]);
    expect(accionesVisibles("EN_TRANSITO", "OPERADOR")).toEqual(["recibir"]);
  });
});
