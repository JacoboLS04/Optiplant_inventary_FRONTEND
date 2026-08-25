export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-card-foreground">
          OptiPlant
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          Sistema de Inventario Multi-Sucursal
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
