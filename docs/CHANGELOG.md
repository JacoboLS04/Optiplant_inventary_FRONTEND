# Changelog — Frontend OptiPlant

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

