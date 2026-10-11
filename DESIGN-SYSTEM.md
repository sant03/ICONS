# ICONS — Design System

**Sistema de Control de Inventario · PlastyFreddy**
Documento generado desde el código fuente · Angular `21.2.24` · Tailwind CSS `4.3.3` · Lucide `1.48.0`.

---

## 1. Overview

| | |
|---|---|
| **Producto** | ICONS — Sistema de Control de Inventario (PlastyFreddy) |
| **Stack de UI** | Angular 21 (standalone + signals), Tailwind CSS v4, `@lucide/angular` 1.48.0 |
| **Fuente de verdad** | Las clases Tailwind escritas en los templates (`src/app/**/*.html`) |
| **Referencia de diseño** | `ICONS UI V.2/src/imports/visily-multiscreens__1_.pdf` (21 pantallas) |
| **Origen** | Migración 1:1 desde React + Vite (`ICONS UI V.2`), sin desviaciones de diseño |
| **Idiomas** | Español (UI principal) con labels de módulo en inglés |

### 1.1 Principios de diseño

1. **Dark-first.** El tema por defecto es `dark`; los tokens semánticos (`--bg-card`, `--text-muted`…) permiten light mode sin reescribir componentes.
2. **Densidad operativa.** Es un panel de control enterprise: tipografía pequeña (`text-xs` = 12px), grid compacto, mucho dato por pantalla.
3. **Un solo acento.** El cian es la única acción de marca; el resto de colores son estados semánticos.
4. **Los datos van en monoespaciada.** IDs, fechas, montos, SKUs y badges de estado usan `font-mono` para alineación en columna.
5. **Superficies, no sombras duras.** Las tarjetas se separan por `border-[var(--border-color)]` + `shadow-sm`; las sombras de color solo en acciones primarias.

---

## 2. Color

### 2.1 Tokens semánticos (CSS custom properties)

Definidos en `src/styles.css` dentro de `@layer base`. Se aplican vía `var(--token)` en clases arbitrarias: `bg-[var(--bg-card)]`, `text-[var(--text-muted)]`, etc.

| Token | Light | Dark | Uso típico |
|---|---|---|---|
| `--bg-primary` | `#f8fafc` | `#0b0f19` | Fondo de página, `body` |
| `--bg-secondary` | `#ffffff` | `#111827` | Header, sidebar, footer de tarjeta |
| `--bg-tertiary` | `#f1f5f9` | `#1f2937` | Inputs, botones secundarios, hover |
| `--bg-card` | `#ffffff` | `#131c2e` | Superficie de tarjeta/modal |
| `--text-primary` | `#0f172a` | `#f8fafc` | Títulos y valores |
| `--text-secondary` | `#475569` | `#94a3b8` | Texto de apoyo, celdas |
| `--text-muted` | `#64748b` | `#64748b` | Labels, metadatos, placeholders |
| `--border-color` | `#e2e8f0` | `#1e293b` | Bordes de tarjeta, divisores |
| `--accent-blue` | `#0284c7` | `#38bdf8` | Reservado (heredado) |
| `--accent-blue-hover` | `#0369a1` | `#0284c7` | Reservado (heredado) |
| `--accent-cyan` | `#06b6d4` | `#22d3ee` | Reservado (heredado) |
| `--accent-teal` | `#0d9488` | `#14b8a6` | Reservado (heredado) |
| `--accent-pink` | `#ec4899` | `#f472b6` | Reservado (heredado) |
| `--card-shadow` | `0 4px 20px -2px rgba(0,0,0,.05)` | `0 4px 25px -2px rgba(0,0,0,.4)` | Token de sombra (referencia) |

> Los tokens `--accent-*` y `--card-shadow` se conservan por paridad con el diseño original, pero la UI usa directamente las utilidades Tailwind (ver §2.2).

### 2.2 Paleta de estados (Tailwind v4 — valores `oklch` reales)

| Rol | Clase | oklch | Aplicación |
|---|---|---|---|
| **Primary / marca** | `cyan-500` | `oklch(71.5% 0.143 215.221)` | Botón primario, texto activo, FAB |
| Primary hover | `cyan-600` | `oklch(60.9% 0.126 221.723)` | `hover:bg-cyan-600` |
| Primary subtle | `cyan-500/10` | — | Fondo de badge, chip, tint |
| Primary borde | `cyan-500/20` | — | `border-cyan-500/20` |
| **Success** | `emerald-500` | `oklch(69.6% 0.17 162.48)` | `COMPLETED`, sesión activa, `online` |
| Success hover | `emerald-600` | `oklch(59.6% 0.145 163.225)` | — |
| **Warning** | `amber-500` | `oklch(76.9% 0.188 70.08)` | `PENDING`, stock bajo |
| Warning legible | `amber-400` | `oklch(82.8% 0.189 84.429)` | Icono de sol / warning en dark |
| **Danger** | `rose-500` | `oklch(64.5% 0.246 16.439)` | Eliminar, deshabilitar, logout |
| Danger suave | `rose-400` | `oklch(71.2% 0.194 13.428)` | Texto de "suspend access" |
| **Info** | `indigo-500` | `oklch(58.5% 0.233 277.117)` | Badge `IN_STOCK` |
| Info degradado | `indigo-600` | `oklch(51.1% 0.262 276.966)` | Gradiente de avatar |
| **Acento alt.** | `pink-500` | `oklch(65.6% 0.241 354.308)` | Badge de rol / categoría |
| Gradiente marca | `sky-600 → cyan-500 → teal-400` | `oklch(58.8%…)` / `oklch(77.7%…)` | `bg-gradient-to-tr` del logo |
| Overlay modal | `black/60` + `backdrop-blur-sm` | — | Modales y FAB stack |

### 2.3 Reglas de color

- **Superficie:** `bg-[var(--bg-card)]` + `border border-[var(--border-color)]` + `shadow-sm`.
- **Estado sólido:** `bg-<color>-500/10 text-<color>-500 border border-<color>-500/20` (patrón badge canónico).
- **Nunca** texto de estado sobre fondo sólido de su propio color: se usa el tinte 10% + borde 20%.
- Los degradados solo aparecen en el logo del header, el welcome y el avatar de usuario.

---

## 3. Tipografía

### 3.1 Familias

| Familia | Clase | Uso |
|---|---|---|
| System sans | `font-sans` (default del body) | Todo el texto de interfaz |
| Mono | `font-mono` | IDs, montos, fechas, SKUs, badges, `<kbd>` |

Stack del body (`src/styles.css`):
`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`

> No hay webfonts. El monoespaciado es el del sistema para evitar descargas y mantener la alineación tabular.

### 3.2 Escala de tamaños (valores usados en el proyecto)

| Clase | Tamaño | Line-height | Uso |
|---|---|---|---|
| `text-[9px]` | 9px | — | Micro-labels en tarjetas de catálogo |
| `text-[10px]` | 10px | — | Labels en `uppercase`, badges, `<th>`, KPI |
| `text-[11px]` | 11px | — | Metadatos secundarios |
| `text-xs` | 12px | 16px | **Default del sistema**: botones, inputs, celdas |
| `text-sm` | 14px | 20px | Descripción de vistas |
| `text-base` | 16px | 24px | Títulos de tarjeta, nombres de usuario |
| `text-lg` | 18px | 28px | Subtítulos, títulos de modal |
| `text-xl` | 20px | 28px | Títulos de sección |
| `text-2xl` | 24px | 32px | Título de página (`h1`) |
| `text-3xl` | 30px | 36px | Título del welcome |

### 3.3 Pesos

| Peso | Uso |
|---|---|
| `font-medium` (500) | Texto de botón, chips |
| `font-semibold` (600) | Labels, títulos de tarjeta, item de navegación |
| `font-bold` (700) | Títulos de card, `h1` de ajustes, usernames |
| `font-extrabold` (800) | `h1` de vista, cifras KPI |
| `font-black` (900) | Montos totales, métricas destacadas |

### 3.4 Convenciones tipográficas

- **Labels de sistema:** `text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]`.
- **Títulos de página:** `text-2xl font-extrabold tracking-tight text-[var(--text-primary)]`.
- **Cifras:** `font-mono` + `tabular-nums` implícito; nunca usar la sans para columnas de dinero.
- **Tracking:** `tracking-tight` en títulos grandes, `tracking-wider` en labels uppercase.
- **Interlineado:** `leading-tight` en textos de badge y avatar.

---

## 4. Espaciado

Base de 4px — `--spacing: 0.25rem` (Tailwind v4). No hay escalas custom.

| Grupo | Clases en uso | px |
|---|---|---|
| Micro | `p-0.5` `p-1` `p-1.5` `p-2` `p-2.5` | 2 – 10 |
| Compacto | `p-3` `p-3.5` `p-4` `p-5` | 12 – 20 |
| Tarjeta | `p-6` | 24 |
| Vista | `p-4 lg:p-8` | 16 → 32 |
| Gap | `gap-1` … `gap-8` | 4 – 32 |
| Stack vertical | `space-y-1` … `space-y-8` | 4 – 32 |
| Padding de página | `p-4 lg:p-8` | responsive |

**Regla:** el padding de vista es siempre `p-4 lg:p-8`; el de tarjeta es `p-4`, `p-5` o `p-6`; el de modal es `p-6`.

---

## 5. Radios, bordes y elevación

### 5.1 Radios (`--radius-*`)

| Clase | Valor | Uso |
|---|---|---|
| `rounded-lg` | 0.5rem (8px) | Stepper +/- de stock, badge inline |
| `rounded-xl` | 0.75rem (12px) | **Botones, inputs, selects, chips de filtro** |
| `rounded-2xl` | 1rem (16px) | Botón de icono, tarjeta compacta, dropdown |
| `rounded-3xl` | 1.5rem (24px) | **Tarjetas principales, modales, paneles** |
| `rounded-full` | 9999px | Avatares, FAB, dots de estado, pills |
| `rounded-[10px]` / `rounded-[14px]` | 10 / 14px | inner del logo del header |

### 5.2 Bordes

- Ancho por defecto: `border` (1px) con `border-[var(--border-color)]`.
- `border-2` solo en el FAB (`border-white/20`) y en el input de checkbox.
- divisores de tabla: `divide-y divide-[var(--border-color)]`.
- Enfocar input: `focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500`.
- Badge de estado: `border border-<color>-500/20`.

### 5.3 Sombras

| Clase | Valor | Uso |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgb(0 0 0/.1), 0 1px 2px -1px rgb(0 0 0/.1)` | Tarjetas, botón de icono, avatar |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0/.1)…` | Botón primario (`shadow-cyan-500/20/25`), logo |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0/.1)…` | Botón primario, header de card |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0/.1)…` | Dropdown de usuario, hover de card |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0/.25)` | Modales |
| `shadow-inner` | `inset 0 2px 4px rgb(0 0 0/.05)` | Icono del welcome |
| `shadow-cyan-500/20` `/25` `/50` | tinte de marca | Botón primario, FAB |
| `ring-4 ring-cyan-500/20` | — | Avatar de usuario en card |

---

## 6. Layout

### 6.1 Breakpoints

| Prefijo | rem | px | Comportamiento del shell |
|---|---|---|---|
| `sm` | 40 | 640 | Grid de 2 columnas, header compacto |
| `md` | 48 | 768 | Header en fila, buscador visible, form en 3 col |
| `lg` | 64 | 1024 | Sidebar `w-64`, padding de vista `p-8`, grids de 3–5 col |
| `xl` | 80 | 1280 | — |
| `2xl` | 96 | 1536 | — |

### 6.2 App Shell

```
┌───────────────────────────────────────────────────────┐
│ Header  h-16 (64px)  sticky top-0 z-30                │  bg-[var(--bg-secondary)]/90 + backdrop-blur-md
├──────────┬────────────────────────────────────────────┤
│ Sidebar  │  <main>  flex-1 overflow-y-auto            │
│ w-64     │  contenido con p-4 lg:p-8                  │
│ (256px)  │                                            │
│ z-auto   │  pb-20 / pb-24 (reserva para el FAB)       │
└──────────┴────────────────────────────────────────────┘
   FAB  fixed bottom-6 right-6  w-14 h-14  z-40
   Modal  fixed inset-0  z-50
```

- **Header:** `h-16 px-4 lg:px-6 flex items-center justify-between border-b`.
- **Sidebar:** `w-64 border-r p-4 shrink-0 min-h-[calc(100vh-4rem)]`, items `py-2.5 px-3 rounded-xl text-xs`.
- **Main:** `flex-1 overflow-y-auto bg-[var(--bg-primary)]`, hijos con `p-4 lg:p-8 space-y-8`.
- **Anchos de contenido:** `max-w-5xl` (marco de welcome), `max-w-xl` (contenedor principal de las pantallas auth), `max-w-2xl` (tarjeta de login/register), `max-w-sm` (párrafo secundario de welcome, modales de confirmación y de "Ordenar Por"), `max-w-3xl` (settings), `max-w-md` (modales: nueva venta, detalle de pedido, producto, búsqueda del header), `max-w-lg` (modal "Editar Registro, Ventas"), `max-w-xl` (modal "Crear Pedido").
- **Grids:** `sm:grid-cols-2 lg:grid-cols-3` (productos, catálogo PO), `lg:grid-cols-4` (KPI, pedidos), `lg:grid-cols-5` (catálogo), `lg:grid-cols-12` (users 4/8).

### 6.3 Rutas y navegación

| Ruta | Vista | Shell |
|---|---|---|
| `/welcome`, `/login`, `/register` | `WelcomeAuth` | No (pantalla completa) |
| `/dashboard` | `Dashboard` | Sí |
| `/sales` | `SalesView` | Sí |
| `/orders` | `OrdersView` | Sí |
| `/purchase-order` | `PurchaseOrderView` (crear nueva orden) | Sí |
| `/purchase-orders` | `PurchaseOrdersView` (todas las órdenes) | Sí |
| `/purchase-order-detail/:id` | `PurchaseOrderDetailView` (documento de una orden) | Sí |
| `/users` | `UsersView` (módulo de personal) | Sí |
| `/profile` | `Profile` (perfil personal) | Sí |
| `/products` | `ProductsView` | Sí |
| `/settings` | `SettingsView` | Sí |
| `/clients` | `ClientsView` (tab Clientes) | Sí |
| `/suppliers` | `SuppliersView` (tab Proveedores) | Sí |

Nota: la entrada de sidebar **"Clientes / Proveedores"** (`id: 'clients'`, icono `Handshake`) abre `/clients` y permanece resaltada también en `/suppliers` —`AppStore.isViewActive('clients')` cubre ambas pestañas—, igual que `/profile` mantiene **Usuarios**. El atajo del dashboard apunta al mismo destino (`/clients`).

Nota: **"Orden de Compra"** es un módulo de tres vistas, todas bajo el mismo item del sidebar (`id: 'purchase-orders'`, `isViewActive` cubre las tres): entrar al menú muestra `/purchase-orders` (la lista), cada tarjeta abre `/purchase-order-detail/:id` (el documento) y el botón "Crear Orden" lleva a `/purchase-order` (el formulario). El "BACK TO ORDERS" del formulario y el "VER TODAS" del documento devuelven a la lista.

---

## 7. Componentes

### 7.1 Inventario

| Componente | Archivo | Descripción |
|---|---|---|
| App Shell | `layout/shell/shell.{ts,html}` | Header + Sidebar + outlet + modal global |
| Header | `layout/header/header.{ts,html}` | Marca, buscador global, estado, tema, avatar, dropdown |
| Sidebar | `layout/sidebar/sidebar.{ts,html}` | 8 módulos + badge + highlight + logout |
| Welcome / Auth | `features/welcome/welcome-auth.{ts,html}` | 3 modos: welcome, login, register |
| Dashboard | `features/dashboard/dashboard.{ts,html}` | 4 KPI, 4 módulos, actividad reciente, atajos |
| Sales | `features/sales/sales-view.{ts,html}` | 4 KPI, filtros, 2 tablas con "ESTADO DE PAGO" y "ACCIONES", selección + "Agrupar en Pedido", "Ordenar Por", export CSV, FAB |
| New Sale Modal | `features/sales/new-sale-modal.{ts,html}` | Modal global de registro de venta |
| Orders | `features/orders/orders-view.{ts,html}` | Grid de pedidos, modal crear, modal detalle |
| Products | `features/products/products-view.{ts,html}` | Grilla agrupada por categoría, chips de categoría + barra de búsqueda, filtro "Mostrar solo con Stock disponible", panel lateral "Detalles del Producto", modal Añadir/Editar Producto, modal Nueva Categoría, FAB |
| Purchase Order | `features/purchase-order/purchase-order-view.{ts,html}` | Detalles, catálogo, tabla de líneas, total (formulario de creación) |
| Purchase Orders | `features/purchase-orders/purchase-orders-view.{ts,html}` | Lista "Todas las Órdenes de Compra": búsqueda, tarjetas con miniatura de ítems, total |
| Purchase Order Detail | `features/purchase-order-detail/purchase-order-detail-view.{ts,html}` | Documento de la orden: datos de proveedor, tabla de ítems, bloque de aprobación, acciones |
| Users | `features/users/users-view.{ts,html}` | Filtros por rol, lista de personal, detalle, config avanzada y actividad |
| Profile | `features/profile/profile.{ts,html}` | Avatar, seguridad, formulario, audit trail |
| Settings | `features/settings/settings-view.ts` | 3 filas de configuración del sistema |
| Clients | `features/clients/clients-view.{ts,html}` | Pestañas, lista de clientes, ficha de detalle, modal crear/editar, FAB |
| Suppliers | `features/suppliers/suppliers-view.{ts,html}` | Pestañas, lista de proveedores, ficha de detalle, modal crear/editar, FAB |

Nota de fidelidad: los mockups de Clientes/Proveedores dibujan el teléfono y la fila seleccionada en azul (`blue-600`) y el FAB de Proveedores en negro; aquí se usan `cyan-600` y el FAB cyan canónico (§7.2 / §10.2.1) para no introducir colores fuera de la paleta.

Nota de fidelidad (Sales): la fuente `ICONS COMPLETE/src/views/SalesView.tsx` dibuja las tablas en azul (`blue-*`) y solo habilita las casillas de agrupación en la tabla de archivo; aquí ambas tablas comparten la selección (`SaleRecord.id` es única entre `todaySales` e `historicalSales`) para que las ventas del día también se puedan agrupar. El resto (columnas, badges, modales y la barra flotante de selección) mantiene la composición de la fuente.

Nota de fidelidad (Products): `ICONS COMPLETE/src/views/ProductsView.tsx` se migró con su grilla por categoría (`Package` + contador), el panel lateral "Detalles del Producto" con alerta "Por Agotarse" y los modales de producto y categoría. Desviaciones deliberadas: (1) el punto ámbar de "Por Agotarse" se sustituyó por el **chip de estado de stock** del Design System (§7.5) dentro de cada card, y el estado se calcula contra el `minPurchase` del producto en lugar de un umbral fijo; (2) `onUpdateProduct` del source es un stub con `alert()`, así que "Editar" abre el mismo modal de producto precargado; (3) "Nueva Categoría" escribe en `AppStore.productCategories` (el source solo avisa) para que el chip y el `<select>` del formulario incluyan la categoría nueva; (4) el azul `blue-*` del source pasa a `cyan-*` según §10.2.1.

### 7.2 Botones

| Variante | Clases base | Ejemplo |
|---|---|---|
| **Primary** | `px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer` | `+ New Sale`, `Añadir Producto`, `Crear Pedido` |
| **Secondary** | `px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border-color)]` | `Export CSV`, `Schedule Order` |
| **Ghost / outline** | `flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]` | `Cancelar` |
| **Icon** | `p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)]` | Tema, campana, filtro |
| **Destructive** | Secondary + `text-rose-500 hover:bg-rose-500/10` | `DISABLE ACCOUNT`, `Cerrar Sesión` |
| **Submit** | `w-full py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2` | `LOG IN`, `CREATE ACCOUNT` |
| **Stepper** | `w-6 h-6 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] font-bold` | `-` / `+` de stock |
| **FAB** | `fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-2xl shadow-cyan-500/50 hover:scale-110 active:scale-95 border-2 border-white/20 z-40` | `+` en Sales y Orders |

Todos los botones interactivos llevan `cursor-pointer` y `type="button"` (o `type="submit"` en formularios).

### 7.3 Formularios

| Elemento | Especificación |
|---|---|
| Input de texto | `w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500` |
| Input con icono | Igual + `relative` con `svg` en `absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]` e input `pl-10` |
| Input mono | Añadir `font-mono` (fechas, teléfonos, códigos) |
| Select | `w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] … border border-[var(--border-color)]` |
| Checkbox | `rounded text-cyan-500 focus:ring-cyan-500` (+ `border-gray-300` en el de términos) |
| Label | `text-xs font-semibold text-[var(--text-primary)]` o `text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]` con icono `w-3 h-3 text-cyan-500` |
| Contenedor | `space-y-4` en el form, `space-y-1` por campo, `grid grid-cols-2 gap-3` para pares |
| Estado de éxito | `p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2` + `CheckCircle2` |

### 7.4 Superficies

| Componente | Clases |
|---|---|
| **Tarjeta** | `p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm` |
| Tarjeta compacta | `p-4 rounded-2xl bg-[var(--bg-card)] border … shadow-sm` |
| Tarjeta KPI | `p-4 rounded-2xl … space-y-2` con label `text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]` + icono `w-4 h-4 text-cyan-500` |
| Tabla | `w-full text-left border-collapse` + header `text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]` + `divide-y divide-[var(--border-color)] text-xs` + row `hover:bg-[var(--bg-tertiary)]/50 transition-colors` |
| Panel | `p-6 rounded-3xl … space-y-6` con header `border-b border-[var(--border-color)] pb-3` |
| Overlay | `fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4` |
| Modal | `bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl w-full max-w-md p-6 space-y-5` |
| Dropdown | `absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border … shadow-xl py-2 z-50` |
| Banner de estado | `px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-semibold flex items-center gap-1.5` + dot `w-2 h-2 rounded-full bg-emerald-500 animate-pulse` |

### 7.5 Badges y estados

| Estado | Clases | Color |
|---|---|---|
| `COMPLETED` / `IN_STOCK` / `DISPONIBLE` | `px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20` | emerald |
| `PENDING` / `LOW_STOCK` / `STOCK BAJO` | idéntica con `amber-500` | amber |
| `OUT_OF_STOCK` / `AGOTADO` / errores | idéntica con `rose-500` | rose |
| `SHIPPED` / informativo | idéntica con `cyan-500` | cyan |
| Chip de stock en la card de Productos | `DISPONIBLE`→emerald, `STOCK BAJO`→amber, `AGOTADO`→rose (mismas clases base) | emerald / amber / rose |
| Rol / categoría | `bg-pink-500/10 text-pink-500 border-pink-500/20` | pink |
| Neutral (SKU, categoría) | `bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-color)]` | token |
| Contador | `px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-mono font-semibold` | cyan |
| Activo en sidebar | `px-1.5 py-0.5 text-[10px] font-bold rounded-full` → `bg-white/20 text-white` (activo) / `bg-cyan-500/10 text-cyan-500 border border-cyan-500/20` | context |

**Mapeo de estados de dominio** (`src/app/core/models/types.ts`):

| Dominio | Valores | Color por defecto |
|---|---|---|
| `Transaction.status` | `Completado` · `En Proceso` · `Verificado` · `Pendiente` · `Cancelado` | Completado→emerald, Pendiente→amber, resto→neutral |
| `OrderItem.status` | `COMPLETED` · `PENDING` · `SHIPPED` · `CANCELLED` | COMPLETED→emerald, PENDING→amber, SHIPPED→cyan |
| `ProductCatalogItem.status` | `IN_STOCK` · `LOW_STOCK` · `OUT_OF_STOCK` | IN_STOCK→emerald, LOW_STOCK→amber, OUT_OF_STOCK→rose |
| `SaleRecord.paymentStatus` | `Pagado` · `Debe` | Pagado→emerald, Debe→amber (con `amountDue` en el texto) |
| `UserProfile.status` | `ACTIVE` · `LOCKED` · `SUSPENDED` | ACTIVE→emerald, LOCKED→amber, SUSPENDED→rose |

### 7.6 Iconografía

- **Librería:** `@lucide/angular` v1.48.0 (**no** `lucide-angular`, deprecado).
- **Uso estático:** `<svg lucideNombre class="w-4 h-4 text-cyan-500"></svg>`.
- **Uso dinámico (sidebar):** `<svg [lucideIcon]="item.icon" [class]="'w-4 h-4 ' + …"></svg>`.
- **Tamaños en uso:**

| Clase | px | Contexto |
|---|---|---|
| `w-3 h-3` / `w-3.5 h-3.5` | 12 / 14 | Labels, iconos de botón pequeño, inline con texto |
| `w-4 h-4` | 16 | **Default**: botón, input, navegación, header |
| `w-5 h-5` | 20 | Logo, título de modal |
| `w-6 h-6` | 24 | Icono de producto |
| `w-7 h-7` | 28 | FAB |
| `w-8 h-8` | 32 | Icono grande (pedidos, welcome) |

- **Colores:** `text-cyan-500` (activo/primario), `text-[var(--text-muted)]` (inactivo), `text-[var(--text-secondary)]` (secundario), `text-white`, `text-amber-400` (sol), `text-rose-500` (destructivo), `text-slate-700` (luna en light).
- **Inventario:** 62 iconos distintos en uso, listados en el Apéndice A.

### 7.7 Avatar

| Variante | Clases |
|---|---|
| Inicial (header) | `w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-sm ring-2 ring-cyan-500/20` |
| Foto (usuarios) | `relative w-36 h-36 rounded-3xl overflow-hidden ring-4 ring-cyan-500/20` + `<img class="w-full h-full object-cover">` + botón cámara `absolute bottom-2 right-2 p-2 rounded-xl bg-cyan-500 text-white shadow-md` |
| Icono (catálogo) | `w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20` |
| Marca (header) | `w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 p-0.5` + inner `bg-[var(--bg-secondary)] rounded-[10px]` |

### 7.8 Logo del sistema

```html
<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 p-0.5 shadow-md">
  <div class="w-full h-full bg-[var(--bg-secondary)] rounded-[10px] flex items-center justify-center">
    <svg lucideLayoutGrid class="w-5 h-5 text-cyan-500"></svg>
  </div>
</div>
```

---

## 8. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `duration-150` | 150ms | Hover de botón, dropdown, badge |
| `duration-200` | 200ms | Cambios de tema de color, `transition-colors` global |
| `transition-all` | — | Botones, avatar, theme toggle |
| `transition-colors` | — | Filas de tabla, links, theme |
| `transition-transform` | — | Hover del logo, `translate-x-1` del chevron |
| `hover:scale-105` | 105% | Botón de cámara, tarjeta de catálogo |
| `hover:scale-110` / `active:scale-95` | 110% / 95% | FAB, item de pedido |
| `group-hover:translate-x-1` | — | Chevron de login y botón de acción |
| `animate-pulse` | — | Dot de sistema online, dot de notificaciones |
| `animate-ping` | — | Highlight del item "Orden de Compra" en sidebar |

### 8.1 Clases reservadas (sin efecto)

El diseño original usa clases de `tailwindcss-animate` que **no están instaladas** en este proyecto (ni en el original), por lo que hoy no producen animación. Se conservan por paridad visual futura:

`animate-in` · `fade-in` · `fade-out` · `zoom-in-95` · `slide-in-from-top-2`

> Si se instalan, estas clases activarán la animación de entrada de modales, vistas y dropdowns sin necesidad de tocar los templates.

---

## 9. Tematización

- El tema vive en la clase `dark` sobre `<html>`, aplicada por `effect()` en `src/app/app.ts` leyendo `AppStore.theme()`.
- Estado inicial: `dark`.
- Toggle en Header y en Welcome (`Sun` en dark, `Moon` en light).
- Los componentes **nunca** leen el tema directamente: solo usan `store.theme()` para el icono o la etiqueta.
- Transición global: `body { transition: background-color .2s ease, color .2s ease }` + `transition-colors duration-200` en el shell.
- En light mode el único ajuste manual es el icono de luna: `text-slate-700`.

---

## 10. Reglas de uso

### 10.1 Hacer

1. Reutilizar tokens semánticos (`var(--bg-card)`) en lugar de hex directos.
2. Mantener `text-xs` como tamaño default de UI densa.
3. Usar `font-mono` para cualquier valor que secompare en columna.
4. Derivar el estado visual del estado de dominio con el patrón badge (§7.5).
5. Respetar la escala de radios: `xl` en controles, `2xl` en superficies pequeñas, `3xl` en tarjetas y modales.
6. Mantener `p-4 lg:p-8` y `space-y-8` en la raíz de cada vista.
7. Dejar `pb-20`/`pb-24` cuando la vista tenga FAB.

### 10.2 No hacer

1. ❌ Introducir colores fuera de la paleta cyan/emerald/amber/rose/indigo/pink/slate.
2. ❌ Usar sombras de color en superficies que no sean acción primaria o FAB.
3. ❌ Agregar gradientes fuera de logo, welcome y avatar.
4. ❌ Subir `z-index` por encima de `z-50` (reservado a modales).
5. ❌ Introducir otro rojo/verde para estados: el mapeo es fijo (§7.5).
6. ❌ Usar `alert()` nativo salvo confirmación destructiva legacy (`notify()` en `UsersView` y `PurchaseOrderView`).
7. ❌ Romper el grid responsive: siempre declarar `grid-cols-1` como base.

---

## 11. Accesibilidad

- Contraste: texto primario sobre `--bg-card` cumple AA en ambos temas; los estados usan tinte 10% + texto 500 solo en textos grandes o iconos, y badges van acompañados de texto (nunca solo color).
- Todo elemento interactivo es `<button type="button">` con `cursor-pointer`; los enlaces usan `hover:underline`.
- Inputs con `<label for>` en register/orders/modal; en Sales los filtros de columna usan `<label>` envolvente.
- Iconos decorativos sin texto: agregar `aria-hidden="true"` (pendiente de estandarizar).
- El modal no implementa focus trap ni `Esc` para cerrar (pendiente).
- Objetivos táctiles: el FAB (56px) y los botones de icono (36–40px) superan los 24px mínimos de WCAG 2.2.

---

## 12. Apéndice A — Inventario de iconos

| Grupo | Iconos |
|---|---|
| Navegación | `LayoutGrid`, `Home`(dinámico), `Users`, `TrendingUp`, `ShoppingBag`, `Package`, `FileText`, `Settings`(dinámico), `Handshake`, `LogOut`, `ChevronRight`, `ChevronDown`, `ArrowLeft`, `ArrowRight` |
| Acciones | `Plus`, `PlusCircle`, `Check`, `CheckCircle2`, `X`, `Trash2`, `Edit`, `SquarePen`, `Filter`, `Search`, `Download`, `Share2`, `ArrowUpDown`, `Sparkles`, `Box`, `Tag`, `Package`, `MessageCircle`, `AlertCircle`, `FolderPlus`, `Layers` |
| Estado / sistema | `ShieldCheck`, `Lock`, `Power`, `UserX`, `Database`, `Clock`, `Calendar`, `History`, `Eye`, `EyeOff`, `Bell`, `Sun`, `Moon` |
| Datos | `DollarSign`, `ArrowUpRight`, `ArrowDownRight` |
| Usuario / auth | `User`, `UserPlus`, `Briefcase`, `Phone`, `Mail`, `Building`, `MapPin`, `CreditCard`, `LogIn`, `Camera` |
| Archivos | `FileCheck`, `FileText`, `Image` |

Total: **62 iconos** distribuidos en 16 templates (13 de feature + 3 de layout).

---

## 13. Apéndice B — Mapa de archivos

```
src/
├── styles.css                        # @import 'tailwindcss' + tokens de tema
├── index.html                        # lang="es", <app-root>
└── app/
    ├── app.ts                        # effect(): clase `dark` en <html>
    ├── app.config.ts                 # provideRouter(withHashLocation())
    ├── app.routes.ts                 # 15 rutas
    ├── core/
    │   ├── models/types.ts           # ViewMode, ThemeMode, StaffGroup, 12 interfaces
    │   ├── models/mock-data.ts       # datos de demostración + lista de personal
    │   └── state/app-store.ts        # signals + acciones
    ├── layout/
    │   ├── shell/                    # header + sidebar + outlet + modal
    │   ├── header/
    │   └── sidebar/
    └── features/
        ├── welcome/  dashboard/  sales/  orders/
        ├── products/  users/  profile/  purchase-order/  settings/
        ├── clients/  suppliers/
        ├── purchase-orders/  purchase-order-detail/
```

Cada feature sigue el patrón `nombre.ts` (lógica, `templateUrl`) + `nombre.html` (marcado con Tailwind), con un comentario `<!-- Ported 1:1 from "…tsx" -->` en la primera línea como trazabilidad al original React. Excepción: `features/users/`, `features/clients/` y `features/suppliers/` son componentes nuevos (no existían en React) y se construyeron desde el mockup de su módulo; su cabecera lo indica en TypeScript. `features/purchase-orders/` y `features/purchase-order-detail/` sí tienen original React, pero en el proyecto **ICONS COMPLETE** (no en `ICONS UI V.2`): su cabecera declara esa ruta.

---

## 14. Checklist para nuevos componentes

1. Crear `src/app/features/<nombre>/<nombre>.ts` + `.html` con el comentario de trazabilidad.
2. `imports:` solo con los `Lucide*` realmente usados (evita el warning NG8113).
3. Estado local con `signal()`; estado compartido en `AppStore`.
4. Registrar la ruta en `app.routes.ts` y el item en `sidebar.ts` / `header.ts` si aplica.
5. Usar tokens semánticos, `text-xs`, `rounded-xl` en controles y `rounded-3xl` en superficies.
6. Verificar light y dark, y los breakpoints `sm`/`md`/`lg`.
7. `npm.cmd run build` sin warnings y `npm.cmd test` en verde.
