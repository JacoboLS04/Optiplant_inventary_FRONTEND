import { Providers } from "./providers";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { SucursalActivaProvider } from "./features/sucursales/context/SucursalActivaContext";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <Providers>
      <AuthProvider>
        <SucursalActivaProvider>
          <RouterProvider router={router} />
        </SucursalActivaProvider>
      </AuthProvider>
    </Providers>
  );
}

export default App;
