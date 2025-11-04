# 🚀 Frontend — Workflow Orchestration System

Este repositorio contiene el frontend del Sistema de Orquestación de Workflows con integración de servicios de IA. Está implementado con React + Vite + TypeScript + Tailwind CSS y dispone de un editor visual tipo n8n, sistema de mocks para desarrollo y pruebas (unitarias y E2E).

Resumen rápido:
- Stack: React 19, TypeScript, Vite, Tailwind CSS
- Editor visual: React Flow
- Validación: Zod
- Tests: Vitest (unit/integration) y Playwright (E2E)

## 📚 Contenido de este README

- Instalación y ejecución
- Scripts disponibles
- Arquitectura (alta a baja)
- Justificación de decisiones técnicas
- Estructura de carpetas
- Integración con backend y modo mock
- Testing
- Contribución rápida

---

## ⚡ Cómo ejecutar (rápido)

1. Instalar dependencias

```powershell
npm install
```

2. Configurar variables de entorno

```powershell
copy .env.example .env
# Editar .env según se necesite
```

Variables principales (en `.env`):

- `VITE_API_URL` — URL base del backend (ej. `http://localhost:8000`)
- `VITE_USE_MOCK` — `true` para modo mock (sin backend), `false` para usar API real

3. Ejecutar servidor de desarrollo

```powershell
npm run dev
```

El front quedará disponible por defecto en http://localhost:5173

4. Build de producción

```powershell
npm run build
```

---

## 🧰 Scripts útiles

- `npm run dev` — servidor de desarrollo (Vite)
- `npm run build` — build de producción
- `npm test` / `npm run test:ui` / `npm run test:run` / `npm run test:coverage` — Vitest
- `npm run test:e2e` / `npm run test:e2e:ui` / `npm run test:e2e:headed` — Playwright E2E
- `npm run lint` — lint con ESLint

---

## 🏗️ Arquitectura (visión general)

La aplicación sigue una arquitectura típica basada en componentes React con responsabilidades separadas:

- Entry point: `src/main.tsx` — inicializa React y carga `App`.
- Layout / Routing: `src/App.tsx` — define rutas protegidas y públicas usando `react-router-dom`.
- Contextos globales:
	- `AuthContext` — autenticación y usuario.
	- `ThemeContext` — tema (claro/oscuro).
- Pages (containers): en `src/pages/` — páginas de alto nivel (WorkflowsList, WorkflowEditor, RunDetail, Login).
- Components (presentacionales y ricos): en `src/components/` — UI reutilizable (badges, botones, modales, canvas de workflow).
- Editor visual: basado en `reactflow` para nodos y conexiones; lógica de undo/redo a través de hooks personalizados (ej. `useHistory`).
- Servicios/Domain:
	- `src/services/api.*` — cliente Axios para llamadas al backend y adaptadores (Adapter pattern).
	- `src/services/aiService.*` — abstracción para llamadas/operaciones IA.
	- `src/services/mockApi.*` / `mockData` — mocks para desarrollo sin backend.
- Tipos y validación: `src/types` + `zod` para validación de payloads y esquemas.

Comunicación de datos:
- Frontend ⇄ Backend: REST API (Axios). Las respuestas se adaptan/normalizan en `api`.
- Modo Mock: cuando `VITE_USE_MOCK=true`, la capa de servicios redirige a los mocks, permitiendo pruebas offline y desarrollo del UI sin backend.

Patrones aplicados:
- Container/Presentational: separación lógica/visual para testabilidad.
- Adapter: `api` adapta el contrato del backend a modelos front.
- Observer: `useEffect` y suscripciones para auto-refresh en vistas de ejecución.

---

## 🧠 Justificación técnica (por qué estas herramientas)

- Vite: arranque y HMR muy rápidos; ideal para desarrollo front moderno y compatible con TypeScript.
- React (con TypeScript): ecosystem y patrón de componentes permiten construir UIs complejas y reutilizables (especialmente para un editor visual).
- TypeScript: seguridad de tipos en tiempo de compilación, mejores IDE hints y reducción de errores en producción.
- Tailwind CSS: rapidez para construir UIs consistentes con utilidades; facilita temas (oscuro/neón) sin CSS pesado.
- React Flow: librería especializada para canvas de nodos/conexiones; evita construir desde cero la complejidad del editor.
- Axios: cliente HTTP con interceptores fáciles para auth/errors y adaptadores para mocks.
- Zod: validación y parsing de datos sencilla y composable (útil para validar payloads antes de enviarlos o al recibirlos).
- Vitest & Playwright: stack de pruebas moderno — Vitest rápido y compatible con Vite; Playwright para E2E reproducibles.
---

## 🗂️ Estructura de carpetas (resumida)

```text
src/
├── components/    # UI reusable (badges, modales, canvas, nodos)
├── pages/         # Contenedores principales (WorkflowsList, WorkflowEditor, RunDetail, Login)
├── services/      # api, aiService, mocks
├── context/       # AuthContext, ThemeContext
├── hooks/         # hooks personalizados (undo/redo, etc.)
├── types/         # definiciones TypeScript
├── App.tsx        # routing y layout
└── main.tsx       # entry point
```

---

## 🔌 Integración con Backend y Modo Mock

El frontend consume una API REST con endpoints para workflows y runs (ver lista en `src/services/api`). Para desarrollo y demos offline existe un modo mock que emula la API completa. Cambiar entre ambos modos desde la variable `VITE_USE_MOCK`.

Recomendación para desarrollo local: arranca el backend (si se necesita) y en `.env` pon `VITE_USE_MOCK=false`.

---

## 🧪 Testing

- Unit / Integration: Vitest + Testing Library
- E2E: Playwright (configurado en `playwright.config.ts`)

Comandos:

```powershell
npm test                # Vitest (watch)
npm run test:run        # Ejecutar tests una sola vez
npm run test:coverage   # Coverage
npm run test:e2e        # Playwright E2E
```