import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSucursales } from "@/features/catalogos/hooks/useCatalogos";
import { mensajeDeError } from "@/lib/api-error";
import { ROL_LABEL, ROLES, requiereSucursal, type Rol } from "@/lib/roles";
import { zodResolver } from "@/lib/zod-resolver";
import { useActualizarUsuario, useCrearUsuario } from "../hooks/useUsuarios";
import type { Usuario } from "../types";

interface UsuarioFormValues {
  email: string;
  password: string;
  nombre: string;
  rol: Rol | "";
  sucursalId: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

function construirSchema(modo: "crear" | "editar") {
  return z
    .object({
      email:
        modo === "crear"
          ? z
              .string()
              .trim()
              .min(1, "El correo es obligatorio")
              .regex(EMAIL_RE, "Ingresa un correo válido")
          : z.string(),
      password:
        modo === "crear"
          ? z.string().min(MIN_PASSWORD, `Mínimo ${MIN_PASSWORD} caracteres`)
          : z
              .string()
              .refine(
                (valor) => valor.length === 0 || valor.length >= MIN_PASSWORD,
                `Mínimo ${MIN_PASSWORD} caracteres`
              ),
      nombre: z.string().trim().min(1, "El nombre es obligatorio"),
      rol: z
        .string()
        .refine((valor) => ROLES.includes(valor as Rol), "Selecciona un rol"),
      sucursalId: z.string(),
    })
    .superRefine((valores, ctx) => {
      if (requiereSucursal(valores.rol as Rol | "") && !valores.sucursalId) {
        ctx.addIssue({
          code: "custom",
          path: ["sucursalId"],
          message: "La sucursal es obligatoria para gerentes y operadores",
        });
      }
    });
}

interface UsuarioFormProps {
  usuario: Usuario | null;
  onCerrar: () => void;
}

/** Se monta solo con el diálogo abierto para que los valores partan limpios. */
function UsuarioForm({ usuario, onCerrar }: UsuarioFormProps) {
  const modo = usuario ? "editar" : "crear";
  const { data: sucursales = [], isPending: cargandoSucursales } =
    useSucursales();
  const crear = useCrearUsuario();
  const actualizar = useActualizarUsuario();

  const [verPassword, setVerPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  // Espejo del rol para decidir si el campo de sucursal debe mostrarse.
  const [rolActual, setRolActual] = useState<Rol | "">(usuario?.rol ?? "");

  const resolver = useMemo(
    () => zodResolver<UsuarioFormValues>(construirSchema(modo)),
    [modo]
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormValues>({
    resolver,
    defaultValues: {
      email: usuario?.email ?? "",
      password: "",
      nombre: usuario?.nombre ?? "",
      rol: usuario?.rol ?? "",
      sucursalId: usuario?.sucursalId ?? "",
    },
  });

  const sucursalVisible = requiereSucursal(rolActual);

  const onSubmit = handleSubmit(async (valores) => {
    setErrorServidor(null);
    const rol = valores.rol as Rol;
    const sucursalId = requiereSucursal(rol) ? valores.sucursalId : undefined;

    try {
      if (usuario) {
        await actualizar.mutateAsync({
          id: usuario.id,
          payload: {
            nombre: valores.nombre.trim(),
            rol,
            sucursalId,
            ...(valores.password ? { password: valores.password } : {}),
          },
        });
        toast.success("Usuario actualizado", {
          description: `Se guardaron los cambios de ${valores.nombre.trim()}.`,
        });
      } else {
        await crear.mutateAsync({
          email: valores.email.trim(),
          password: valores.password,
          nombre: valores.nombre.trim(),
          rol,
          sucursalId,
        });
        toast.success("Usuario creado", {
          description: `${valores.nombre.trim()} ya puede iniciar sesión.`,
        });
      }

      onCerrar();
    } catch (error) {
      setErrorServidor(
        mensajeDeError(
          error,
          usuario
            ? "No se pudo actualizar el usuario."
            : "No se pudo crear el usuario."
        )
      );
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {errorServidor ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorServidor}
        </div>
      ) : null}

      <FormField
        id="usuario-email"
        label="Correo electrónico"
        error={errors.email?.message}
        hint={usuario ? "El correo no se puede modificar." : undefined}
      >
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="usuario-email"
            type="email"
            autoComplete="off"
            placeholder="persona@optiplant.com"
            className="pl-9"
            disabled={Boolean(usuario)}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </div>
      </FormField>

      <FormField
        id="usuario-nombre"
        label="Nombre"
        error={errors.nombre?.message}
      >
        <div className="relative">
          <User
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="usuario-nombre"
            className="pl-9"
            aria-invalid={Boolean(errors.nombre)}
            {...register("nombre")}
          />
        </div>
      </FormField>

      <FormField
        id="usuario-password"
        label={usuario ? "Nueva contraseña" : "Contraseña"}
        error={errors.password?.message}
        hint={
          usuario ? "Déjala vacía para conservar la contraseña actual." : undefined
        }
      >
        <div className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="usuario-password"
            type={verPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            className="px-9"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVerPassword((visible) => !visible)}
            aria-label={
              verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {verPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </FormField>

      <FormField id="usuario-rol" label="Rol" error={errors.rol?.message}>
        <Controller
          control={control}
          name="rol"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(valor) => {
                field.onChange(valor);
                setRolActual(valor as Rol);
                // Un administrador no pertenece a ninguna sucursal.
                if (!requiereSucursal(valor as Rol)) {
                  setValue("sucursalId", "");
                }
              }}
            >
              <SelectTrigger id="usuario-rol" aria-invalid={Boolean(errors.rol)}>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((rol) => (
                  <SelectItem key={rol} value={rol}>
                    {ROL_LABEL[rol]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {sucursalVisible ? (
        <FormField
          id="usuario-sucursal"
          label="Sucursal"
          error={errors.sucursalId?.message}
        >
          <Controller
            control={control}
            name="sucursalId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="usuario-sucursal"
                  aria-invalid={Boolean(errors.sucursalId)}
                  disabled={cargandoSucursales}
                >
                  <SelectValue
                    placeholder={
                      cargandoSucursales
                        ? "Cargando sucursales…"
                        : "Selecciona una sucursal"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sucursales.map((sucursal) => (
                    <SelectItem key={sucursal.id} value={String(sucursal.id)}>
                      {sucursal.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Guardando…
            </>
          ) : usuario ? (
            "Guardar cambios"
          ) : (
            "Crear usuario"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Usuario a editar; `null` abre el formulario de creación. */
  usuario: Usuario | null;
}

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuario,
}: UsuarioFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {usuario
              ? "Actualiza los datos de acceso y la asignación del usuario."
              : "Registra una persona y define su rol dentro de la organización."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <UsuarioForm usuario={usuario} onCerrar={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
