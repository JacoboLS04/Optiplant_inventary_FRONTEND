import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import apiClient from "@/api/client";

interface AuthUser {
  name: string;
  email: string;
  role: string;
  usuarioId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "token";
const USER_KEY = "optiplant:user";

interface LoginResponse {
  token: string;
  tipo: string;
  usuarioId: string | number;
  email: string;
  nombre: string;
  rol: string;
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restaura la sesión persistida al inicializar (refrescar la página).
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => Boolean(readStoredToken())
  );
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>("/v1/auth/login", {
      email,
      password,
    });

    const authUser: AuthUser = {
      name: data.nombre,
      email: data.email,
      role: data.rol,
      usuarioId: data.usuarioId == null ? undefined : String(data.usuarioId),
    };

    // El interceptor de `apiClient` lee el token desde esta misma clave.
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));

    setIsAuthenticated(true);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
