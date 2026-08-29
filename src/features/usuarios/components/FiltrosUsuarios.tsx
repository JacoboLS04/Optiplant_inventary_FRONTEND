import { SearchInput } from "@/components/shared/SearchInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROL_LABEL, ROLES } from "@/lib/roles";

export type FiltroEstado = "todos" | "activos" | "inactivos";

export interface FiltrosUsuariosValue {
  nombre: string;
  rol: string;
  estado: FiltroEstado;
}

interface FiltrosUsuariosProps {
  value: FiltrosUsuariosValue;
  onChange: (value: FiltrosUsuariosValue) => void;
}

const ESTADO_LABEL: Record<FiltroEstado, string> = {
  todos: "Todos los estados",
  activos: "Solo activos",
  inactivos: "Solo inactivos",
};

export function FiltrosUsuarios({ value, onChange }: FiltrosUsuariosProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-secondary/50 p-4 lg:flex-row lg:items-end">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="buscar-usuario" className="text-xs text-muted-foreground">
          Buscar
        </Label>
        <SearchInput
          id="buscar-usuario"
          label="Buscar usuarios"
          placeholder="Buscar usuario…"
          value={value.nombre}
          onChange={(nombre) => onChange({ ...value, nombre })}
          className="bg-card"
        />
      </div>

      <div className="space-y-1.5 lg:w-52">
        <Label htmlFor="filtro-rol" className="text-xs text-muted-foreground">
          Rol
        </Label>
        <Select
          value={value.rol}
          onValueChange={(rol) => onChange({ ...value, rol })}
        >
          <SelectTrigger id="filtro-rol" className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            {ROLES.map((rol) => (
              <SelectItem key={rol} value={rol}>
                {ROL_LABEL[rol]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 lg:w-52">
        <Label htmlFor="filtro-estado" className="text-xs text-muted-foreground">
          Estado
        </Label>
        <Select
          value={value.estado}
          onValueChange={(estado) =>
            onChange({ ...value, estado: estado as FiltroEstado })
          }
        >
          <SelectTrigger id="filtro-estado" className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ESTADO_LABEL) as FiltroEstado[]).map((estado) => (
              <SelectItem key={estado} value={estado}>
                {ESTADO_LABEL[estado]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
