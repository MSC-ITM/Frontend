import {
  Step,
  Edge,
  AIOptimizationResult,
  AIRepairResult,
  AIPredictionResult,
} from '../types';

/**
 * Servicio mock de IA para optimización, reparación y predicción de workflows
 */

// Contador de optimizaciones por workflow (para simular límite de optimizaciones)
const optimizationCount = new Map<string, number>();

/**
 * Simula la optimización de un workflow mediante IA
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
  // Simular delay de procesamiento de IA (1-2 segundos)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const currentOptimizations = optimizationCount.get(workflowId) || 0;

  // Caso 1: Workflow ya está optimizado al máximo (después de 2 optimizaciones)
  if (currentOptimizations >= 2) {
    return {
      canOptimize: false,
      message: 'El workflow ya está completamente optimizado. No se detectaron mejoras adicionales.',
      suggestions: [
        'El workflow tiene una estructura óptima',
        'Los nodos están organizados de manera eficiente',
        'No se encontraron pasos redundantes',
      ],
    };
  }

  // Caso 2: Primera optimización
  if (currentOptimizations === 0) {
    optimizationCount.set(workflowId, 1);

    // Simular mejoras: eliminar pasos redundantes y optimizar orden
    const optimizedSteps = steps.map((step, index) => {
      // Optimizar parámetros de HTTP GET
      if (step.type === 'http_get') {
        return {
          ...step,
          params: {
            ...step.params,
            timeout: 5000,
            retries: 3,
            cacheEnabled: true,
          },
        };
      }
      // Optimizar parámetros de validación CSV
      if (step.type === 'validate_csv') {
        return {
          ...step,
          params: {
            ...step.params,
            parallelValidation: true,
            batchSize: 1000,
          },
        };
      }
      return step;
    });

    return {
      canOptimize: true,
      message: 'Workflow optimizado exitosamente. Se agregaron configuraciones de rendimiento.',
      optimizedSteps,
      optimizedEdges: edges,
      suggestions: [
        'Se agregaron parámetros de timeout y reintentos a las peticiones HTTP',
        'Se habilitó caché para peticiones HTTP',
        'Se habilitó procesamiento paralelo en validación CSV',
        'Se configuró procesamiento por lotes para mejor rendimiento',
      ],
    };
  }

  // Caso 3: Segunda optimización
  if (currentOptimizations === 1) {
    optimizationCount.set(workflowId, 2);

    // Reorganizar pasos para mejor eficiencia
    const optimizedSteps = [...steps].sort((a, b) => {
      // Priorizar HTTP GET primero, luego validaciones, luego transformaciones
      const priority: Record<string, number> = {
        http_get: 1,
        validate_csv: 2,
        transform_simple: 3,
        save_db: 4,
        notify_mock: 5,
      };
      return (priority[a.type] || 999) - (priority[b.type] || 999);
    });

    return {
      canOptimize: true,
      message: 'Workflow reorganizado para mejor eficiencia de ejecución.',
      optimizedSteps,
      optimizedEdges: edges,
      suggestions: [
        'Los pasos fueron reordenados para optimizar el flujo de datos',
        'Las tareas de red se ejecutan al inicio para minimizar tiempos de espera',
        'Las validaciones se realizan antes de las transformaciones',
        'Las notificaciones se ejecutan al final del proceso',
      ],
    };
  }

  // Caso por defecto (no debería llegar aquí)
  return {
    canOptimize: false,
    message: 'No se pudieron aplicar más optimizaciones.',
  };
}

/**
 * Simula la reparación de un workflow con errores mediante IA
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
  failedNodeKey: string
): Promise<AIRepairResult> {
  // Simular delay de procesamiento de IA (2 segundos)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Encontrar el paso que falló
  const failedStep = steps.find((s) => s.node_key === failedNodeKey);

  if (!failedStep) {
    return {
      canRepair: false,
      message: 'No se pudo identificar el nodo con error.',
      fixedIssues: [],
    };
  }

  // Generar reparaciones basadas en el tipo de tarea
  const repairedSteps = steps.map((step) => {
    if (step.node_key !== failedNodeKey) return step;

    // Reparaciones específicas por tipo de tarea
    switch (step.type) {
      case 'http_get':
        return {
          ...step,
          params: {
            ...step.params,
            timeout: 10000, // Aumentar timeout
            retries: 5, // Más reintentos
            retryDelay: 1000, // Delay entre reintentos
            fallbackUrl: step.params.url + '/backup', // URL de respaldo
          },
        };

      case 'validate_csv':
        return {
          ...step,
          params: {
            ...step.params,
            skipInvalidRows: true, // Omitir filas inválidas
            strictMode: false, // Modo menos estricto
            errorTolerance: 0.1, // Tolerar 10% de errores
          },
        };

      case 'transform_simple':
        return {
          ...step,
          params: {
            ...step.params,
            ignoreErrors: true, // Ignorar errores de transformación
            defaultValues: true, // Usar valores por defecto
          },
        };

      case 'save_db':
        return {
          ...step,
          params: {
            ...step.params,
            mode: 'append', // Cambiar a modo append en vez de replace
            createIfNotExists: true, // Crear tabla si no existe
            onConflict: 'ignore', // Ignorar conflictos
          },
        };

      case 'notify_mock':
        return {
          ...step,
          params: {
            ...step.params,
            retryOnFailure: true,
            maxRetries: 3,
          },
        };

      default:
        return step;
    }
  });

  // Generar lista de problemas resueltos
  const fixedIssues: string[] = [];
  const stepType = failedStep.type;

  switch (stepType) {
    case 'http_get':
      fixedIssues.push(
        'Timeout aumentado de 5s a 10s para peticiones lentas',
        'Reintentos aumentados a 5 con delay de 1s entre cada intento',
        'URL de respaldo agregada para redundancia'
      );
      break;
    case 'validate_csv':
      fixedIssues.push(
        'Modo de validación cambiado a menos estricto',
        'Configurado para omitir filas inválidas',
        'Tolerancia de error establecida en 10%'
      );
      break;
    case 'transform_simple':
      fixedIssues.push(
        'Configurado para ignorar errores de transformación',
        'Valores por defecto habilitados para campos faltantes'
      );
      break;
    case 'save_db':
      fixedIssues.push(
        'Modo cambiado a "append" para evitar sobrescritura',
        'Configurado para crear tabla si no existe',
        'Conflictos configurados para ser ignorados'
      );
      break;
    case 'notify_mock':
      fixedIssues.push(
        'Reintentos automáticos habilitados',
        'Máximo de 3 reintentos configurados'
      );
      break;
  }

  return {
    canRepair: true,
    message: `Se identificaron y corrigieron ${fixedIssues.length} problemas en el nodo "${failedNodeKey}".`,
    repairedSteps,
    repairedEdges: edges,
    fixedIssues,
  };
}

/**
 * Simula la predicción de resultados de un workflow mediante IA
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
  // Simular delay de procesamiento de IA (1.5 segundos)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Analizar tipos de tareas y sus costos
  const taskCosts = {
    http_get: { time: 5, cost: 'bajo' as const },
    validate_csv: { time: 10, cost: 'medio' as const },
    transform_simple: { time: 15, cost: 'medio' as const },
    save_db: { time: 8, cost: 'alto' as const },
    notify_mock: { time: 2, cost: 'bajo' as const },
  };

  // Calcular métricas basadas en el workflow
  const stepCount = steps.length;
  const hasHttpRequests = steps.some((s) => s.type === 'http_get');
  const hasValidation = steps.some((s) => s.type === 'validate_csv');
  const hasTransform = steps.some((s) => s.type === 'transform_simple');
  const hasDatabase = steps.some((s) => s.type === 'save_db');

  // Estimar duración total
  let estimatedDuration = 0;
  const costPoints = { bajo: 1, medio: 3, alto: 5 };
  let totalCostPoints = 0;

  steps.forEach((step) => {
    const taskType = step.type as keyof typeof taskCosts;
    const cost = taskCosts[taskType] || { time: 5, cost: 'bajo' as const };
    estimatedDuration += cost.time;
    totalCostPoints += costPoints[cost.cost];

    // Analizar parámetros para ajustar estimación
    if (step.type === 'validate_csv' && step.params.file_path) {
      estimatedDuration += 5; // Archivos grandes toman más tiempo
    }
    if (step.type === 'http_get' && step.params.timeout) {
      estimatedDuration += 2; // Timeout configurado indica operación lenta
    }
  });

  // Determinar nivel de costo
  const avgCostPoints = totalCostPoints / stepCount;
  let costLevel: 'bajo' | 'medio' | 'alto';
  if (avgCostPoints <= 2) {
    costLevel = 'bajo';
  } else if (avgCostPoints <= 4) {
    costLevel = 'medio';
  } else {
    costLevel = 'alto';
  }

  // Estimar tasa de éxito
  let successRate = 95;
  if (!hasValidation && hasTransform) successRate -= 15; // Sin validación es riesgoso
  if (stepCount > 10) successRate -= 10; // Workflows muy largos son más propensos a fallos
  if (hasHttpRequests) successRate -= 5; // HTTP puede fallar
  if (hasDatabase) successRate -= 5; // DB puede tener problemas de conexión

  // Generar problemas potenciales
  const potentialIssues: string[] = [];
  if (hasHttpRequests) {
    potentialIssues.push('Peticiones HTTP pueden fallar por timeout o errores de red');
  }
  if (stepCount > 5) {
    potentialIssues.push(`Workflow con ${stepCount} pasos - Mayor complejidad = mayor riesgo`);
  }
  if (!hasValidation && (hasTransform || hasDatabase)) {
    potentialIssues.push('Sin validación de datos antes de transformar/guardar');
  }
  if (hasDatabase) {
    potentialIssues.push('Operaciones de base de datos pueden ser lentas con grandes volúmenes');
  }

  // Generar recomendaciones
  const recommendations: string[] = [];
  if (hasHttpRequests) {
    recommendations.push('Configurar timeout y reintentos para peticiones HTTP');
  }
  if (!hasValidation) {
    recommendations.push('Agregar validación de datos al inicio del workflow');
  }
  if (stepCount > 7) {
    recommendations.push('Considerar dividir en sub-workflows para mejor mantenibilidad');
  }
  if (hasDatabase && !hasValidation) {
    recommendations.push('Validar datos antes de insertar en base de datos');
  }
  if (costLevel === 'alto') {
    recommendations.push('Optimizar operaciones costosas o ejecutar en horarios de baja demanda');
  }

  return {
    estimatedDuration,
    estimatedSuccessRate: Math.max(successRate, 60), // Mínimo 60%
    costLevel,
    potentialIssues,
    recommendations,
  };
}

/**
 * Reinicia el contador de optimizaciones para un workflow
 * (útil para testing o cuando se resetea un workflow)
 */
export function resetOptimizationCount(workflowId: string): void {
  optimizationCount.delete(workflowId);
}
