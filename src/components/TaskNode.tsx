import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TaskType } from '../types';
import Alert, { AlertType } from './Alert';

interface TaskNodeData {
  label: string;
  taskType: string;
  params: Record<string, any>;
  taskTypes?: TaskType[];
}

const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [paramsJson, setParamsJson] = useState(JSON.stringify(data.params, null, 2));
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: AlertType;
    title: string;
    message: string;
  }>({
    type: 'error',
    title: '',
    message: '',
  });

  // Get icon based on task type
  const getTaskIcon = (taskType: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      http_get: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      validate_csv: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      transform_simple: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      save_db: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      notify_mock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    };
    return icons[taskType] || icons.http_get;
  };

  // Get color based on task type (neon colors)
  const getTaskColor = (taskType: string): string => {
    const colors: Record<string, string> = {
      http_get: 'from-cyan-500 to-blue-500',
      validate_csv: 'from-emerald-500 to-teal-500',
      transform_simple: 'from-purple-500 to-fuchsia-500',
      save_db: 'from-orange-500 to-amber-500',
      notify_mock: 'from-pink-500 to-rose-500',
    };
    return colors[taskType] || 'from-gray-500 to-gray-600';
  };

  // Get shadow color
  const getShadowColor = (taskType: string): string => {
    const shadows: Record<string, string> = {
      http_get: 'shadow-cyan-500/50',
      validate_csv: 'shadow-emerald-500/50',
      transform_simple: 'shadow-purple-500/50',
      save_db: 'shadow-orange-500/50',
      notify_mock: 'shadow-pink-500/50',
    };
    return shadows[taskType] || 'shadow-gray-500/50';
  };

  const taskTypeName = data.taskTypes?.find((t) => t.type === data.taskType)?.display_name || data.taskType;

  return (
    <div
      className={`
        relative bg-[#1e1e1e] rounded-lg shadow-2xl border-2 transition-all duration-200
        ${selected ? `border-cyan-400 ${getShadowColor(data.taskType)} shadow-xl` : 'border-gray-700/50 hover:border-gray-600'}
        min-w-[220px]
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-cyan-400 !border-2 !border-[#1e1e1e] shadow-lg shadow-cyan-400/50"
      />

      {/* Node Header */}
      <div className={`bg-gradient-to-r ${getTaskColor(data.taskType)} p-3 rounded-t-lg ${getShadowColor(data.taskType)} shadow-md`}>
        <div className="flex items-center gap-2 text-white">
          {getTaskIcon(data.taskType)}
          <span className="font-semibold text-sm drop-shadow-lg">{taskTypeName}</span>
        </div>
      </div>

      {/* Node Body */}
      <div className="p-3 bg-[#1e1e1e]">
        <div className="text-white">
          <div className="text-xs text-cyan-400 mb-1 font-medium">Clave del Nodo:</div>
          <div className="text-sm font-mono bg-black/40 px-2 py-1 rounded border border-cyan-500/30 text-cyan-100">
            {data.label}
          </div>
        </div>

        {/* Parameters Preview */}
        <div className="mt-2">
          <div className="text-xs text-purple-400 mb-1 font-medium">Parámetros:</div>
          {Object.keys(data.params || {}).length > 0 ? (
            <div className="text-xs font-mono bg-black/40 px-2 py-1 rounded border border-purple-500/30 text-gray-300 max-h-20 overflow-auto">
              {JSON.stringify(data.params, null, 2)}
            </div>
          ) : (
            <div className="text-xs font-mono bg-black/40 px-2 py-1 rounded border border-purple-500/30 text-gray-500 italic">
              Sin parámetros configurados
            </div>
          )}
        </div>
      </div>

      {/* Edit Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          // Sincronizar el JSON actual antes de abrir el modal
          setParamsJson(JSON.stringify(data.params, null, 2));
          setIsEditing(!isEditing);
        }}
        className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-colors shadow-lg shadow-cyan-500/50 flex items-center justify-center text-sm"
        title="Editar nodo"
      >
        ✎
      </button>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-emerald-400 !border-2 !border-[#1e1e1e] shadow-lg shadow-emerald-400/50"
      />

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="absolute top-full left-0 mt-2 w-80 bg-[#1e1e1e] rounded-lg shadow-2xl border border-cyan-500/30 p-4 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-cyan-400 font-semibold text-sm">Editar Nodo</h3>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-cyan-400 font-medium mb-1.5">Tipo de Tarea:</label>
              <select
                value={data.taskType}
                onChange={(e) => {
                  e.stopPropagation();
                  data.taskType = e.target.value;
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-black/60 text-white border border-cyan-500/50 rounded-md px-3 py-2 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all cursor-pointer hover:bg-black/70 hover:border-cyan-400/70"
              >
                {data.taskTypes?.map((type) => (
                  <option key={type.type} value={type.type} className="bg-[#1a1a1a] text-white py-2">
                    {type.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-purple-400 font-medium mb-1.5">Parámetros (JSON):</label>
              <textarea
                value={paramsJson}
                onChange={(e) => {
                  e.stopPropagation();
                  setParamsJson(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs font-mono focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all min-h-[120px] resize-y"
                placeholder='{\n  "key": "value"\n}'
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                try {
                  const parsedParams = JSON.parse(paramsJson);
                  data.params = parsedParams;
                  setIsEditing(false);
                } catch (error) {
                  setAlertConfig({
                    type: 'error',
                    title: 'JSON Inválido',
                    message: 'El formato JSON no es válido. Verifica la sintaxis.',
                  });
                  setShowAlert(true);
                }
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md px-4 py-2 text-sm hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20 font-medium"
            >
              Guardar Cambios
            </button>
            <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-700/50">
              Click fuera para cerrar
            </div>
          </div>
        </div>
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

export default memo(TaskNode);
