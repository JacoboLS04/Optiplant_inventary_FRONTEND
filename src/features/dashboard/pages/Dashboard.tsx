import { BranchNetworkCard } from "../components/BranchNetworkCard";
import { InventorySummaryCard } from "../components/InventorySummaryCard";
import { RecentMovementsCard } from "../components/RecentMovementsCard";

export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen del inventario y estado de la red de sucursales.
        </p>
      </header>

      <InventorySummaryCard />
      <RecentMovementsCard />
      <BranchNetworkCard />
    </div>
  );
}
