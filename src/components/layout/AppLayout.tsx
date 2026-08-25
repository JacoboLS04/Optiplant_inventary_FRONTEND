import { useState, useEffect, useCallback, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowLeftRight,
  LogOut,
  Search,
  Menu,
  X,
  Building2,
  Bell,
  Zap,
  ChevronDown,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventario", label: "Inventario", icon: Package },
  { to: "/compras", label: "Compras", icon: ShoppingCart },
  { to: "/ventas", label: "Ventas", icon: TrendingUp },
  { to: "/transferencias", label: "Transferencias", icon: ArrowLeftRight },
] as const;

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleNavClick = useCallback(() => {
    closeMobile();
  }, [closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [mobileOpen, closeMobile]);

  return (
    <div className="flex h-screen bg-background">
      {/* ── Mobile backdrop ── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground",
          "transition-transform duration-200 ease-in-out",
          "lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">OptiPlant</span>
          <button
            onClick={closeMobile}
            className="ml-auto rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/40" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-9 w-full rounded-lg border-0 bg-white/10 pl-9 pr-3 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 transition-colors focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            />
          </div>
        </div>

        {/* Branch selector */}
        <div className="px-4 pt-3">
          <button
            type="button"
            className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-sidebar-border px-3 text-sm text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <Building2 className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
            <span className="flex-1 truncate text-left">Todas las sucursales</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/40" />
          </button>
        </div>

        {/* Quick access */}
        <div className="flex items-center gap-1 px-4 pt-3">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-white/8 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-white/8 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label="Acciones rápidas"
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 my-3 h-px bg-sidebar-border" />

        {/* Main navigation */}
        <nav className="flex-1 space-y-0.5 px-3" aria-label="Navegación principal">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={handleNavClick}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User info */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-sidebar-foreground">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.name ?? "Usuario"}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/50">
                {user?.role ?? "Sin rol"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:hidden">
          <button
            ref={triggerRef}
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Leaf className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">OptiPlant</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
