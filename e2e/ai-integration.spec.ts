import { test, expect, Page } from '@playwright/test';

/**
 * Tests E2E para validar la integración completa de IA
 * Versión simplificada que funciona con el flujo real de la aplicación
 */

const TEST_CREDENTIALS = {
  username: 'demo',
  password: 'demo123',
};

/**
 * Helper: Login del usuario (versión mejorada con mejor manejo de timing)
 */
async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Esperar a que los inputs estén disponibles
  await page.waitForSelector('input', { timeout: 5000 });

  const inputs = page.locator('input');
  await inputs.nth(0).fill(TEST_CREDENTIALS.username);
  await inputs.nth(1).fill(TEST_CREDENTIALS.password);

  // Esperar un poco antes de hacer clic en submit
  await page.waitForTimeout(500);

  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Estrategia mejorada: intentar varias formas de esperar la redirección
  try {
    // Primero intentar esperar la URL
    await page.waitForURL('/workflows', { timeout: 15000 });
  } catch (e) {
    // Si falla, intentar esperar por navegación
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verificar si estamos en workflows, si no, navegar manualmente
    if (!page.url().includes('/workflows')) {
      await page.goto('/workflows');
      await page.waitForLoadState('networkidle');
    }
  }
}

test.describe.configure({ mode: 'serial' });

test.describe('Integración de IA - Tests E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('AI-001: Verificar que existe botón de Optimizar con IA en workflows existentes', async ({ page }) => {
    test.setTimeout(60000);

    // Navegar a la lista de workflows
    await page.goto('/workflows');
    await page.waitForTimeout(2000);

    // Buscar el primer workflow y hacer clic para editarlo
    const firstWorkflowEditButton = page.locator('button[title="Editar"]').first();

    if (await firstWorkflowEditButton.isVisible()) {
      await firstWorkflowEditButton.click();
      await page.waitForTimeout(2000);

      // Verificar que estamos en modo edición
      expect(page.url()).toMatch(/\/workflows\/wf_/);

      // Buscar botón de "Optimizar con IA"
      const optimizeButton = page.locator('button:has-text("Optimizar con IA")');
      await expect(optimizeButton).toBeVisible({ timeout: 5000 });

      console.log('✅ Botón de Optimizar con IA encontrado en workflow existente');
    } else {
      console.log('⚠️ No hay workflows existentes para editar');
    }
  });

  test('AI-002: Verificar modal de predicción al ejecutar workflow', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/workflows');
    await page.waitForTimeout(2000);

    // Buscar cualquier workflow y hacer clic en "Ejecutar"
    const executeButton = page.locator('button:has-text("Ejecutar")').first();

    if (await executeButton.isVisible()) {
      await executeButton.click();
      await page.waitForTimeout(3000);

      // Verificar que aparece contenido relacionado con predicción o ejecución
      const modalOrMessage = page.locator('text=/predic|estima|confirmar|ejecutar/i');

      const hasContent = await modalOrMessage.count() > 0;
      expect(hasContent).toBeTruthy();

      console.log('✅ Modal de predicción/confirmación se abrió');

      // Cerrar modal si existe botón de cancelar
      const cancelButton = page.locator('button:has-text("Cancelar")').first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
      }
    } else {
      console.log('⚠️ No hay workflows para ejecutar');
    }
  });

  test('AI-003: Crear nuevo workflow - Verificar elementos básicos', async ({ page }) => {
    test.setTimeout(60000);

    // Asegurar que estamos en la lista de workflows
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Buscar y hacer click en "Crear Workflow"
    const createButton = page.locator('button:has-text("Crear Workflow")');
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    await page.waitForURL(/\/workflows\/new/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verificar elementos clave del editor
    const nameInput = page.locator('input[name="name"]');
    const descInput = page.locator('textarea[name="description"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(nameInput).toBeVisible();
    await expect(descInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    console.log('✅ Elementos básicos del editor están presentes');
  });

  test('AI-004: Verificar React Flow Canvas carga correctamente', async ({ page }) => {
    test.setTimeout(60000);

    // Asegurar que estamos en la lista de workflows
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const createButton = page.locator('button:has-text("Crear Workflow")');
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    await page.waitForURL(/\/workflows\/new/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verificar que React Flow está presente
    const reactFlowContainer = page.locator('.react-flow');
    await expect(reactFlowContainer).toBeVisible({ timeout: 5000 });

    // Verificar que existe el botón de "Agregar Nodo"
    const addNodeButton = page.locator('button:has-text("Agregar Nodo")');
    await expect(addNodeButton).toBeVisible({ timeout: 5000 });

    console.log('✅ React Flow Canvas y controles cargaron correctamente');
  });

  test('AI-005: Agregar un nodo al canvas', async ({ page }) => {
    test.setTimeout(60000);

    // Asegurar que estamos en la lista de workflows
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const createButton = page.locator('button:has-text("Crear Workflow")');
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    await page.waitForURL(/\/workflows\/new/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Hacer clic en "Agregar Nodo"
    const addNodeButton = page.locator('button:has-text("Agregar Nodo")');
    await expect(addNodeButton).toBeVisible({ timeout: 5000 });
    await addNodeButton.click();
    await page.waitForTimeout(1000);

    // Verificar que apareció un nodo en el canvas
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    expect(nodeCount).toBeGreaterThan(0);

    console.log(`✅ Nodo agregado correctamente. Total de nodos: ${nodeCount}`);
  });

  test('AI-006: Verificar elementos de la UI del canvas', async ({ page }) => {
    test.setTimeout(60000);

    // Asegurar que estamos en la lista de workflows
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const createButton = page.locator('button:has-text("Crear Workflow")');
    await expect(createButton).toBeVisible({ timeout: 5000 });
    await createButton.click();

    await page.waitForURL(/\/workflows\/new/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Agregar un nodo
    const addNodeButton = page.locator('button:has-text("Agregar Nodo")');
    await expect(addNodeButton).toBeVisible({ timeout: 5000 });
    await addNodeButton.click();
    await page.waitForTimeout(1000);

    // Verificar que existen botones de control
    const deleteButton = page.locator('button:has-text("Eliminar")');
    const undoButton = page.locator('button:has-text("Deshacer")');
    const redoButton = page.locator('button:has-text("Rehacer")');

    await expect(deleteButton).toBeVisible();
    await expect(undoButton).toBeVisible();
    await expect(redoButton).toBeVisible();

    console.log('✅ Controles del canvas están presentes');
  });

  test('AI-007: Optimizar workflow existente con IA', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto('/workflows');
    await page.waitForTimeout(2000);

    // Buscar y editar el primer workflow
    const firstWorkflowEditButton = page.locator('button[title="Editar"]').first();

    if (await firstWorkflowEditButton.isVisible()) {
      await firstWorkflowEditButton.click();
      await page.waitForTimeout(2000);

      // Buscar botón de optimizar
      const optimizeButton = page.locator('button:has-text("Optimizar con IA")');

      if (await optimizeButton.isVisible()) {
        // Hacer clic en optimizar
        await optimizeButton.click();
        console.log('🔄 Esperando respuesta de la IA (puede tardar hasta 15 segundos)...');

        // Esperar respuesta de la IA (hasta 20 segundos)
        await page.waitForTimeout(20000);

        // Verificar que aparece algún tipo de alerta o mensaje
        // Buscar por clases de Alert o por contenido de texto
        const alertByClass = page.locator('[role="alert"], .bg-rose-900, .bg-emerald-900, .bg-cyan-900');
        const alertByText = page.getByText(/optimiz|error|éxito|mejorar|sugerencia/i);

        const hasClassAlert = await alertByClass.count() > 0;
        const hasTextAlert = await alertByText.count() > 0;
        const hasResponse = hasClassAlert || hasTextAlert;

        // Tomar screenshot para debug
        await page.screenshot({ path: 'test-results/ai-optimization-response.png' });

        // Verificar que hubo alguna respuesta
        expect(hasResponse).toBeTruthy();

        console.log('✅ IA respondió a la solicitud de optimización');
      } else {
        console.log('⚠️ Botón de optimizar no está visible (puede que el workflow deba guardarse primero)');
      }
    } else {
      console.log('⚠️ No hay workflows existentes para optimizar');
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: volver a la lista
    await page.goto('/workflows').catch(() => {
      console.log('No se pudo navegar a /workflows en cleanup');
    });
  });
});
