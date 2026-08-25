import { Providers } from "./providers";
import { router } from "./routes";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
