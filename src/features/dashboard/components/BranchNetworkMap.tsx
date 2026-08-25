import { AlertTriangle, Package, Warehouse } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  BRANCH_LINK_STROKE,
  BRANCH_NODE_STYLE,
  BRANCH_STATUS_LABEL,
} from "../lib/branch-status";
import type { BranchLink, BranchNode } from "../types";

interface BranchNetworkMapProps {
  nodes: BranchNode[];
  links: BranchLink[];
  selectedId: string;
  onSelect: (branchId: string) => void;
}

/** Curva suave entre dos nodos, en el sistema de coordenadas 0–100 del mapa. */
function buildLinkPath(from: BranchNode, to: BranchNode): string {
  const halfway = (to.x - from.x) / 2;
  return `M ${from.x} ${from.y} C ${from.x + halfway} ${from.y}, ${
    to.x - halfway
  } ${to.y}, ${to.x} ${to.y}`;
}

function nodeIcon(node: BranchNode) {
  if (node.kind === "warehouse") return Warehouse;
  return node.status === "ok" ? Package : AlertTriangle;
}

export function BranchNetworkMap({
  nodes,
  links,
  selectedId,
  onSelect,
}: BranchNetworkMapProps) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground sm:hidden">
        Desplaza horizontalmente para recorrer toda la red.
      </p>

      <div className="overflow-x-auto">
        <div className="relative aspect-[16/7] min-h-[300px] min-w-[560px] rounded-lg border bg-secondary/40">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {links.map((link) => {
              const from = nodeById.get(link.from);
              const to = nodeById.get(link.to);
              if (!from || !to) return null;

              return (
                <path
                  key={`${link.from}-${link.to}`}
                  d={buildLinkPath(from, to)}
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className={BRANCH_LINK_STROKE[link.status]}
                />
              );
            })}
          </svg>

          {nodes.map((node) => {
            const Icon = nodeIcon(node);
            const isWarehouse = node.kind === "warehouse";
            const selected = node.id === selectedId;

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelect(node.id)}
                aria-pressed={selected}
                aria-label={`${node.name}. ${
                  BRANCH_STATUS_LABEL[node.status]
                }. ${formatNumber(node.units)} unidades en existencia.`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full border-[3px] transition-transform",
                    isWarehouse ? "h-20 w-20" : "h-16 w-16",
                    BRANCH_NODE_STYLE[isWarehouse ? "warehouse" : node.status],
                    selected
                      ? "scale-105 shadow-md"
                      : "hover:scale-105 hover:shadow-sm"
                  )}
                >
                  <Icon
                    className={isWarehouse ? "h-8 w-8" : "h-6 w-6"}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={cn(
                    "absolute top-full left-1/2 mt-3 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-xs whitespace-nowrap",
                    selected
                      ? "bg-foreground font-medium text-background"
                      : "font-medium text-foreground"
                  )}
                >
                  {node.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
