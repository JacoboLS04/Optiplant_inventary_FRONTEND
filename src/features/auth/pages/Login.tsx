import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate("/dashboard", { replace: true });
    } catch {
      setServerError("Error al iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Brand panel (desktop) ── */}
      <div className="hidden w-full flex-col justify-between bg-sidebar p-10 lg:flex lg:max-w-[480px]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            OptiPlant
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-sidebar-foreground">
            Inventario
            <br />
            Multi-Sucursal
          </h2>
          <p className="text-base text-sidebar-foreground/60">
            Gestiona tu inventario de forma eficiente y centralizada.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/30">
          &copy; {new Date().getFullYear()} OptiPlant
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile branding */}
          <div className="space-y-2 text-center lg:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              OptiPlant
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Inventario Multi-Sucursal
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden space-y-1 lg:block">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@optiplant.com"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={cn(
                    "h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm transition-colors placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    errors.email
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input"
                  )}
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Ingresa un correo válido",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={cn(
                    "h-10 w-full rounded-lg border bg-background pl-10 pr-10 text-sm transition-colors placeholder:text-muted-foreground/50",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    errors.password
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-input"
                  )}
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 6,
                      message: "Mínimo 6 caracteres",
                    },
                  })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-xs text-destructive"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors",
                "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-70"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground/60 lg:hidden">
            &copy; {new Date().getFullYear()} OptiPlant
          </p>
        </div>
      </div>
    </div>
  );
}
