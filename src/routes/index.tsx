import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("@/features/auth/pages/Login"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const Inventario = lazy(
  () => import("@/features/inventario/pages/Inventario")
);
const Compras = lazy(() => import("@/features/compras/pages/Compras"));
const Ventas = lazy(() => import("@/features/ventas/pages/Ventas"));
const Transferencias = lazy(
  () => import("@/features/transferencias/pages/Transferencias")
);
const AppLayout = lazy(() => import("@/components/layout/AppLayout"));
const ProtectedRoute = lazy(
  () => import("@/components/layout/ProtectedRoute")
);

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/",
    element: (
      <SuspenseWrapper>
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      </SuspenseWrapper>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: "inventario",
        element: (
          <SuspenseWrapper>
            <Inventario />
          </SuspenseWrapper>
        ),
      },
      {
        path: "compras",
        element: (
          <SuspenseWrapper>
            <Compras />
          </SuspenseWrapper>
        ),
      },
      {
        path: "ventas",
        element: (
          <SuspenseWrapper>
            <Ventas />
          </SuspenseWrapper>
        ),
      },
      {
        path: "transferencias",
        element: (
          <SuspenseWrapper>
            <Transferencias />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
