import { useAuth } from "@/features/auth/context/AuthContext";
import { normalizarRol } from "@/lib/roles";
import { BranchNetworkCard } from "../components/BranchNetworkCard";
import { InventorySummaryCard } from "../components/InventorySummaryCard";
import { RecentMovementsCard } from "../components/RecentMovementsCard";
import { RotacionCard } from "../components/RotacionCard";
import { VentasMensualesCard } from "../components/VentasMensualesCard";

export default function Dashboard() {
  const { user } = useAuth();
  // RF-063/064: la comparativa entre sucursales es solo para ADMINISTRADOR.
  const esAdministrador = normalizarRol(user?.role) === "ADMINISTRADOR";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen del inventario y estado de la red de sucursales.
        </p>
      </header>

      <InventorySummaryCard />
      <VentasMensualesCard />
      <RecentMovementsCard />
      <RotacionCard />
      {esAdministrador ? <BranchNetworkCard /> : null}
    </div>
  );
}
