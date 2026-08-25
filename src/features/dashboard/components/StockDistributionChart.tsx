import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCompactCurrency, formatNumber } from "@/lib/format";
import type { CategoryDistribution } from "../types";

const SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface StockDistributionChartProps {
  data: CategoryDistribution[];
}

export function StockDistributionChart({ data }: StockDistributionChartProps) {
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  const share = (value: number) =>
    totalValue === 0 ? 0 : (value / totalValue) * 100;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div
        className="relative h-[190px] w-[190px] shrink-0"
        role="img"
        aria-label={`Distribución del valor del inventario por categoría: ${data
          .map(
            (item) => `${item.category}, ${share(item.value).toFixed(1)} por ciento`
          )
          .join("; ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              innerRadius="62%"
              outerRadius="94%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              formatter={(value, name) => [
                formatCompactCurrency(Number(value ?? 0)),
                String(name ?? ""),
              ]}
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: "0.75rem",
                padding: "0.375rem 0.625rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Categorías</span>
          <span className="text-xl font-semibold">{data.length}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5">
        {data.map((item, index) => (
          <li key={item.category} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: SLICE_COLORS[index % SLICE_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">{item.category}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatNumber(item.units)} uds
            </span>
            <span className="w-12 shrink-0 text-right font-medium tabular-nums">
              {share(item.value).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
