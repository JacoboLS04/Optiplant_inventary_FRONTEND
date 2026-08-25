import { Providers } from "./providers";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <Providers>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Providers>
  );
}

export default App;
