# Changelog — Frontend OptiPlant

---

## Iteración 04 — Inventario, Compras, Transferencias y Ventas

### Objetivo

Implementar en una sola ejecución los cuatro módulos pendientes del inventario de wireframes
(`inventary.png`, `purchase.png`, `transfers.png` + `transfers with popup.png`, `sales.png`),
creando primero los componentes compartidos que se repiten entre pantallas.

### Componentes base compartidos (creados antes de los módulos)

| Archivo | Propósito |
|---------|-----------|
| `src/components/ui/dialog.tsx` | Modal accesible (Radix Dialog) — usado por transferencias, inventario y ventas |
| `src/components/ui/select.tsx` | Select accesible (Radix Select) para filtros y formularios |
| `src/components/ui/dropdown-menu.tsx` | Menú de acciones ("Gestionar stock") |
| `src/components/ui/label.tsx`, `textarea.tsx` | Primitivos de formulario faltantes |
| `src/components/shared/PageHeader.tsx` | Título + descripción + acciones, idéntico en las cuatro pantallas |
| `src/components/shared/SearchInput.tsx` | Búsqueda con icono y botón de limpiar |
| `src/components/shared/DataTable.tsx` | Tabla genérica por columnas con loading / error / empty |
| `src/components/shared/TablePagination.tsx` | "Mostrando X–Y de N" + navegación de páginas |
| `src/components/shared/StatusBadge.tsx` | Tono semántico único (success/warning/danger/info/neutral) para todos los estados |
| `src/components/shared/Stepper.tsx` | Pasos numerados: asistente de transferencia y seguimiento de envío en compras |
| `src/components/shared/FormField.tsx` | Label + control + error/hint |
| `src/components/shared/SectionState.tsx` | `ErrorState` / `EmptyState` — **movidos** desde `features/dashboard/components/` |
| `src/features/catalogos/` | Sucursales y categorías (types/mocks/api/hooks) consumidas por los cuatro módulos |

Además se añadió la variante `info` a `badge` y el formateador `formatDate` a `lib/format.ts`.

### Módulos implementados

Todos siguen el patrón de `dashboard/`: `types → mocks → api → hooks (TanStack Query) → components → page`.

- **Inventario** (`/inventario`): tabla de 24 productos con búsqueda por nombre/SKU, filtros por
  categoría, sucursal, estado de stock y fecha de actualización, exportación CSV de lo filtrado,
  paginación de 10, diálogo de nuevo producto y diálogo de entrada/salida de stock.
  El estado de stock se deriva de `stock` vs `stockMinimo` (`lib/estado-stock.ts`).
- **Compras** (`/compras`): panel lateral de estados con conteos + filtro por sucursal de destino,
  búsqueda por código/proveedor y tarjetas `PO-00X` con proveedor, destino, fechas, total,
  seguimiento de envío (stepper) e ítems desplegables.
- **Transferencias** (`/transferencias`): asistente de 3 pasos (origen y destino → productos →
  revisión). El modal de selección de ítems lista las existencias reales de la sucursal de origen;
  las cantidades se ajustan en la tabla y se validan contra el stock disponible.
- **Ventas** (`/ventas`): catálogo con búsqueda y filtros + carrito lateral con control de
  cantidades, descuento porcentual en modal y registro de la venta.

### Decisiones no triviales

- **Almacén mock mutable**: `inventario/mocks/inventario.mock.ts` es un array mutable; las
  mutaciones de `api/` (crear producto, ajustar stock, registrar venta) escriben ahí para que la UI
  se comporte como lo hará contra Spring Boot. Ventas y Transferencias derivan sus datos de ese
  mismo almacén, igual que el backend consultará `Existencia`.
- **Formularios sin datos precargados**: todos los campos inician vacíos; los mocks solo alimentan
  catálogos y listados, nunca valores de formulario.
- **Una venta = una sucursal**: al intentar mezclar sedes en el carrito se muestra un aviso.
- **Sin dependencias nuevas**: los primitivos se escribieron sobre `radix-ui`, ya instalado.

### Pendientes reales

- Compras y Transferencias no tienen listado histórico ni creación de orden de compra: los
  wireframes no los cubren; requieren definición funcional.
- Transferir no mueve todavía existencias entre sucursales (el backend debe generar los dos
  movimientos); la venta sí descuenta stock porque ocurre en una sola sede.
- El selector de sucursal del sidebar aún no filtra el contenido de las pantallas.

### Validación

`tsc` sin errores · build de producción correcto · lint sin warnings nuevos (11 preexistentes) ·
tests en verde · revisado en 1440 / 1024 / 390 px.

---

## Iteración 03 — Inventario de wireframes (revisión visual) y Dashboard

### Objetivo

1. Revisar visualmente **todos** los wireframes de `docs/wireframes/` — primera iteración con capacidad de visión — y registrar un inventario fiable.
2. Implementar la primera pantalla del orden recomendado: **Dashboard**, cubriendo los wireframes `Dashboard.png` y `Dashboard inventory in real time.png`.

### Inventario de wireframes (verificado visualmente)

| Wireframe | Pantalla / intención estructural | Estado |
|---|---|---|
| `Main menu (sidebar open).png` | Sidebar expandido: logo, ítem simple, grupo desplegable con sub-ítems, divisor, bloque usuario+rol, zona de logout, botón circular de colapso | **Implementado parcialmente** (Iteración 01) — faltan el grupo de navegación desplegable y el botón de colapso |
| `Main menu (sidebar close).png` | Rail colapsado con solo iconos + avatares al pie | **Pendiente en desktop** — hoy solo existe el drawer off-canvas de mobile |
| `Dashboard.png` | Card resumen (cifra destacada + 2 indicadores con (i) + donut) y tabla inferior | **Implementado** (Iteración 03) |
| `Dashboard inventory in real time.png` | Mapa de red de sucursales (nodos verde/azul/rojo conectados) + dos bloques informativos debajo | **Implementado** (Iteración 03) |
| `inventary.png` | Tabla de productos: search, "Manage stock" (dropdown add stock / remove items), "+ New product", filtros/fecha/export, paginación | Pendiente |
| `purchase.png` | Órdenes de compra: panel de filtros por estado + lista de tarjetas PO-00X con estado de envío | Pendiente |
| `sales.png` | POS: buscador + grid de productos, carrito lateral con items, subtotal y descuento | Pendiente |
| `transfers.png` | Formulario de transferencia con stepper, campos en dos columnas y tabla de ítems | Pendiente |
| `transfers with popup.png` | Mismo formulario con modal de selección de ítems | Pendiente |

**Orden de implementación recomendado:** Dashboard → Inventario → Compras → Transferencias → Ventas
(flujo de usuario → dependencias → complejidad técnica).

### Cambios realizados

- Implementada la pantalla **Dashboard** completa en `/dashboard`, sustituyendo el placeholder de 4 KPIs vacíos.
- Añadidos los primitivos base de shadcn/ui que faltaban según `DESIGN_SYSTEM.md`: `card`, `badge`, `table`, más `skeleton` y `tooltip`.
- Creada la capa de datos mock del dashboard (tipos, mocks, fetchers y hooks de TanStack Query).
- Añadidas utilidades de formato compartidas (`src/lib/format.ts`) para moneda COP, cantidades, porcentajes y fechas en `es-CO`.
- Ampliado `src/App.test.tsx`: envoltura con `QueryClientProvider` y una prueba adicional de render de secciones.

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `src/components/ui/card.tsx` | Card base (shadcn new-york) con `rounded-lg` según design system |
| `src/components/ui/badge.tsx` | Badge con variantes `default`, `secondary`, `destructive`, `warning`, `outline` |
| `src/components/ui/table.tsx` | Tabla base con contenedor scrollable |
| `src/components/ui/skeleton.tsx` | Bloque de carga animado |
| `src/components/ui/tooltip.tsx` | Tooltip accesible sobre el primitive de Radix ya instalado |
| `src/lib/format.ts` | Formateadores `es-CO`: moneda, compacto, número con signo, porcentaje, fecha/hora y tiempo relativo |
| `src/features/dashboard/types.ts` | Tipos del dominio del dashboard (resumen, distribución, movimientos, nodos/enlaces/alertas de red) |
| `src/features/dashboard/mocks/dashboard.mock.ts` | Datos de ejemplo aislados con la forma exacta de la respuesta esperada del API |
| `src/features/dashboard/api/dashboard.api.ts` | Fetchers con latencia simulada; único punto a reemplazar al conectar el backend |
| `src/features/dashboard/hooks/useDashboardQueries.ts` | `dashboardKeys` + hooks `useInventorySummary`, `useRecentMovements`, `useBranchNetwork` |
| `src/features/dashboard/lib/branch-status.ts` | Etiquetas y estilos semánticos de estado de sucursal compartidos por mapa, leyenda y paneles |
| `src/features/dashboard/components/InventorySummaryCard.tsx` | Card hero: valor total, tendencia, métricas, indicadores con tooltip y donut |
| `src/features/dashboard/components/StockDistributionChart.tsx` | Donut de recharts + leyenda con unidades y porcentaje |
| `src/features/dashboard/components/RecentMovementsCard.tsx` | Tabla de últimos movimientos de inventario |
| `src/features/dashboard/components/BranchNetworkMap.tsx` | Mapa de red: curvas SVG + nodos HTML posicionados en porcentaje |
| `src/features/dashboard/components/StockAlertsPanel.tsx` | Lista de alertas de stock con severidad y barra de cobertura |
| `src/features/dashboard/components/BranchDetailPanel.tsx` | Detalle de la sede seleccionada en el mapa |
| `src/features/dashboard/components/BranchNetworkCard.tsx` | Sección "Red de inventario en tiempo real" (mapa + leyenda + paneles) |
| `src/features/dashboard/components/SectionState.tsx` | `ErrorState` y `EmptyState` reutilizables |

### Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `src/features/dashboard/pages/Dashboard.tsx` | Reescritura: encabezado + composición de las tres secciones. La página no contiene lógica de datos |
| `src/App.test.tsx` | `QueryClientProvider` en el render, aserción por rol para el `h1` y prueba de las secciones cargadas |

### Traducción de los wireframes al dominio

`Dashboard.png` es una plantilla financiera genérica (`$PRICE`, `Expenses`, `Net income`, tabla `Client/Date`). Se conservó su estructura y se sustituyó el contenido por el dominio de inventario:

| Elemento del wireframe | Implementación |
|---|---|
| Label "text" + `$PRICE` | "Valor total del inventario" + valor consolidado en COP con variación porcentual |
| `Expenses` / `Net income` con iconos (i) | "Entradas (30 días)" / "Salidas (30 días)" con tooltip explicativo |
| Donut con porcentajes | Distribución del valor del inventario por categoría de producto |
| Tabla `Client / Date / Optional` | Últimos movimientos: producto+SKU, tipo, sucursal/ruta, cantidad con signo, fecha |
| Mapa de nodos verde/azul/rojo | Red de sucursales: verde operativa, azul bodega central, rojo stock crítico, con rutas de reabastecimiento punteadas |
| Dos bloques bajo el mapa | Izquierda: alertas de stock de la red. Derecha: detalle de la sede seleccionada |

### Decisiones importantes

1. **Los dos wireframes de Dashboard viven en la misma ruta `/dashboard`**, como secciones sucesivas. El sidebar tiene un único ítem "Dashboard" y ambos wireframes muestran la misma pantalla; separarlos habría exigido tocar la navegación sin respaldo en los wireframes.
2. **Mapa de red con SVG + CSS, sin librería de grafos**. Las curvas son `path` cúbicos en un sistema de coordenadas 0–100 con `vectorEffect="non-scaling-stroke"`; los nodos son botones HTML posicionados en porcentaje, lo que permite iconos de lucide, foco por teclado y `aria-label`. No se añadió ninguna dependencia.
3. **Cero dependencias nuevas**: recharts, radix-ui, TanStack Query y lucide ya estaban instalados. Los primitivos de shadcn se escribieron a mano siguiendo el estilo `new-york` ya configurado, evitando que el CLI vuelva a crear rutas incorrectas (problema de la Iteración 01).
4. **Colores semánticos de estado fuera de la paleta de marca**. `DESIGN_SYSTEM.md` no define tokens de éxito/advertencia/peligro y el propio wireframe usa verde/azul/rojo para el estado de las sedes. Se usan `emerald` (positivo), `amber` (advertencia), `sky` (bodega central) y el token `destructive` (crítico); el verde de marca `--primary` se mantiene en el relleno de los nodos operativos, la primera porción del donut y el chip de tendencia.
5. **Datos mock detrás de TanStack Query**, no incrustados en los componentes: los estados de carga y error son reales y conectar el backend solo implica reemplazar el cuerpo de `dashboard.api.ts`.
6. **La sección de red se refresca sola cada 60 s** (`refetchInterval`) para sostener la promesa de "tiempo real"; además cada sección tiene su botón de actualización manual.
7. **`badgeVariants` no se exporta** para no introducir un warning nuevo de `react(only-export-components)`.

### Responsive

| Breakpoint | Comportamiento del Dashboard |
|------------|------------------------------|
| Desktop (≥1024px) | Card hero en dos columnas (cifras + donut con leyenda), tabla completa, mapa a ancho total, alertas y detalle en dos columnas |
| Tablet (768–1023px) | Hero apilado con donut y leyenda en fila, tabla completa, paneles del mapa en una columna |
| Mobile (<640px) | Todo en una columna; el donut pasa a ancho completo con la leyenda debajo; la tabla oculta "Sucursal/ruta" y "Fecha" y conserva scroll horizontal; el mapa se desplaza en horizontal con indicación visible |

### Accesibilidad

- Jerarquía de encabezados `h1` → `h2` (títulos de card) → `h3` (subsecciones del mapa), con `aria-labelledby` en las secciones.
- Donut expuesto como `role="img"` con `aria-label` que enumera categorías y porcentajes; la leyenda visible funciona como alternativa textual.
- Nodos del mapa como `<button>` con `aria-pressed` y `aria-label` que incluye nombre, estado y unidades.
- Barras de cobertura de alertas con `role="progressbar"` y `aria-valuenow/min/max`.
- Tooltips de los indicadores accionables por teclado (`TooltipTrigger` con `aria-label`).
- Estados de error con `role="alert"`; botones de solo icono con `aria-label`.
- Cobertura de estados: `default`, `hover`, `focus-visible`, `disabled` (botones de refresco mientras cargan), `loading` (skeletons), `error` (con reintento) y `empty` (resumen, tabla, alertas y red).

### Validación

- **TypeScript**: `npx tsc -b` sin errores.
- **Build de producción**: `npm run build` exitoso. El chunk lazy `Dashboard` pesa 408 kB (124 kB gzip) por recharts; al estar en carga diferida no afecta al bundle inicial.
- **Lint**: `npm run lint` mantiene los 11 warnings preexistentes (`routes/index.tsx`, `button.tsx`, `AuthContext.tsx`). Ningún warning nuevo.
- **Tests**: 2/2 en verde (`vitest run`).
- **Revisión visual**: la pantalla se inspeccionó en 1440px, 1024px y 390px, y en los estados cargado, cargando, vacío y de error, comparándola con la intención estructural de ambos wireframes.

### Pendientes

- **Sidebar**: estado colapsado en desktop y grupo de navegación desplegable (`Main menu` open/close) siguen sin implementar.
- **Documentación de origen**: `docs/` no contiene los RF/CU ni los diagramas (ER, arquitectura) que la especificación menciona. El dominio del Dashboard se derivó del enunciado de la iteración; conviene incorporar esos documentos antes de Inventario.
- **Backend**: reemplazar `dashboard.api.ts` por llamadas reales con `apiClient`.
- **Filtro por sucursal**: el selector del sidebar aún no filtra los datos del dashboard.
- **Chunk de recharts**: evaluar `manualChunks` si más pantallas incorporan gráficos.
- Pantallas pendientes: Inventario, Compras, Ventas y Transferencias (con su modal).

### Siguiente paso sugerido

**Inventario** (`inventary.png`): tabla de productos con búsqueda, filtros, exportación, paginación y acciones de stock. Reutiliza los primitivos `table`, `badge` y `card` introducidos en esta iteración y es la base de datos que consumen Compras, Ventas y Transferencias.

---

## Iteración 02 — Login, flujo de autenticación y análisis de wireframes

### Objetivo

1. Implementar pantalla de Login profesional con formulario funcional, validación y estados visuales.
2. Establecer flujo de navegación: Login → autenticación → AppLayout → Dashboard.
3. Separar rutas públicas (/login) de rutas protegidas (área principal).
4. Documentar inventario de wireframes existentes para orientar futuras implementaciones.

### Cambios realizados

- Creado contexto de autenticación mock (`AuthContext`) con login/logout y estado de usuario.
- Creado componente `ProtectedRoute` que redirige a /login si no hay sesión activa.
- Reescrita completa de la pantalla de Login: diseño de dos paneles (branding + formulario), validación con react-hook-form, estados de carga/error, show/hide contraseña, accesibilidad completa.
- Actualizado `App.tsx` para envolver la app con `AuthProvider`.
- Actualizado `routes/index.tsx` para proteger las rutas del área principal.
- Actualizado `AppLayout.tsx` para usar datos del usuario desde el contexto de autenticación y ejecutar logout real (navega a /login).
- Creado `docs/CHANGELOG.md` con registro de iteraciones.
- Documentado inventario de wireframes en la sección de análisis.

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `src/features/auth/context/AuthContext.tsx` | Contexto de autenticación mock: `AuthProvider`, `useAuth()`, `login()`, `logout()`, estado `isAuthenticated`, `user` |
| `src/components/layout/ProtectedRoute.tsx` | Guard de rutas: redirige a `/login` si no autenticado |
| `docs/CHANGELOG.md` | Registro técnico acumulativo de iteraciones del frontend |

### Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `src/App.tsx` | Envuelto con `AuthProvider` entre `Providers` y `RouterProvider` |
| `src/routes/index.tsx` | Ruta `/` envuelta con `ProtectedRoute`. Agregado lazy load de `ProtectedRoute`. Actualizado fallback de Suspense con `bg-background` |
| `src/features/auth/pages/Login.tsx` | Reescritura completa: layout dos paneles, formulario react-hook-form, validación, loading spinner, show/hide password, error server, accesibilidad |
| `src/components/layout/AppLayout.tsx` | Importa `useAuth` y `useNavigate`. User info muestra datos del contexto. Logout ejecuta `handleLogout()` → `logout()` + `navigate("/login")` |

### Análisis de wireframes

Inventario de wireframes disponibles en `docs/wireframes/`:

| Wireframe | Pantalla/Funcionalidad | Elementos identificados | Prioridad de implementación |
|-----------|----------------------|------------------------|---------------------------|
| `Main menu (sidebar open).png` | Sidebar navegación (abierto) | Sidebar con logo, búsqueda, selector, nav items, usuario | ~~Ya implementado~~ (Iteración 01) |
| `Main menu (sidebar close).png` | Sidebar navegación (colapsado) | Versión colapsada del sidebar | ~~Ya implementado~~ (Iteración 01) |
| `Dashboard.png` | Página principal | KPIs/resumen, gráficos, métricas generales | Alta — siguiente paso |
| `Dashboard inventory in real time.png` | Dashboard con inventario en tiempo real | Widget de inventario, datos en vivo, alertas de stock | Alta — junto con Dashboard |
| `inventary.png` | Módulo de Inventario | Tabla de productos, filtros, búsqueda, acciones CRUD, estados de stock | Alta |
| `purchase.png` | Módulo de Compras | Formulario/tabla de órdenes de compra, proveedores, totales | Media |
| `sales.png` | Módulo de Ventas | Formulario/tabla de ventas, clientes, totales | Media |
| `transfers.png` | Módulo de Transferencias | Lista de transferencias entre sucursales | Media |
| `transfers with popup.png` | Transferencias con modal | Dialog/modal para crear/editar transferencia | Media |

**Nota**: No fue posible visualizar directamente las imágenes de wireframe (el modelo no soporta entrada de imágenes). La información de cada wireframe se infiere de los nombres de archivo y del dominio de la aplicación (sistema de inventario multi-sucursal). Se recomienda revisar visualmente cada wireframe antes de implementar la pantalla correspondiente para confirmar la estructura y elementos esperados.

### UI/UX — Login

- **Layout desktop**: Dos paneles — panel izquierdo dark (bg-sidebar) con branding, panel derecho light (bg-background) con formulario centrado.
- **Layout mobile**: Panel de formulario centrado con branding compacto arriba.
- **Formulario**: Campos con labels visibles, iconos (Mail, Lock), validación inline, errores debajo de cada campo.
- **Contraseña**: Toggle show/hide con iconos Eye/EyeOff.
- **Loading**: Spinner animado (Loader2) + texto "Iniciando sesión..." en el botón durante el envío.
- **Errores de servidor**: Banner rojo con role="alert" arriba del formulario.
- **Branding**: Logo Leaf verde + "OptiPlant" en ambos paneles. Subtitle "Sistema de Inventario Multi-Sucursal".
- **Copyright**: Año dinámico (`new Date().getFullYear()`) en ambos paneles.
- **Estados del botón**: default (green), hover (primary/90), focus-visible (ring), disabled (opacity-50, pointer-events-none).

### Arquitectura

- **AuthContext**: Mock simple — `useState` para `isAuthenticated` y `user`. `login()` simula delay de 800ms. `logout()` limpia estado.
- **ProtectedRoute**: Componente wrapper que verifica `isAuthenticated` y redirige con `<Navigate to="/login" replace />`.
- **Flujo**: `/login` (pública) → login exitoso → navega a `/dashboard` → `ProtectedRoute` permite acceso → `AppLayout` renderiza con datos del usuario.
- **Logout**: `handleLogout()` en AppLayout llama `logout()` del contexto + `navigate("/login", { replace: true })`.
- **Rutas protegidas**: Todas las rutas hijas de `/` están protegidas. `/login` es la única ruta pública.

### Dependencias

No se agregaron nuevas dependencias en esta iteración. Se utilizaron las ya existentes:
- `react-hook-form` — manejo del formulario de login
- `react-router-dom` — navegación y protección de rutas
- `lucide-react` — iconografía (Mail, Lock, Eye, EyeOff, Loader2, Leaf)

### Responsive

| Breakpoint | Comportamiento Login |
|------------|---------------------|
| Desktop (≥1024px lg) | Dos paneles: branding dark a la izquierda (max-w-[480px]), formulario a la derecha |
| Tablet (<1024px) | Un solo panel: formulario centrado, branding como header compacto |
| Mobile (<640px) | Un solo panel, padding reducido (p-6), copyright visible |

### Validación

- **TypeScript**: Compila sin errores (`npx tsc -b`)
- **Build producción**: Exitoso (`npm run build`) — todos los bundles generados correctamente
- **Tests**: 1 test existente pasa (Dashboard title render)
- **Lint**: Solo warnings preexistentes (lazy exports en routes, CVA export en button, hook+component en AuthContext). Sin warnings nuevos en código propio.
- **Accesibilidad Login**:
  - `<label>` asociado a cada input via `htmlFor`/`id`
  - `aria-invalid` en campos con error
  - `aria-describedby` conectando campos con mensajes de error
  - `role="alert"` en mensajes de error (tanto de campo como de servidor)
  - `type="email"` y `type="password"` para teclados móviles
  - `autoComplete="email"` y `autoComplete="current-password"` para autocompletado
  - `autoFocus` en el campo de email
  - `noValidate` en el form para usar validación custom
  - Toggle password con `aria-label` descriptivo
  - `tabIndex={-1}` en toggle password para no interferir con Tab natural

### Decisiones importantes

1. **Auth mock sin dependencias**: Se implementó con `useState` simple, sin localStorage ni tokens. Preparado para reemplazar con autenticación real contra Spring Boot.
2. ** react-hook-form con validación nativa**: Se usó `register()` con `validate` en lugar de zod + resolver para evitar instalar `@hookform/resolvers`.
3. **Layout dos paneles en Login**: Decisión de diseño para dar presencia visual a la marca. El panel dark reutiliza los tokens del sidebar.
4. **ProtectedRoute como lazy**: Se carga bajo demanda para no impactar el bundle inicial.
5. **AuthContext separado de Providers**: Se mantiene en `features/auth/context/` siguiendo la estructura feature-based del proyecto.

### Pendientes

- **Autenticación real**: Reemplazar mock con llamada a Spring Boot API (axios ya instalado).
- **Manejo de tokens**: JWT, refresh tokens, interceptor de axios.
- **Pantallas de Dashboard**: Implementar según wireframes `Dashboard.png` y `Dashboard inventory in real time.png`.
- **Pantalla de Inventario**: Implementar según wireframe `inventary.png`.
- **Pantalla de Compras**: Implementar según wireframe `purchase.png`.
- **Pantalla de Ventas**: Implementar según wireframe `sales.png`.
- **Pantalla de Transferencias**: Implementar según wireframes `transfers.png` y `transfers with popup.png`.
- **Revisión visual de wireframes**: Se recomienda revisar cada imagen antes de implementar la pantalla correspondiente.

---

## Iteración 01 — Sistema de diseño base y AppLayout

### Objetivo

Establecer la base visual y estructural del frontend: sistema de diseño (tokens, paleta, tipografía), componente `AppLayout` con sidebar responsive moderno y profesional, e infraestructura de componentes shadcn/ui.

### Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `src/components/ui/button.tsx` | Componente base Button (shadcn/ui) con variantes default, destructive, outline, secondary, ghost, link |
| `src/components/ui/avatar.tsx` | Componente Avatar (shadcn/ui) con fallback, badge, group |
| `src/components/ui/input.tsx` | Componente Input (shadcn/ui) con estados focus/error |
| `src/components/ui/separator.tsx` | Componente Separator (shadcn/ui) horizontal/vertical |

### Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `index.html` | Agregado `lang="es"`, enlace a Google Fonts Inter (variable font), preconnect |
| `src/index.css` | Reemplazada paleta neutral por defecto de shadcn por tokens del DESIGN_SYSTEM.md. Configurados colores semánticos: foreground (#0F1217), background (#FCFCFD), surface (#FAFAFA), surface-muted (#EFF1F3), border (#C2C6C9), primary (#B0E57E). Configurados tokens de sidebar dark. Agregada estructura `.dark` preparada para futuro dark mode. Font-sans configurado a Inter |
| `src/components/layout/AppLayout.tsx` | Reescritura completa: sidebar responsive con logo, buscador, selector de sucursal, accesos rápidos, navegación principal (5 módulos), info de usuario, logout. Mobile: drawer off-canvas con backdrop, hamburger trigger, focus management |

### Componentes implementados

- **AppLayout**: Layout principal con sidebar de navegación
  - Sidebar dark (#0F1217) con 9 secciones: logo, búsqueda, selector sucursal, accesos rápidos, divider, navegación, spacer, usuario, logout
  - Mobile: drawer slide-in con backdrop oscurecido, cierre con Escape/click backdrop
  - Estados: normal, hover, focus-visible, active (nav items)
  - `aria-current="page"` en item activo
  - `aria-label` en botones de solo icono
  - `overflow: hidden` en body cuando drawer abierto

### Dependencias agregadas

| Paquete | Tipo | Propósito |
|---------|------|-----------|
| `class-variance-authority` | runtime | Dependencia de shadcn/ui Button |
| `radix-ui` | runtime | Dependencia de shadcn/ui Avatar, Separator |

**Nota**: Los componentes shadcn/ui (button, avatar, input, separator) fueron instalados mediante `npx shadcn@latest add`. Los archivos se crearon en `src/components/ui/`.

### Configuraciones realizadas

- **CSS Variables (oklch)**: Todos los tokens del design system convertidos a oklch para consistencia con Tailwind CSS v4
- **Sidebar tokens**: Configurados para sidebar dark con accent, primary, border y ring propios
- **Dark mode**: Estructura `.dark` predefinida con tokens invertidos, preparada para habilitación futura
- **Tipografía**: Inter variable font cargada via Google Fonts, configurada como `--font-sans`

### Decisiones de diseño

1. **Sidebar dark**: Fondo #0F1217 (foreground del design system) para alto contraste y separación visual clara del contenido
2. **Nav activo**: Fondo primary (#B0E57E) con texto primary-foreground (#0F1217) — verde marca sobre oscuro
3. **Búsqueda en sidebar**: Input transparente con bg-white/10 sobre el dark, ring verde en focus
4. **Selector sucursal**: Botón con borde sutil, placeholder "Todas las sucursales"
5. **Accesos rápidos**: Icon buttons (Bell, Zap) con hover sutil
6. **Logout**: Hover rojo sutil (bg-red-500/10, text-red-400) para señal de acción destructiva
7. **Mobile**: Sidebar como drawer off-canvas con slide-in animation (200ms), backdrop bg-black/50
8. **Componentes shadcn/ui**: Instalados button, avatar, input, separator — componentes base para toda la app

### Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| Desktop (≥1024px lg) | Sidebar visible y estática (w-72), contenido flex-1 |
| Tablet (<1024px) | Sidebar oculta, header mobile con hamburger, drawer slide-in |
| Mobile (<640px) | Mismo comportamiento que tablet, padding contenido reducido (p-4) |

### Validación

- **TypeScript**: Compila sin errores (`npx tsc -b`)
- **Build producción**: Exitoso (`npm run build`) — bundles generados correctamente
- **Tests**: 1 test existente pasa (Dashboard title render)
- **Lint**: Solo warnings preexistentes en `routes/index.tsx` (lazy exports) y `button.tsx` (CVA export), sin warnings nuevos en código propio
- **Lint código propio**: Limpio tras corrección de 2 warnings iniciales (setState in effect → onClick handler, ref cleanup → variable capturada)

### Problemas encontrados y resueltos

1. **shadcn CLI paths**: El CLI creó archivos en `./@/components/ui/` en lugar de `./src/components/ui/`. Solucionado moviendo manualmente los archivos
2. **cva missing**: `class-variance-authority` no se instaló automáticamente con shadcn. Instalado manualmente con `npm install class-variance-authority`
3. **Lint warnings**: `react(set-state-in-effect)` por cerrar mobile en useEffect por cambio de ruta. Resuelto usando `onClick={closeMobile}` en Links. `react-hooks(exhaustive-deps)` por ref.current en cleanup. Resuelto capturando ref en variable

---

