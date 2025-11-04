import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workflowsApi, taskTypesApi } from '../services/api';
import { Loading, WorkflowCanvas } from '../components';
import Alert, { AlertType } from '../components/Alert';
import { optimizeWorkflow } from '../services/aiService';
import { useHistory } from '../hooks/useHistory';
import {
  Step,
  Edge,
  TaskType,
  WorkflowDetailDTO,
  CreateWorkflowDTO,
  createWorkflowDTOSchema,
  validateSafe,
  getValidationErrors,
} from '../types';

// ============================================
// Types & Interfaces
// ============================================

interface WorkflowFormData {
  name: string;
  description: string;
  schedule_cron: string;
  active: boolean;
}


interface WorkflowState {
  steps: Step[];
  edges: Edge[];
}

// ============================================
// Component
// ============================================

const WorkflowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    schedule_cron: '',
    active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: AlertType;
    title: string;
    message: string;
  }>({
    type: 'info',
    title: '',
    message: '',
  });

  // Undo/Redo state management
  const {
    state: workflowState,
    setState: setWorkflowState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useHistory<WorkflowState>({
    steps: [],
    edges: [],
  });

  const steps = workflowState.steps;
  const edges = workflowState.edges;

  useEffect(() => {
    console.log('[WorkflowEditor] workflowState.steps changed:', workflowState.steps);
  }, [workflowState.steps]);

  useEffect(() => {
    loadTaskTypes();
    if (isEditMode && id) {
      loadWorkflow();
    }
  }, [id]);

  const loadTaskTypes = async (): Promise<void> => {
    try {
      const types = await taskTypesApi.getAll();
      setTaskTypes(types);
    } catch (err) {
      console.error('Error loading task types:', err);
    }
  };

  const loadWorkflow = async (): Promise<void> => {
    if (!id) return;

    try {
      setLoading(true);
      const data: WorkflowDetailDTO = await workflowsApi.getById(id);
      setFormData({
        name: data.workflow.name,
        description: data.workflow.description,
        schedule_cron: data.workflow.schedule_cron || '',
        active: data.workflow.active,
      });
      // Reiniciar historial al cargar workflow
      resetHistory({
        steps: data.steps || [],
        edges: data.edges || [],
      });
    } catch (err) {
      setError('Error al cargar el workflow');
      console.error('Error loading workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('El nombre del workflow es requerido');
      return;
    }

    if (steps.length === 0) {
      setError('Se requiere al menos un paso en el workflow');
      return;
    }

    try {
      // Preparar steps sin id y workflow_id para crear/actualizar
      const stepsForSubmit = steps.map((step) => ({
        node_key: step.node_key,
        type: step.type,
        params: step.params,
      }));

      // Preparar edges sin id y workflow_id
      const edgesForSubmit = edges.map((edge) => ({
        from_node_key: edge.from_node_key,
        to_node_key: edge.to_node_key,
      }));

      const payload: CreateWorkflowDTO = {
        name: formData.name,
        description: formData.description,
        schedule_cron: formData.schedule_cron || null,
        steps: stepsForSubmit,
        edges: edgesForSubmit,
      };

      // Validar con Zod
      const validationResult = validateSafe(createWorkflowDTOSchema, payload);
      if (!validationResult.success) {
        const errors = getValidationErrors(validationResult.errors);
        setError(`Error de validación: ${JSON.stringify(errors)}`);
        return;
      }

      if (isEditMode && id) {
        await workflowsApi.update(id, payload);
      } else {
        await workflowsApi.create(payload);
      }

      navigate('/workflows');
    } catch (err) {
      setError('Error al guardar el workflow');
      console.error('Error saving workflow:', err);
    }
  };

  // Wrapper functions para actualizar steps y edges con historial
  const updateSteps = useCallback(
    (newSteps: Step[], overwrite = false) => {
      setWorkflowState({
        steps: newSteps,
        edges: edges,
      }, overwrite);
    },
    [edges, setWorkflowState]
  );

  const updateEdges = useCallback(
    (newEdges: Edge[], overwrite = false) => {
      setWorkflowState({
        steps: steps,
        edges: newEdges,
      }, overwrite);
    },
    [steps, setWorkflowState]
  );

  const updateBoth = useCallback(
    (newSteps: Step[], newEdges: Edge[], overwrite = false) => {
      setWorkflowState({
        steps: newSteps,
        edges: newEdges,
      }, overwrite);
    },
    [setWorkflowState]
  );

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Función para optimizar workflow con IA
  const handleOptimizeWorkflow = async (): Promise<void> => {
    if (!id) {
      setAlertConfig({
        type: 'warning',
        title: 'Workflow no guardado',
        message: 'Debes guardar el workflow antes de optimizarlo.',
      });
      setShowAlert(true);
      return;
    }

    if (steps.length === 0) {
      setAlertConfig({
        type: 'warning',
        title: 'Workflow vacío',
        message: 'El workflow debe tener al menos un nodo para optimizarlo.',
      });
      setShowAlert(true);
      return;
    }

    setOptimizing(true);

    try {
      const result = await optimizeWorkflow(id, steps, edges);

      if (!result.canOptimize) {
        // Workflow ya está optimizado
        setAlertConfig({
          type: 'success',
          title: 'Workflow Optimizado',
          message: result.message,
        });
        setShowAlert(true);
      } else {
        // Aplicar optimizaciones
        console.log('[WorkflowEditor] Applying optimizations...');
        console.log('[WorkflowEditor] Current steps before update:', steps);
        console.log('[WorkflowEditor] Optimized steps to apply:', result.optimizedSteps);

        if (result.optimizedSteps && result.optimizedEdges) {
          updateBoth(result.optimizedSteps, result.optimizedEdges, true);
        } else if (result.optimizedSteps) {
          updateSteps(result.optimizedSteps, true);
        } else if (result.optimizedEdges) {
          updateEdges(result.optimizedEdges, true);
        }

        console.log('[WorkflowEditor] Steps after update:', steps);

        // Mostrar sugerencias
        const suggestionsText = result.suggestions?.join('\n• ') || '';
        setAlertConfig({
          type: 'success',
          title: 'Optimización Exitosa',
          message: `${result.message}\n\nMejoras aplicadas:\n• ${suggestionsText}`,
        });
        setShowAlert(true);
      }
    } catch (error) {
      setAlertConfig({
        type: 'error',
        title: 'Error de Optimización',
        message: 'Ocurrió un error al intentar optimizar el workflow. Inténtalo de nuevo.',
      });
      setShowAlert(true);
    } finally {
      setOptimizing(false);
    }
  };

  // Keyboard shortcuts para Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z o Cmd+Z para Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }
      // Ctrl+Shift+Z o Cmd+Shift+Z para Redo
      // También Ctrl+Y o Cmd+Y como alternativa
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  if (loading) return <Loading message="Cargando workflow..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {isEditMode ? 'Editar Workflow' : 'Crear Nuevo Workflow'}
          </h1>
          <p className="mt-1 text-sm text-cyan-100/60">
            {isEditMode ? 'Modifica la configuración de tu workflow' : 'Configura un nuevo flujo de trabajo automatizado'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón de Optimizar con IA */}
          {isEditMode && (
            <button
              onClick={handleOptimizeWorkflow}
              disabled={optimizing || steps.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              type="button"
              title="Optimizar workflow con IA"
            >
              {optimizing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Optimizando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Optimizar con IA
                </>
              )}
            </button>
          )}
          <button
            onClick={() => navigate('/workflows')}
            className="inline-flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl text-rose-400 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#1a1a1a] rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5 p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Información Básica
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                Nombre del Workflow *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-black/40 text-white border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors placeholder-gray-500"
                placeholder="Ej: Procesamiento de datos diario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 bg-black/40 text-white border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors placeholder-gray-500 resize-none"
                rows={3}
                placeholder="Describe el propósito de este workflow..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                Programación (Cron)
              </label>
              <input
                type="text"
                name="schedule_cron"
                value={formData.schedule_cron}
                onChange={handleFormChange}
                placeholder="Ej: 0 0 * * * (diario a medianoche)"
                className="w-full px-4 py-2.5 bg-black/40 text-white border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors placeholder-gray-500 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Deja vacío para ejecución manual</p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-cyan-500/20">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleFormChange}
                className="w-5 h-5 text-cyan-500 bg-black/40 border-cyan-500/30 rounded focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                id="active-checkbox"
              />
              <label htmlFor="active-checkbox" className="text-sm text-cyan-100 cursor-pointer select-none">
                Workflow activo (se ejecutará según programación)
              </label>
            </div>
          </div>
        </div>

        {/* Visual Workflow Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Diseñador Visual
              </h3>
              <p className="text-sm text-cyan-100/60 mt-1">
                Arrastra los nodos para organizarlos, conecta los puntos para crear flujos
              </p>
            </div>
          </div>
          <WorkflowCanvas
            initialSteps={steps}
            initialEdges={edges}
            taskTypes={taskTypes}
            onNodesChange={(updatedSteps) => {
              const fullSteps: Step[] = updatedSteps.map((s, index) => ({
                id: steps[index]?.id || `step_${Date.now()}_${index}`,
                workflow_id: id || 'temp',
                node_key: s.node_key,
                type: s.type,
                params: s.params,
              }));
              updateSteps(fullSteps);
            }}
            onEdgesChange={(updatedEdges) => {
              const fullEdges: Edge[] = (updatedEdges as Edge[]).map((e, index) => ({
                id: e.id || `edge_${Date.now()}_${index}`,
                workflow_id: id || 'temp',
                from_node_key: e.from_node_key,
                to_node_key: e.to_node_key,
              }));
              updateEdges(fullEdges);
            }}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/workflows')}
            className="px-5 py-2.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isEditMode ? 'Actualizar Workflow' : 'Crear Workflow'}
          </button>
        </div>
      </form>

      {/* Alert Component */}
      {showAlert && (
        <Alert
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default WorkflowEditor;
