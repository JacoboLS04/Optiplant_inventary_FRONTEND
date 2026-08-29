import { Link, Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { normalizarRol, type Rol } from "@/lib/roles";

interface RoleRouteProps {
  roles: Rol[];
  /** Si se omite, protege las rutas hijas a través del `Outlet`. */
  children?: React.ReactNode;
}

/**
 * Complementa a `ProtectedRoute` (que solo verifica la sesión) exigiendo además
 * un rol concreto. El backend responde 403 en estos casos; la UI evita mostrar
 * la pantalla y explica por qué.
 */
export default function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user } = useAuth();
  const rol = normalizarRol(user?.role);

  if (!rol || !roles.includes(rol)) {
    return <AccesoRestringido />;
  }

  return <>{children ?? <Outlet />}</>;
}

function AccesoRestringido() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-dashed bg-secondary/40 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
        <ShieldAlert className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Acceso restringido</h1>
        <p className="text-sm text-muted-foreground">
          Esta sección está reservada para administradores del sistema.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}
