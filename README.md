# Proyecto Optiplant — Frontend

Aplicación web de inventario multi-sucursal. SPA construida con React 19,
TypeScript y Vite.

## Scripts

| Comando           | Descripción                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Servidor de desarrollo (Vite).       |
| `npm run build`   | Compila TypeScript y genera el build.|
| `npm run lint`    | Revisa el código con Oxlint.         |
| `npm run preview` | Previsualiza el build de producción. |
| `npm test`        | Ejecuta los tests con Vitest.        |

## Configuración

La app se comunica con la API mediante `axios` usando la variable de entorno
`VITE_API_URL`:

- En desarrollo apunta a `http://localhost:8080/api` (usa el valor de `.env`).
- En el contenedor Docker se usa `/api` y Nginx hace proxy hacia el backend.

Copia `.env.example` a `.env` y ajusta `VITE_API_URL` si es necesario.

## Áreas del sistema

- Autenticación (login y sesión de usuario)
- Sucursales y usuarios
- Catálogos (productos, categorías, unidades de medida, precios)
- Inventario (existencias y movimientos)
- Compras (proveedores y órdenes de compra)
- Ventas
- Transferencias entre sucursales (con aprobaciones según rol)
- Buscador y alertas
- Dashboard con reportes y comparativas

## Stack principal

- React 19 + TypeScript
- Vite + Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Axios
- Recharts
- Radix UI y Lucide
