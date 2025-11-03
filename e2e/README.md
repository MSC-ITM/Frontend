# Tests E2E - Integración de IA

Tests end-to-end usando Playwright para validar la integración completa de las funcionalidades de IA.

## Prerequisitos

1. **Instalar Playwright** (ya instalado):
```bash
npm install -D @playwright/test
npx playwright install chromium
```

2. **Backend ejecutándose**:
   - El backend debe estar corriendo en `http://localhost:8000`
   - Debe tener configurado `IA_PROVIDER=openai` en `.env`
   - Debe tener una API key válida de OpenAI

3. **Frontend ejecutándose**:
   - El frontend debe estar corriendo en `http://localhost:5173`
   - Ejecutar: `npm run dev`

4. **Base de datos**:
   - La base de datos debe estar inicializada
   - Debe existir el usuario `demo` con contraseña `demo123`

## Estado de los Tests

### ✅ Tests Básicos (ai-simple.spec.ts) - 4/4 PASANDO ✅
1. Puede acceder a la página de login
2. Puede hacer login con credenciales correctas
3. Puede acceder al editor de workflows después de login
4. Verificar que existe el botón de Optimizar con IA en el editor

### ✅ Tests Básicos de IA (ai-basic.spec.ts) - 5/5 PASANDO ✅
1. AI-BASIC-001: Backend de IA está configurado y responde
2. AI-BASIC-002: Verificar que existe un workflow en la lista
3. AI-BASIC-003: Puede navegar a crear nuevo workflow
4. AI-BASIC-004: Verificar que la página del editor carga correctamente
5. AI-BASIC-005: Mensaje de confirmación de que tests E2E funcionan

### ✅ Tests de Integración de IA (ai-integration.spec.ts) - 7/7 PASANDO ✅
1. AI-001: Verificar botón de Optimizar con IA en workflows existentes ✅
2. AI-002: Modal de predicción al ejecutar workflow ✅
3. AI-003: Elementos básicos del editor ✅
4. AI-004: React Flow Canvas carga correctamente ✅
5. AI-005: Agregar nodo al canvas ✅
6. AI-006: Elementos de la UI del canvas ✅
7. AI-007: Optimizar workflow existente con IA ✅

---

## ✨ **TODOS LOS TESTS PASANDO: 16/16 (100% de éxito)** ✨

---

## Ejecutar Tests

### Tests básicos (recomendado para empezar)
```bash
npm run test:e2e ai-simple.spec.ts
npm run test:e2e ai-basic.spec.ts
```

### Todos los tests E2E
```bash
npm run test:e2e
```

### Con interfaz visual
```bash
npm run test:e2e:ui
```

### Ver el navegador (modo headed)
```bash
npm run test:e2e:headed
```

### Modo debug (paso a paso)
```bash
npm run test:e2e:debug
```

### Ejecutar un test específico
```bash
npx playwright test ai-integration.spec.ts
```

### Ejecutar solo un test por nombre
```bash
npx playwright test -g "AI-001"
```

## Tests Incluidos

### Tests Básicos (ai-basic.spec.ts)
- **AI-BASIC-001**: Backend de IA responde correctamente
- **AI-BASIC-002**: Lista de workflows carga
- **AI-BASIC-003**: Navegación a crear workflow funciona
- **AI-BASIC-004**: Página del editor carga correctamente
- **AI-BASIC-005**: Confirmación general de E2E funcionando

### Tests de Integración de IA (ai-integration.spec.ts)
- **AI-001**: Verificar botón "Optimizar con IA" existe en workflows
- **AI-002**: Modal de predicción se abre al ejecutar workflow
- **AI-003**: Elementos básicos del editor (nombre, descripción, submit)
- **AI-004**: React Flow Canvas carga correctamente
- **AI-005**: Agregar nodo al canvas funciona
- **AI-006**: Controles de canvas (Eliminar, Deshacer, Rehacer) presentes
- **AI-007**: Optimizar workflow existente con IA (prueba completa de integración)

## Ver Resultados

Después de ejecutar los tests, puedes ver el reporte HTML:

```bash
npx playwright show-report
```

## Notas

- Los tests crean y eliminan workflows automáticamente
- Se ejecutan en modo headless por defecto
- Generan screenshots en caso de fallo
- Incluyen traces para debugging
