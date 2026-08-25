import { Package } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Productos", value: "—" },
          { label: "Sucursales", value: "—" },
          { label: "Ventas hoy", value: "—" },
          { label: "Stock bajo", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-lg border p-4"
          >
            <Package className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
