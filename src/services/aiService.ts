import {
  Step,
  Edge,
  AIOptimizationResult,
  AIRepairResult,
  AIPredictionResult,
} from '../types';
import apiClient from './api';

/**
 * Servicio de IA que conecta con el backend (Google Gemini)
 * Todas las funciones ahora usan IA real en lugar de mocks
 */

/**
 * Optimiza un workflow usando IA real (Google Gemini)
 * @param workflowId ID del workflow
 * @param steps Pasos actuales del workflow
 * @param edges Conexiones actuales del workflow
 * @returns Resultado de la optimización
 */
export async function optimizeWorkflow(
  workflowId: string,
  steps: Step[],
  edges: Edge[]
): Promise<AIOptimizationResult> {
  try {
    // Llamar al endpoint de sugerencias de IA
    const response = await apiClient.post('/ia/suggestion', {
      name: workflowId,
      definition: {
        nodes: steps.map((step) => ({
          id: step.node_key,
          type: step.type,
          params: step.params || {},
          depends_on: edges
            .filter(e => e.to_node_key === step.node_key)
            .map(e => e.from_node_key)
        }))
      }
    });

    const data = response.data;

    // Si no hay sugerencias, el workflow ya está optimizado
    if (!data.suggestions || data.suggestions.length === 0) {
      return {
        canOptimize: false,
        message: data.rationale || 'El workflow ya está optimizado. No se detectaron mejoras adicionales.',
        suggestions: [data.rationale || 'El workflow tiene una estructura óptima']
      };
    }

    // Aplicar sugerencias de la IA a los steps
    console.log('[AI] Suggestions received:', data.suggestions);
    const optimizedSteps = applySuggestions(steps, data.suggestions);
    console.log('[AI] Original steps:', steps);
    console.log('[AI] Optimized steps:', optimizedSteps);

    return {
      canOptimize: true,
      message: data.rationale || 'Workflow optimizado exitosamente usando IA.',
      optimizedSteps,
      optimizedEdges: edges,
      suggestions: data.suggestions.map((s: any) =>
        s.message || s.reason || 'Optimización aplicada'
      )
    };
  } catch (error) {
    console.error('Error calling AI optimization:', error);

    // Fallback: devolver mensaje indicando que la IA no está disponible
    return {
      canOptimize: false,
      message: 'No se pudo conectar con el servicio de IA. Verifica que el backend esté ejecutándose.',
      suggestions: [
        'El backend debe estar corriendo en http://localhost:8000',
        'Verifica que la variable IA_PROVIDER esté configurada en el .env del backend',
        'Revisa los logs del backend para más información'
      ]
    };
  }
}

/**
 * Aplica las sugerencias de IA a los steps del workflow
 */
function applySuggestions(steps: Step[], suggestions: any[]): Step[] {
  const updatedSteps = [...steps];

  suggestions.forEach(suggestion => {
    // Manejar sugerencias del backend (formato: kind, path, detail)
    if (suggestion.kind === 'parameter_set' && suggestion.detail) {
      // Buscar el step por índice desde el path (ej: "steps[0]")
      const targetIndex = parseInt(suggestion.path?.match(/\d+/)?.[0] || '-1');
      if (targetIndex >= 0 && targetIndex < updatedSteps.length) {
        const currentStep = updatedSteps[targetIndex];
        if (currentStep) {
          updatedSteps[targetIndex] = {
            id: currentStep.id,
            workflow_id: currentStep.workflow_id,
            node_key: currentStep.node_key,
            type: currentStep.type,
            params: {
              ...currentStep.params,
              ...suggestion.detail
            }
          };
        }
      }
    }
    // Manejar sugerencias de add_arg (agregar parámetro)
    else if (suggestion.kind === 'add_arg' && suggestion.detail) {
      const targetIndex = parseInt(suggestion.path?.match(/\d+/)?.[0] || '-1');
      if (targetIndex >= 0 && targetIndex < updatedSteps.length && suggestion.detail.arg_name) {
        // Limpiar arg_name por si viene con "params." como prefijo
        const cleanArgName = suggestion.detail.arg_name.replace(/^params\./, '');
        const currentStep = updatedSteps[targetIndex];

        if (currentStep) {
          updatedSteps[targetIndex] = {
            id: currentStep.id,
            workflow_id: currentStep.workflow_id,
            node_key: currentStep.node_key,
            type: currentStep.type,
            params: {
              ...currentStep.params,
              [cleanArgName]: suggestion.detail.arg_value
            }
          };
          console.log(`[AI] Added parameter "${cleanArgName}" = "${suggestion.detail.arg_value}" to step ${targetIndex}`);
        }
      }
    }
    // Manejar sugerencias de modify_arg (modificar parámetro)
    else if (suggestion.kind === 'modify_arg' && suggestion.detail) {
      const targetIndex = parseInt(suggestion.path?.match(/\d+/)?.[0] || '-1');
      if (targetIndex >= 0 && targetIndex < updatedSteps.length && suggestion.detail.arg_name) {
        // Limpiar arg_name por si viene con "params." como prefijo
        const cleanArgName = suggestion.detail.arg_name.replace(/^params\./, '');
        const currentStep = updatedSteps[targetIndex];

        if (currentStep) {
          updatedSteps[targetIndex] = {
            id: currentStep.id,
            workflow_id: currentStep.workflow_id,
            node_key: currentStep.node_key,
            type: currentStep.type,
            params: {
              ...currentStep.params,
              [cleanArgName]: suggestion.detail.arg_value
            }
          };
          console.log(`[AI] Modified parameter "${cleanArgName}" = "${suggestion.detail.arg_value}" in step ${targetIndex}`);
        }
      }
    }
    // Ignorar add_node y reorder por ahora (requieren lógica más compleja)
  });

  return updatedSteps;
}

/**
 * Repara un workflow con errores usando IA real (Google Gemini)
 * @param workflowId ID del workflow
 * @param steps Pasos actuales del workflow
 * @param edges Conexiones actuales del workflow
 * @param failedNodeKey Clave del nodo que falló
 * @returns Resultado de la reparación
 */
export async function repairWorkflow(
  workflowId: string,
  steps: Step[],
  edges: Edge[],
  failedNodeKey: string,
  errorLogs?: string[]
): Promise<AIRepairResult> {
  try {
    // Llamar al endpoint de corrección de IA
    // El backend espera logs como string, no array
    const logsString = errorLogs && errorLogs.length > 0
      ? errorLogs.join('\n')
      : `Error en el nodo: ${failedNodeKey}`;

    const response = await apiClient.post('/ia/fix', {
      name: workflowId,
      definition: {
        nodes: steps.map((step) => ({
          id: step.node_key,
          type: step.type,
          params: step.params || {},
          depends_on: edges
            .filter(e => e.to_node_key === step.node_key)
            .map(e => e.from_node_key)
        }))
      },
      logs: logsString
    });

    const data = response.data;

    // Verificar si la IA pudo reparar el workflow
    if (!data.patched_definition || !data.patched_definition.nodes) {
      return {
        canRepair: false,
        message: 'No se pudo reparar el workflow automáticamente.',
        fixedIssues: data.notes || []
      };
    }

    // Convertir la definición reparada de vuelta a steps
    const repairedSteps = data.patched_definition.nodes.map((node: any, index: number) => {
      const originalStep = steps.find(s => s.node_key === node.id);

      // Si es un nodo nuevo (no existe en originalStep), crear uno completo
      if (!originalStep) {
        return {
          id: `step_${Date.now()}_${index}`,
          workflow_id: workflowId,
          node_key: node.id || `node_${Date.now()}_${index}`,
          type: node.type,
          params: node.params || {}
        } as Step;
      }

      // Si es un nodo existente, actualizar solo type y params
      return {
        ...originalStep,
        type: node.type,
        params: node.params
      } as Step;
    });

    // Generar edges basándose en depends_on de los nodos reparados
    const repairedEdges: Edge[] = [];
    data.patched_definition.nodes.forEach((node: any, index: number) => {
      const dependsOn = node.depends_on || [];
      dependsOn.forEach((fromNodeKey: string) => {
        // Buscar si ya existe este edge en los originales
        const existingEdge = edges.find(
          e => e.from_node_key === fromNodeKey && e.to_node_key === node.id
        );

        if (existingEdge) {
          // Mantener el edge existente
          repairedEdges.push(existingEdge);
        } else {
          // Crear nuevo edge
          repairedEdges.push({
            id: `edge_${Date.now()}_${index}`,
            workflow_id: workflowId,
            from_node_key: fromNodeKey,
            to_node_key: node.id
          });
        }
      });
    });

    return {
      canRepair: true,
      message: data.notes?.[0] || 'Workflow reparado exitosamente usando IA.',
      repairedSteps,
      repairedEdges,
      fixedIssues: data.notes || ['Correcciones aplicadas']
    };
  } catch (error) {
    console.error('Error calling AI repair:', error);

    return {
      canRepair: false,
      message: 'No se pudo conectar con el servicio de IA para reparar el workflow.',
      fixedIssues: [
        'Verifica que el backend esté ejecutándose',
        'Revisa la configuración de IA_PROVIDER en el .env del backend'
      ]
    };
  }
}

/**
 * Predice el resultado de un workflow usando IA real (Gemini)
 * @param workflowId ID del workflow
 * @param steps Pasos del workflow
 * @param edges Conexiones del workflow
 * @returns Predicción de resultados
 */
export async function predictWorkflowOutcome(
  workflowId: string,
  steps: Step[],
  edges: Edge[]
): Promise<AIPredictionResult> {
  try {
    // Llamar al endpoint de estimación de IA
    const response = await apiClient.post('/ia/estimate', {
      name: workflowId,
      definition: {
        nodes: steps.map((step) => ({
          id: step.node_key,
          type: step.type,
          params: step.params || {},
          depends_on: edges
            .filter(e => e.to_node_key === step.node_key)
            .map(e => e.from_node_key)
        }))
      }
    });

    const data = response.data;

    // Transformar respuesta del backend al formato del frontend
    const estimatedDuration = data.estimated_time_seconds || 0;
    const estimatedCost = data.estimated_cost_usd || 0;
    const complexityScore = data.complexity_score || 0;

    // Determinar nivel de costo basado en la estimación
    let costLevel: 'bajo' | 'medio' | 'alto' = 'bajo';
    if (estimatedCost > 0.01) {
      costLevel = 'alto';
    } else if (estimatedCost > 0.005) {
      costLevel = 'medio';
    }

    // Calcular tasa de éxito basada en complejidad
    const baseSuccessRate = 95;
    const complexityPenalty = Math.floor(complexityScore * 30);
    const estimatedSuccessRate = Math.max(baseSuccessRate - complexityPenalty, 60);

    // Extraer problemas potenciales y recomendaciones
    const potentialIssues: string[] = [];
    const recommendations: string[] = [];

    // Analizar el breakdown para generar insights
    const breakdown = data.breakdown || [];
    breakdown.forEach((item: any) => {
      if (item.time > 10) {
        potentialIssues.push(`El nodo "${item.type}" puede tardar hasta ${item.time}s`);
      }
      if (item.cost > 0.005) {
        potentialIssues.push(`El nodo "${item.type}" tiene un costo estimado de $${item.cost}`);
      }
    });

    // Agregar assumptions como recomendaciones
    if (data.assumptions && Array.isArray(data.assumptions)) {
      recommendations.push(...data.assumptions);
    }

    // Recomendaciones basadas en complejidad
    if (complexityScore > 0.7) {
      recommendations.push('El workflow es complejo. Considera dividirlo en sub-workflows más simples.');
    }
    if (steps.length > 5) {
      recommendations.push('El workflow tiene múltiples pasos. Asegúrate de manejar errores apropiadamente.');
    }

    // Validar que hay nodos
    if (steps.length === 0) {
      potentialIssues.push('El workflow no tiene nodos configurados');
    }

    // Verificar si hay nodos HTTP
    const hasHttpNodes = steps.some(s => s.type === 'http_get');
    if (hasHttpNodes) {
      potentialIssues.push('Las peticiones HTTP pueden fallar por timeout o errores de red');
      recommendations.push('Configura timeout y reintentos para peticiones HTTP');
    }

    // Verificar si hay validación de datos
    const hasValidation = steps.some(s => s.type === 'validate_csv');
    const hasTransformOrSave = steps.some(s => s.type === 'transform_simple' || s.type === 'save_db');
    if (!hasValidation && hasTransformOrSave) {
      potentialIssues.push('No hay validación de datos antes de transformar/guardar');
      recommendations.push('Agrega un nodo de validación antes de transformaciones o guardado');
    }

    return {
      estimatedDuration,
      estimatedSuccessRate,
      costLevel,
      potentialIssues: potentialIssues.length > 0 ? potentialIssues : ['No se detectaron problemas potenciales'],
      recommendations: recommendations.length > 0 ? recommendations : ['El workflow parece bien configurado'],
    };
  } catch (error) {
    console.error('Error calling AI prediction:', error);

    // Fallback a predicción básica
    return predictWorkflowOutcomeFallback(steps, edges);
  }
}

/**
 * Predicción básica de fallback cuando la IA no está disponible
 */
function predictWorkflowOutcomeFallback(
  steps: Step[],
  _edges: Edge[]
): AIPredictionResult {
  const taskCosts = {
    http_get: { time: 5, cost: 'bajo' as const },
    validate_csv: { time: 10, cost: 'medio' as const },
    transform_simple: { time: 15, cost: 'medio' as const },
    save_db: { time: 8, cost: 'alto' as const },
    notify_mock: { time: 2, cost: 'bajo' as const },
  };

  let estimatedDuration = 0;
  const costPoints = { bajo: 1, medio: 3, alto: 5 };
  let totalCostPoints = 0;

  steps.forEach((step) => {
    const taskType = step.type as keyof typeof taskCosts;
    const cost = taskCosts[taskType] || { time: 5, cost: 'bajo' as const };
    estimatedDuration += cost.time;
    totalCostPoints += costPoints[cost.cost];
  });

  const stepCount = steps.length;
  const avgCostPoints = stepCount > 0 ? totalCostPoints / stepCount : 0;
  let costLevel: 'bajo' | 'medio' | 'alto';
  if (avgCostPoints <= 2) {
    costLevel = 'bajo';
  } else if (avgCostPoints <= 4) {
    costLevel = 'medio';
  } else {
    costLevel = 'alto';
  }

  let successRate = 95;
  const hasHttpRequests = steps.some((s) => s.type === 'http_get');
  const hasValidation = steps.some((s) => s.type === 'validate_csv');
  const hasTransform = steps.some((s) => s.type === 'transform_simple');
  const hasDatabase = steps.some((s) => s.type === 'save_db');

  if (!hasValidation && hasTransform) successRate -= 15;
  if (stepCount > 10) successRate -= 10;
  if (hasHttpRequests) successRate -= 5;
  if (hasDatabase) successRate -= 5;

  const potentialIssues: string[] = [
    'Servicio de IA no disponible - usando estimación básica'
  ];

  if (hasHttpRequests) {
    potentialIssues.push('Peticiones HTTP pueden fallar por timeout o errores de red');
  }
  if (stepCount > 5) {
    potentialIssues.push(`Workflow con ${stepCount} pasos - Mayor complejidad = mayor riesgo`);
  }
  if (!hasValidation && (hasTransform || hasDatabase)) {
    potentialIssues.push('Sin validación de datos antes de transformar/guardar');
  }

  const recommendations: string[] = [
    'Conecta con el backend para obtener análisis más precisos con IA'
  ];

  if (hasHttpRequests) {
    recommendations.push('Configura timeout y reintentos para peticiones HTTP');
  }
  if (!hasValidation) {
    recommendations.push('Agrega validación de datos al inicio del workflow');
  }

  return {
    estimatedDuration,
    estimatedSuccessRate: Math.max(successRate, 60),
    costLevel,
    potentialIssues,
    recommendations,
  };
}

/**
 * Reinicia el contador de optimizaciones para un workflow
 * (Función legacy mantenida por compatibilidad, no hace nada en la versión real)
 */
export function resetOptimizationCount(workflowId: string): void {
  // No-op en la versión con IA real
  console.log(`Reset optimization count for ${workflowId} (no-op with real AI)`);
}
