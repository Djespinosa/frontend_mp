# Frontend — Prueba Técnica Michael Page

Micro-frontend con Webpack 5 Module Federation, organizado como workspace de npm con 4 paquetes independientes.

## Arquitectura

```
frontend/
├── shared/          (@mp/shared) — tipos del contrato de API, cliente HTTP (axios + manejo
│                     de errores), utilidades cross-cutting (API_BASE_URL, getErrorMessage),
│                     el hook useAsync y los 3 componentes realmente genéricos
│                     (ErrorMessage, LoadingIndicator, StatusBadge). No se pre-compila a dist/:
│                     cada paquete consumidor compila su fuente .ts directamente vía ts-loader/
│                     ts-jest, para no tener que orquestar un build previo.
├── host/            Shell: Layout, navegación principal, React Router raíz, carga los dos
│                     remotes de forma perezosa (React.lazy + Suspense), y además aloja
│                     HomePage/NotFoundPage y la vista de demo Mock Mail (no son remotes).
├── requester-app/    Remote "requesterApp": crear solicitud, panel de solicitudes, detalle
│                     de solicitud y descarga de PDF.
└── approval-app/     Remote "approvalApp": validar link, OTP, detalle de la compra,
                      aprobar/rechazar.
```

Cada remote expone un componente **agnóstico de router** (solo `<Routes>/<Route>` internos,
sin `<BrowserRouter>` propio) vía Module Federation — el host es quien provee el único
`<BrowserRouter>` de toda la aplicación, montando cada remote bajo su propio prefijo
(`/requests/*`, `/approve/*`). Esto evita conflictos de Router anidados y es el patrón
estándar para usar react-router-dom a través de Module Federation.

`react`, `react-dom` y `react-router-dom` están declarados como **singleton** en los tres
`webpack.config.js` (host + 2 remotes) — Module Federation garantiza que solo se cargue una
copia de cada uno en runtime, sin importar cuántos remotes se monten.

## Requisitos

- Node.js 20+

## Instalar dependencias

Una sola instalación en la raíz (npm workspaces resuelve las 4 paquetes y enlaza `@mp/shared`
automáticamente):

```
npm install
```

## Variables de entorno

Cada paquete que hace peticiones HTTP tiene su propio `.env.example` (`API_BASE_URL`). El host
además necesita `REQUESTER_APP_URL`/`APPROVAL_APP_URL` (dónde encontrar los `remoteEntry.js` de
cada remote — por defecto `http://localhost:3001` y `http://localhost:3002`).

## Desarrollo (los 3 servidores a la vez)

```
npm run dev
```

Levanta host (`:4000`), requester-app (`:3001`) y approval-app (`:3002`) en paralelo. Abrir
`http://localhost:4000`.

## Desarrollo de un solo remote de forma aislada

Cada remote **se puede construir y correr de forma completamente independiente**, sin el host
ni el otro remote:

```
cd requester-app
npm run dev
```

El `bootstrap.tsx` de cada remote monta su propio `<BrowserRouter>` con rutas simplificadas
relativas a `/` (por ejemplo requester-app expone `/`, `/new`, `/:id` en modo standalone, en
vez de `/requests`, `/requests/new`, `/requests/:id` como cuando lo monta el host) — así un
desarrollador puede trabajar en un remote sin tener que levantar los otros tres paquetes.

## Build de producción

Desde la raíz construye los 3 paquetes con bundle (`shared` no tiene build propio, se
compila-por-consumo):

```
npm run build
```

O de forma independiente por paquete: `cd host && npm run build`, etc.

## Verificar tipos / Lint / Tests (todo el workspace o por paquete)

```
npm run typecheck
npm run lint
npm test
npm run test:coverage
```

Cada comando usa `--workspaces --if-present`, así que también puede ejecutarse dentro de
cualquier paquete individualmente (`cd approval-app && npm test`).

## Notas de implementación

- **Sin duplicar lógica HTTP:** el cliente axios + el interceptor que normaliza errores a
  `ApiError` viven una sola vez en `@mp/shared`; los 3 servicios específicos de dominio
  (`requestService`/`evidenceService` en requester-app, `approvalService` en approval-app,
  `mockMailService` en host) solo importan `httpClient` de ahí.
- **Tipos del contrato:** todos los tipos que reflejan el contrato real del backend
  (`RequestDetail`, `ValidateOtpResponse`, `ApiError`, etc.) viven en `@mp/shared/src/types`
  — un único lugar, consumido por los 3 paquetes que hacen llamadas HTTP.
- **`host/src/types/remotes.d.ts`** declara ambientalmente el contrato de lo que expone cada
  remote (`requesterApp/RequesterApp`, `approvalApp/ApprovalApp`), ya que TypeScript no puede
  resolver esos módulos virtuales de Module Federation por sí solo.
- **`ts-loader` con `exclude` ajustado:** cada `webpack.config.js` excluye `node_modules`
  salvo `@mp/shared`, para compilar su fuente TypeScript directamente (es un paquete del
  workspace, no una dependencia externa pre-compilada). Mismo ajuste en `jest.config.js` vía
  `transformIgnorePatterns`.
- **Nada de esto rompe las páginas existentes:** las páginas, componentes y tests de negocio
  se movieron tal cual (mismo comportamiento, mismos 111 tests distribuidos entre los 4
  paquetes) — solo cambiaron las rutas de import hacia lo que ahora vive en `@mp/shared`.
