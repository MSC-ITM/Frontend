import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowsApi } from '../services/api';
import { Loading, StateBadge, ConfirmModal, PredictionModal } from '../components';
import { Workflow, Run, AIPredictionResult } from '../types';
import { predictWorkflowOutcome } from '../services/aiService';

// ============================================
// Types & Interfaces
// ============================================

interface DeleteModalState {
  isOpen: boolean;
  workflowId: string | null;
  workflowName: string;
}

// ============================================
// Component
// ============================================

const WorkflowsList: React.FC = () => {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    workflowId: null,
    workflowName: '',
  });
  const [showPredictionModal, setShowPredictionModal] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<AIPredictionResult | null>(null);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [workflowToRun, setWorkflowToRun] = useState<string | null>(null);

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowsApi.getAll();
      setWorkflows(data);
    } catch (err) {
      setError('Failed to load workflows. Make sure the backend is running.');
      console.error('Error loading workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteModal.workflowId) return;

    try {
      await workflowsApi.delete(deleteModal.workflowId);
      await loadWorkflows();
      closeDeleteModal();
    } catch (err) {
      setError('Error al eliminar el workflow');
      console.error('Error deleting workflow:', err);
    }
  };

  const openDeleteModal = (workflow: Workflow): void => {
    setDeleteModal({
      isOpen: true,
      workflowId: workflow.id,
      workflowName: workflow.name,
    });
  };

  const closeDeleteModal = (): void => {
    setDeleteModal({ isOpen: false, workflowId: null, workflowName: '' });
  };

  const handleRunNow = async (id: string): Promise<void> => {
    try {
      // Guardar ID del workflow a ejecutar
      setWorkflowToRun(id);

      // Obtener detalles del workflow para predecir
      const workflowDetail = await workflowsApi.getById(id);

      // Mostrar modal de predicción y empezar a predecir
      setShowPredictionModal(true);
      setPredicting(true);

      // Llamar a la IA para predecir
      const predictionResult = await predictWorkflowOutcome(
        id,
        workflowDetail.steps,
        workflowDetail.edges
      );

      setPrediction(predictionResult);
      setPredicting(false);
    } catch (err) {
      alert('Error al predecir el workflow');
      console.error('Error predicting workflow:', err);
      setShowPredictionModal(false);
      setPredicting(false);
    }
  };

  const handleConfirmExecution = async (): Promise<void> => {
    if (!workflowToRun) return;

    try {
      const run: Run = await workflowsApi.runNow(workflowToRun);
      setShowPredictionModal(false);
      setPrediction(null);
      setWorkflowToRun(null);
      navigate(`/runs/${run.id}`);
    } catch (err) {
      alert('Error al ejecutar el workflow');
      console.error('Error starting workflow:', err);
    }
  };

  const handleCancelExecution = (): void => {
    setShowPredictionModal(false);
    setPrediction(null);
    setWorkflowToRun(null);
    setPredicting(false);
  };

  // Función para filtrar workflows según búsqueda y filtros
  const getFilteredWorkflows = (): Workflow[] => {
    return workflows.filter((workflow) => {
      // Filtro de búsqueda
      const matchesSearch =
        searchTerm === '' ||
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de estado
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && workflow.active) ||
        (filterStatus === 'inactive' && !workflow.active);

      return matchesSearch && matchesStatus;
    });
  };

  const filteredWorkflows = getFilteredWorkflows();

  if (loading) return <Loading message="Loading workflows..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Workflows
          </h1>
          <p className="mt-1 text-sm text-cyan-100/60">
            Gestiona y orquesta tus flujos de trabajo automatizados
          </p>
        </div>
        <button
          onClick={() => navigate('/workflows/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl font-medium"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Workflow
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

      {/* Barra de búsqueda y filtros */}
      {workflows.length > 0 && (
        <div className="bg-[#1a1a1a] border border-cyan-500/20 rounded-xl shadow-lg shadow-cyan-500/5 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Campo de búsqueda */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filtros por estado */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-black/40 text-gray-400 border border-cyan-500/20 hover:border-cyan-500/40 hover:text-gray-300'
                }`}
                type="button"
              >
                Todos ({workflows.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  filterStatus === 'active'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-black/40 text-gray-400 border border-emerald-500/20 hover:border-emerald-500/40 hover:text-gray-300'
                }`}
                type="button"
              >
                Activos ({workflows.filter(w => w.active).length})
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  filterStatus === 'inactive'
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30'
                    : 'bg-black/40 text-gray-400 border border-gray-500/20 hover:border-gray-500/40 hover:text-gray-300'
                }`}
                type="button"
              >
                Inactivos ({workflows.filter(w => !w.active).length})
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          {(searchTerm || filterStatus !== 'all') && (
            <div className="mt-3 pt-3 border-t border-cyan-500/10">
              <p className="text-sm text-gray-400">
                Mostrando <span className="font-semibold text-cyan-400">{filteredWorkflows.length}</span> de <span className="font-semibold text-gray-300">{workflows.length}</span> workflows
              </p>
            </div>
          )}
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-cyan-500/20 rounded-2xl shadow-xl shadow-cyan-500/5 p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">No hay workflows aún</h3>
            <p className="text-gray-400 mb-6">Comienza creando tu primer workflow</p>
            <button
              onClick={() => navigate('/workflows/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium shadow-lg shadow-cyan-500/20"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear tu primer workflow
            </button>
          </div>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-cyan-500/20 rounded-2xl shadow-xl shadow-cyan-500/5 p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">No se encontraron resultados</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? `No hay workflows que coincidan con "${searchTerm}"` : 'No hay workflows con este filtro'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all font-medium shadow-lg shadow-cyan-500/20"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Limpiar Filtros
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-[#1a1a1a] rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Workflow Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => navigate(`/workflows/${workflow.id}`)}
                        className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent hover:from-cyan-300 hover:to-blue-300 transition-colors truncate text-left"
                        type="button"
                      >
                        {workflow.name}
                      </button>
                      <StateBadge state={workflow.active ? 'Succeeded' : 'Pending'} />
                    </div>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{workflow.description}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{workflow.schedule_cron || 'Activación manual'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Creado {new Date(workflow.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {/* Special button for demo workflow wf_004 */}
                    {workflow.id === 'wf_004' && (
                      <button
                        onClick={() => navigate('/runs/run_005')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg hover:from-rose-600 hover:to-red-600 transition-all shadow-lg shadow-rose-500/20 font-medium text-sm animate-pulse"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Ver Ejecución Fallida
                      </button>
                    )}
                    <button
                      onClick={() => handleRunNow(workflow.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 font-medium text-sm"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ejecutar
                    </button>
                    <button
                      onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
                      className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      title="Editar"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteModal(workflow)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Eliminar"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Workflow"
        message={`¿Estás seguro de que deseas eliminar el workflow "${deleteModal.workflowName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de predicción con IA */}
      <PredictionModal
        isOpen={showPredictionModal}
        onClose={handleCancelExecution}
        onConfirm={handleConfirmExecution}
        prediction={prediction}
        loading={predicting}
      />
    </div>
  );
};

export default WorkflowsList;
