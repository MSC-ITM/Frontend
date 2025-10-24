# Workflow Orchestration System - Frontend

Frontend del Sistema de Orquestación de Flujos de Trabajo basado en IA, desarrollado con React + Vite + Tailwind CSS.

## ✨ Características Principales

- **Editor Visual Interactivo**: Diseñador de workflows tipo n8n con drag & drop de nodos
- **Gestión de Workflows**: Crear, editar, eliminar y listar workflows
- **Conectividad Visual**: Conecta nodos arrastrando puntos de conexión para crear flujos
- **Monitoreo en Tiempo Real**: Vista detallada del estado de ejecución con auto-refresh
- **Visualización de Logs**: Panel de logs filtrable por tarea con niveles de color
- **Gestión de Tareas**: Soporte para múltiples tipos de tareas configurables
- **Estados Visuales**: Badges translúcidos con colores neón para estados
- **Progreso Visual**: Barras de progreso con gradientes y efectos de brillo

## 🛠️ Tecnologías

- **React 19**: Framework principal
- **Vite**: Build tool y dev server
- **React Router**: Enrutamiento
- **Axios**: Cliente HTTP para API REST
- **Tailwind CSS**: Framework de estilos con tema personalizado
- **React Flow**: Librería para editor visual de nodos
- **JSDoc**: Tipado y documentación

## Estructura del Proyecto

```text
src/
├── components/              # Componentes reutilizables
│   ├── StateBadge.jsx      # Badge de estados con colores neón
│   ├── Button.jsx          # Componente de botón personalizado
│   ├── Card.jsx            # Contenedor con bordes y sombra
│   ├── ProgressBar.jsx     # Barra de progreso con gradiente
│   ├── Loading.jsx         # Spinner de carga con glow
│   ├── WorkflowCanvas.jsx  # Canvas visual para diseñar workflows
│   ├── TaskNode.jsx        # Nodo personalizado para el canvas
│   └── index.js            # Exportaciones
├── pages/                  # Páginas principales
│   ├── WorkflowsList.jsx   # Lista de workflows (cards)
│   ├── WorkflowEditor.jsx  # Editor visual de workflows
│   ├── RunDetail.jsx       # Detalle de ejecución
│   └── index.js
├── services/               # Servicios y APIs
│   ├── api.js             # Cliente API con axios
│   ├── mockData.js        # Datos de prueba
│   └── mockApi.js         # API simulada
├── types/                 # Definiciones de tipos (JSDoc)
│   └── index.js
├── App.jsx                # Componente principal con rutas
├── main.jsx               # Entry point
└── index.css             # Estilos globales y Tailwind
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=true  # true para usar datos mock, false para backend real
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Abrir en el navegador: [http://localhost:5173](http://localhost:5173)

## Modo Mock (Sin Backend)

El proyecto incluye un **sistema completo de datos mock** que permite probar todas las funcionalidades sin necesidad del backend.

**Por defecto, los mocks están habilitados** (`VITE_USE_MOCK=true`).

Incluye:
- 3 workflows pre-configurados con diferentes escenarios
- 4 runs de ejemplo (exitoso, en progreso, fallido, pendiente)
- 5 tipos de tareas (http_get, validate_csv, transform_simple, save_db, notify_mock)
- Logs detallados con diferentes niveles (INFO, WARNING, ERROR)
- Simulación completa de todas las operaciones CRUD


## Patrones de Diseño Implementados

### Container/Presentational
- Páginas como containers (lógica + estado)
- Componentes como presentational (UI pura)

### Adapter
- `api.js` adapta respuestas del backend a modelos del frontend
- Manejo centralizado de errores

### Observer
- Auto-refresh en RunDetail para suscribirse a cambios
- useEffect para observar cambios de estado

## Integración con Backend

El frontend espera que el backend (FastAPI) exponga estos endpoints:

- `GET /task-types` - Catálogo de tipos de tareas
- `GET /workflows` - Listar workflows
- `GET /workflows/:id` - Detalle de workflow
- `POST /workflows` - Crear workflow
- `PUT /workflows/:id` - Actualizar workflow
- `DELETE /workflows/:id` - Eliminar workflow
- `POST /workflows/:id/runs` - Ejecutar workflow
- `GET /runs/:id` - Detalle de run
- `GET /runs/:id/logs` - Logs de run
- `POST /runs/:id/cancel` - Cancelar run

## Configuración de Desarrollo

### Tailwind CSS
Configurado en `tailwind.config.js` con:
- Escaneo de archivos JSX/TSX
- Temas personalizables
- Plugins opcionales

### ESLint
Configurado para React con:
- Reglas de React Hooks
- Fast Refresh
- ES6+ features

### Variables de Entorno
Usar prefijo `VITE_` para variables accesibles en el cliente:
```
VITE_API_URL=http://localhost:8000
```

# 🧪 Testing con Vitest

## Configuración

El proyecto está configurado con **Vitest** para pruebas unitarias y de integración.

## Comandos Disponibles

```bash
# Ejecutar tests en modo watch (recomendado durante desarrollo)
npm test

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests una sola vez (para CI/CD)
npm run test:run

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## ✅ Características Implementadas

- [x] **Editor visual de workflows** con React Flow (tipo n8n)
- [x] **Tema oscuro** con colores neón y efectos de brillo
- [x] **Interfaz en español** completa
- [x] **Sistema de mocks** para desarrollo sin backend
- [x] **Componentes reutilizables** con diseño consistente
- [x] **Auto-refresh** en detalles de ejecución
- [x] **Drag & drop** de nodos en el canvas
- [x] **Conexiones visuales** entre nodos
- [x] Login
- [x] Implementar autenticación y autorización
- [x] Modo claro
- [x] Tests unitarios con Vitest (Sin la API)
- [x] Agregar validación de schemas de parámetros
- [ ] Optimizar con IA con datos mockeados

## 🚀 Próximos Pasos

- [ ] Implementar API backend
- [ ] Agregar filtros y búsqueda en WorkflowsList
- [ ] Validación de DAG (detección de ciclos)
- [ ] Undo/Redo en el editor visual
- [ ] Tests unitarios con Vitest para cuando se conecte con la api backend
- [ ] Tests E2E con Playwright
- [ ] Optimizar con IA y la API
