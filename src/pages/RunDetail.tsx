import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { runsApi, workflowsApi } from '../services/api';
import { Loading, StateBadge, ProgressBar, ConfirmModal } from '../components';
import Alert, { AlertType } from '../components/Alert';
import { repairWorkflow } from '../services/aiService';
import { Run, TaskInstance, LogEntry, LogLevel } from '../types';

// ============================================
// Types & Interfaces
// ============================================

interface LogFilters {
  task?: string;
  limit?: number;
}

// ============================================
// Component
// ============================================

const RunDetail: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const [run, setRun] = useState<Run | null>(null);
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [cancelModal, setCancelModal] = useState<boolean>(false);
  const [repairing, setRepairing] = useState<boolean>(false);
  const [showRepairModal, setShowRepairModal] = useState<boolean>(false);
  const [repairSuggestions, setRepairSuggestions] = useState<string[]>([]);
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

  useEffect(() => {
    if (runId) {
      loadRunDetails();
    }
  }, [runId]);

  useEffect(() => {
    if (!autoRefresh || !run) return;

    const interval = setInterval(() => {
      if (run.state === 'Running' || run.state === 'Pending') {
        loadRunDetails(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, run]);

  useEffect(() => {
    if (runId) {
      loadLogs();
    }
  }, [selectedTask, runId]);

  const loadRunDetails = async (silent: boolean = false): Promise<void> => {
    if (!runId) return;

    try {
      if (!silent) setLoading(true);
      setError(null);

      const data = await runsApi.getById(runId);
      setRun(data.run);
      setTasks(data.tasks || []);
    } catch (err) {
      setError('Error al cargar los detalles de la ejecución');
      console.error('Error loading run:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadLogs = async (): Promise<void> => {
    if (!runId) return;

    try {
      const filters: LogFilters = {
        limit: 100,
      };

      if (selectedTask) {
        filters.task = selectedTask;
      }

      const logsData = await runsApi.getLogs(runId, filters);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading logs:', err);
    }
  };

  const handleCancel = async (): Promise<void> => {
    if (!runId) return;

    try {
      await runsApi.cancel(runId);
      await loadRunDetails();
      setCancelModal(false);
    } catch (err) {
      setError('Error al cancelar la ejecución');
      console.error('Error canceling run:', err);
    }
  };

  const calculateProgress = (): number => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(
      (t) => t.state === 'Succeeded' || t.state === 'Failed'
    ).length;
    return (completed / tasks.length) * 100;
  };

  const getLogLevelColor = (level: LogLevel): string => {
    const colors: Record<LogLevel, string> = {
      INFO: 'text-cyan-400',
      WARNING: 'text-yellow-400',
      ERROR: 'text-rose-400',
      DEBUG: 'text-gray-400',
    };
    return colors[level] || 'text-gray-300';
  };

  const handleTaskSelection = (nodeKey: string): void => {
    setSelectedTask(selectedTask === nodeKey ? null : nodeKey);
  };

  const handleAutoRefreshChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAutoRefresh(e.target.checked);
  };

  // Función para iniciar reparación con IA
  const handleRepairRequest = async (): Promise<void> => {
    if (!run || !runId) return;

    // Encontrar el nodo que falló
    const failedTask = tasks.find((t) => t.state === 'Failed');
    if (!failedTask) {
      setAlertConfig({
        type: 'warning',
        title: 'Sin Errores',
        message: 'No se encontraron tareas con errores para reparar.',
      });
      setShowAlert(true);
      return;
    }

    setRepairing(true);

    try {
      // Obtener el workflow completo
      const workflowDetail = await workflowsApi.getById(run.workflow_id);

      // Llamar a la IA para reparar
      const result = await repairWorkflow(
        run.workflow_id,
        workflowDetail.steps,
        workflowDetail.edges,
        failedTask.node_key
      );

      if (result.canRepair && result.repairedSteps) {
        // Guardar sugerencias y mostrar modal de confirmación
        setRepairSuggestions(result.fixedIssues || []);
        setShowRepairModal(true);

        // Guardar los pasos reparados temporalmente
        (window as any).__repairedWorkflow = {
          steps: result.repairedSteps,
          edges: result.repairedEdges,
          message: result.message,
        };
      } else {
        setAlertConfig({
          type: 'error',
          title: 'No se Puede Reparar',
          message: result.message,
        });
        setShowAlert(true);
      }
    } catch (error) {
      setAlertConfig({
        type: 'error',
        title: 'Error de Reparación',
        message: 'Ocurrió un error al intentar reparar el workflow.',
      });
      setShowAlert(true);
    } finally {
      setRepairing(false);
    }
  };

  // Función para aceptar la reparación y aplicar cambios
  const handleAcceptRepair = async (): Promise<void> => {
    if (!run) return;

    const repairedData = (window as any).__repairedWorkflow;
    if (!repairedData) return;

    setShowRepairModal(false);

    try {
      // Actualizar el workflow con los cambios reparados
      await workflowsApi.update(run.workflow_id, {
        steps: repairedData.steps,
        edges: repairedData.edges || [],
      });

      // Mostrar confirmación y navegar al editor
      setAlertConfig({
        type: 'success',
        title: 'Reparación Aplicada',
        message: `${repairedData.message}\n\nLos cambios se han guardado. Puedes ejecutar el workflow nuevamente.`,
      });
      setShowAlert(true);

      // Limpiar datos temporales
      delete (window as any).__repairedWorkflow;

      // Opcional: navegar al editor después de 2 segundos
      setTimeout(() => {
        navigate(`/workflows/${run.workflow_id}/edit`);
      }, 2000);
    } catch (error) {
      setAlertConfig({
        type: 'error',
        title: 'Error al Aplicar',
        message: 'No se pudieron aplicar los cambios de reparación.',
      });
      setShowAlert(true);
    }
  };

  // Función para rechazar la reparación
  const handleRejectRepair = (): void => {
    setShowRepairModal(false);
    delete (window as any).__repairedWorkflow;
  };

  if (loading) return <Loading message="Cargando detalles de ejecución..." />;

  if (!run) {
    return (
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-cyan-500/20 rounded-2xl shadow-xl shadow-cyan-500/5 p-12 text-center">
          <p className="text-gray-400">Ejecución no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Detalles de Ejecución
          </h1>
          <p className="mt-1 text-sm text-cyan-100/60 font-mono">Run ID: {run.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-cyan-100 bg-[#1a1a1a] px-3 py-2 rounded-lg border border-cyan-500/20">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={handleAutoRefreshChange}
              className="w-4 h-4 text-cyan-500 bg-black/40 border-cyan-500/30 rounded focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            />
            Auto-actualizar
          </label>
          {(run.state === 'Running' || run.state === 'Pending') && (
            <button
              onClick={() => setCancelModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20 font-medium text-sm"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar Ejecución
            </button>
          )}
          {run.state === 'Failed' && (
            <button
              onClick={handleRepairRequest}
              disabled={repairing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              title="Reparar workflow con IA"
            >
              {repairing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reparando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Reparar con IA
                </>
              )}
            </button>
          )}
          <button
            onClick={() => navigate('/workflows')}
            className="inline-flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Workflows
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

      {/* Run Status Card */}
      <div className="bg-[#1a1a1a] rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5 p-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Estado de Ejecución
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/20 p-4 rounded-lg border border-cyan-500/10">
            <p className="text-sm text-cyan-400 mb-2 font-medium">Estado</p>
            <StateBadge state={run.state} />
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-purple-500/10">
            <p className="text-sm text-purple-400 mb-2 font-medium">Inicio</p>
            <p className="text-sm font-mono text-gray-300">
              {run.started_at ? new Date(run.started_at).toLocaleString() : 'No iniciado'}
            </p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-emerald-500/10">
            <p className="text-sm text-emerald-400 mb-2 font-medium">Fin</p>
            <p className="text-sm font-mono text-gray-300">
              {run.finished_at ? new Date(run.finished_at).toLocaleString() : 'En ejecución...'}
            </p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-orange-500/10">
            <p className="text-sm text-orange-400 mb-2 font-medium">Duración</p>
            <p className="text-sm font-mono text-gray-300">
              {run.started_at && run.finished_at
                ? `${Math.round(
                    (new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000
                  )}s`
                : 'N/A'}
            </p>
          </div>
        </div>
        <ProgressBar value={calculateProgress()} label="Progreso General" />
      </div>

      {/* Tasks Card */}
      <div className="bg-[#1a1a1a] rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5 p-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Tareas
        </h3>
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No se encontraron tareas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Nodo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Intentos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Error
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-cyan-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`transition-colors ${
                      selectedTask === task.node_key
                        ? 'bg-cyan-500/10'
                        : 'hover:bg-black/20'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-white font-medium">
                      {task.node_key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{task.type}</td>
                    <td className="px-4 py-3">
                      <StateBadge state={task.state} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                      {task.try_count} / {task.max_retries}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                      {task.started_at && task.finished_at
                        ? `${Math.round(
                            (new Date(task.finished_at).getTime() - new Date(task.started_at).getTime()) / 1000
                          )}s`
                        : task.started_at
                        ? 'Ejecutando...'
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-rose-400 max-w-xs truncate font-mono">
                      {task.error || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTaskSelection(task.node_key)}
                        className="text-xs px-3 py-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors font-medium"
                        type="button"
                      >
                        {selectedTask === task.node_key ? 'Ocultar Logs' : 'Ver Logs'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Logs Card */}
      <div className="bg-[#1a1a1a] rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5 p-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
          {selectedTask ? `Logs de ${selectedTask}` : 'Todos los Logs'}
        </h3>
        <div className="space-y-1 max-h-96 overflow-y-auto bg-black/40 rounded-lg p-4 border border-cyan-500/10">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay logs disponibles</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 text-sm font-mono border-b border-cyan-500/5 pb-2 last:border-0"
              >
                <span className="text-gray-500 whitespace-nowrap">
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
                <span className={`font-semibold ${getLogLevelColor(log.level)} whitespace-nowrap`}>
                  [{log.level}]
                </span>
                <span className="text-gray-300 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de confirmación para cancelar ejecución */}
      <ConfirmModal
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancelar Ejecución"
        message={`¿Estás seguro de que deseas cancelar esta ejecución? Las tareas en progreso se detendrán.`}
        confirmText="Cancelar Ejecución"
        cancelText="Volver"
        type="warning"
      />

      {/* Modal de confirmación para reparación con IA */}
      {showRepairModal && (
        <ConfirmModal
          isOpen={showRepairModal}
          onClose={handleRejectRepair}
          onConfirm={handleAcceptRepair}
          title="Reparación Sugerida por IA"
          message="Se encontraron los siguientes problemas y soluciones:"
          confirmText="Aplicar Reparación"
          cancelText="Rechazar"
          type="info"
        >
          <div className="mt-4 bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-4">
            <ul className="list-disc pl-5 space-y-2 text-cyan-100">
              {repairSuggestions.map((suggestion, i) => (
                <li key={i} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        </ConfirmModal>
      )}

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

export default RunDetail;
