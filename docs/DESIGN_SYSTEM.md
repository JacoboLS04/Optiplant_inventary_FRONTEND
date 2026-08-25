# Sistema de Diseño — OptiPlant Inventario

## Principio

Los wireframes del proyecto son referencia **estructural**, no visual. Este
documento define la identidad visual real que debe aplicarse sobre esa
estructura: qué va donde, no cómo se ve.

## Paleta — roles semánticos

| Token | Valor | Uso |
|---|---|---|
| `--color-foreground` | `#0F1217` | Texto principal, superficies de alto contraste (sidebar) |
| `--color-background` | `#FCFCFD` | Fondo base de la aplicación |
| `--color-surface` | `#FAFAFA` | Fondo de cards/paneles sobre el background base (leve diferencia de profundidad) |
| `--color-surface-muted` | `#EFF1F3` | Superficies secundarias: filas alternas de tabla, paneles de filtros, estados hover suaves |
| `--color-border` | `#C2C6C9` | Bordes, divisores |
| `--color-muted-foreground` | `#C2C6C9` (oscurecido ~40% para contraste AA) | Texto secundario/deshabilitado |
| `--color-primary` | `#B0E57E` | Acento de marca: botones primarios, ítem de navegación activo, indicadores positivos |
| `--color-primary-foreground` | `#0F1217` | Texto/ícono sobre fondo `primary` (el verde es claro, necesita texto oscuro encima) |

No es obligatorio usar los seis colores en cada pantalla — priorizar equilibrio visual sobre variedad.

## Tipografía

- **Familia:** Inter (variable font), fallback a `system-ui`.
- **Escala:** la escala por defecto de Tailwind (`text-xs` a `text-3xl`) es suficiente — no se necesita una escala custom.
- **Pesos:** 400 (texto de cuerpo), 500 (labels/énfasis), 600–700 (títulos/headers de sección).

## Principios de composición

- Bordes redondeados consistentes (`rounded-lg` para cards/inputs, `rounded-md` para botones) — coherente con el estilo `new-york` de shadcn/ui ya configurado.
- Sombras sutiles, nunca pesadas (`shadow-sm`/`shadow-md` de Tailwind, evitar sombras marcadas tipo Material).
- Estados obligatorios en todo componente interactivo: `default`, `hover`, `focus-visible`, `disabled`, y donde aplique `loading` y `error`.
- Estados vacíos (tablas/listas sin datos) con mensaje + ilustración simple o ícono, nunca una tabla en blanco sin contexto.
- Responsive mobile-first: sidebar colapsa a menú off-canvas o barra inferior en viewports pequeños, nunca se oculta sin alternativa de navegación.

## Componentes base shadcn/ui a instalar primero

`button`, `card`, `input`, `badge`, `table`, `sidebar` (o construcción custom equivalente si el primitive de shadcn no se ajusta al wireframe), `avatar`, `separator`.