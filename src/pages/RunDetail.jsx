import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { runsApi } from '../services/api';
import { Button, Card, Loading, StateBadge, ProgressBar, ConfirmModal } from '../components';

const RunDetail = () => {
  const { runId } = useParams();
  const navigate = useNavigate();

  const [run, setRun] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);

  useEffect(() => {
    loadRunDetails();
  }, [runId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Only auto-refresh if run is in progress
      if (run && (run.state === 'Running' || run.state === 'Pending')) {
        loadRunDetails(true);
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, run]);

  useEffect(() => {
    loadLogs();
  }, [selectedTask]);

  const loadRunDetails = async (silent = false) => {
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

  const loadLogs = async () => {
    try {
      const logsData = await runsApi.getLogs(runId, {
        task: selectedTask,
        limit: 100,
      });
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading logs:', err);
    }
  };

  const handleCancel = async () => {
    try {
      await runsApi.cancel(runId);
      await loadRunDetails();
    } catch (err) {
      setError('Error al cancelar la ejecución');
      console.error('Error canceling run:', err);
    }
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(
      (t) => t.state === 'Succeeded' || t.state === 'Failed' || t.state === 'Canceled'
    ).length;
    return (completed / tasks.length) * 100;
  };

  const getLogLevelColor = (level) => {
    const colors = {
      INFO: 'text-cyan-400',
      WARNING: 'text-yellow-400',
      ERROR: 'text-rose-400',
      DEBUG: 'text-gray-400',
    };
    return colors[level] || 'text-gray-300';
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
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-cyan-500 bg-black/40 border-cyan-500/30 rounded focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            />
            Auto-actualizar
          </label>
          {(run.state === 'Running' || run.state === 'Pending') && (
            <button
              onClick={() => setCancelModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar Ejecución
            </button>
          )}
          <button
            onClick={() => navigate('/workflows')}
            className="inline-flex items-center gap-2 px-4 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
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
                    (new Date(run.finished_at) - new Date(run.started_at)) / 1000
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
                            (new Date(task.finished_at) - new Date(task.started_at)) / 1000
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
                        onClick={() =>
                          setSelectedTask(selectedTask === task.node_key ? null : task.node_key)
                        }
                        className="text-xs px-3 py-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors font-medium"
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
    </div>
  );
};

export default RunDetail;
