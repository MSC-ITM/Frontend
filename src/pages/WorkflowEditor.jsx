import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workflowsApi, taskTypesApi } from '../services/api';
import { Button, Card, Loading, WorkflowCanvas } from '../components';

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [taskTypes, setTaskTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_cron: '',
    active: true,
  });
  const [steps, setSteps] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTaskTypes();
    if (isEditMode) {
      loadWorkflow();
    }
  }, [id]);

  const loadTaskTypes = async () => {
    try {
      const types = await taskTypesApi.getAll();
      setTaskTypes(types);
    } catch (err) {
      console.error('Error loading task types:', err);
    }
  };

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const data = await workflowsApi.getById(id);
      setFormData({
        name: data.workflow.name,
        description: data.workflow.description,
        schedule_cron: data.workflow.schedule_cron || '',
        active: data.workflow.active,
      });
      setSteps(data.steps || []);
      setEdges(data.edges || []);
    } catch (err) {
      setError('Error al cargar el workflow');
      console.error('Error loading workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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
      const payload = {
        ...formData,
        schedule_cron: formData.schedule_cron || null,
        steps,
        edges,
      };

      if (isEditMode) {
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

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      workflow_id: id || 'temp',
      node_key: `node_${steps.length + 1}`,
      type: taskTypes[0]?.type || '',
      params: {},
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId) => {
    setSteps(steps.filter((s) => s.id !== stepId));
    // Remove edges connected to this step
    const stepToRemove = steps.find((s) => s.id === stepId);
    if (stepToRemove) {
      setEdges(
        edges.filter(
          (e) => e.from_node_key !== stepToRemove.node_key && e.to_node_key !== stepToRemove.node_key
        )
      );
    }
  };

  const updateStep = (stepId, field, value) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, [field]: value } : s)));
  };

  const addEdge = () => {
    if (steps.length < 2) {
      alert('Need at least 2 steps to create an edge');
      return;
    }
    const newEdge = {
      id: `edge_${Date.now()}`,
      workflow_id: id || 'temp',
      from_node_key: steps[0].node_key,
      to_node_key: steps[1]?.node_key || steps[0].node_key,
    };
    setEdges([...edges, newEdge]);
  };

  const removeEdge = (edgeId) => {
    setEdges(edges.filter((e) => e.id !== edgeId));
  };

  const updateEdge = (edgeId, field, value) => {
    setEdges(edges.map((e) => (e.id === edgeId ? { ...e, [field]: value } : e)));
  };

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
        <button
          onClick={() => navigate('/workflows')}
          className="inline-flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/40 text-white border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors placeholder-gray-500"
                placeholder="Ej: Procesamiento de datos diario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/40 text-white border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors placeholder-gray-500 resize-none"
                rows="3"
                placeholder="Describe el propósito de este workflow..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                Programación (Cron)
              </label>
              <input
                type="text"
                value={formData.schedule_cron}
                onChange={(e) => setFormData({ ...formData, schedule_cron: e.target.value })}
                placeholder="Ej: 0 0 * * * (diario a medianoche)"
                className="w-full px-4 py-2.5 bg-black/40 text-white border border-cyan-500/30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors placeholder-gray-500 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Deja vacío para ejecución manual</p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-cyan-500/20">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
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
            onNodesChange={(updatedSteps) => setSteps(updatedSteps)}
            onEdgesChange={(updatedEdges) => setEdges(updatedEdges)}
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
    </div>
  );
};

export default WorkflowEditor;
