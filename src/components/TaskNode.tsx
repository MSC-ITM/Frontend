import React, { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { TaskType } from '../types';
import Alert, { AlertType } from './Alert';
import apiClient from '../services/api';

interface TaskNodeData {
  label: string;
  taskType: string;
  params: Record<string, any>;
  taskTypes?: TaskType[];
}

const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ data, selected, id }) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskType, setCurrentTaskType] = useState(data.taskType);
  const [paramsJson, setParamsJson] = useState(JSON.stringify(data.params, null, 2));
  const [csvFile, setCsvFile] = useState<File | null>(null);
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

  // Sincronizar el estado local cuando cambia data.taskType desde afuera
  useEffect(() => {
    setCurrentTaskType(data.taskType);
  }, [data.taskType]);

  // Manejar cambio de archivo CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setAlertConfig({
        type: 'error',
        title: 'Archivo Inválido',
        message: 'Por favor selecciona un archivo CSV válido (.csv)',
      });
      setShowAlert(true);
      e.target.value = '';
      return;
    }

    setCsvFile(file);
  };

  // Obtener ícono basado en el tipo de tarea
  const getTaskIcon = (taskType: string): React.ReactElement => {
    const defaultIcon = (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    );

    const icons: Record<string, React.ReactElement> = {
      http_get: defaultIcon,
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
    return icons[taskType] ?? defaultIcon;
  };

  // Obtener color basado en el tipo de tarea (colores neón)
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

  // Obtener color de sombra basado en el tipo de tarea
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

  const taskTypeName = data.taskTypes?.find((t) => t.type === currentTaskType)?.display_name || currentTaskType;

  return (
    <div
      className={`
        relative bg-[#1e1e1e] rounded-lg shadow-2xl border-2 transition-all duration-200
        ${selected ? `border-cyan-400 ${getShadowColor(currentTaskType)} shadow-xl` : 'border-gray-700/50 hover:border-gray-600'}
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
      <div className={`bg-gradient-to-r ${getTaskColor(currentTaskType)} p-3 rounded-t-lg ${getShadowColor(currentTaskType)} shadow-md`}>
        <div className="flex items-center gap-2 text-white">
          {getTaskIcon(currentTaskType)}
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
            currentTaskType === 'validate_csv' && data.params.path ? (
              <div className="text-xs bg-black/40 px-2 py-1 rounded border border-purple-500/30">
                <div className="text-gray-300">📄 {data.params.original_name || 'archivo.csv'}</div>
                {data.params.columns && (
                  <div className="text-gray-500 text-[10px] mt-0.5">
                    Columnas: {data.params.columns.join(', ')}
                  </div>
                )}
              </div>
            ) : currentTaskType === 'transform_simple' && data.params.table_name ? (
              <div className="text-xs bg-black/40 px-2 py-1 rounded border border-purple-500/30">
                <div className="text-gray-300">
                  🔄 Datos del contexto → 💾 SQL
                </div>
                <div className="text-gray-500 text-[10px] mt-0.5">
                  Tabla: {data.params.table_name}
                </div>
                {data.params.select_columns && (
                  <div className="text-gray-500 text-[10px]">
                    Columnas: {data.params.select_columns.join(', ')}
                  </div>
                )}
              </div>
            ) : currentTaskType === 'save_db' && data.params.db_path ? (
              <div className="text-xs bg-black/40 px-2 py-1 rounded border border-purple-500/30">
                <div className="text-gray-300">
                  📄 SQL → 🗄️ SQLite DB
                </div>
                <div className="text-gray-500 text-[10px] mt-0.5">
                  BD: {data.params.db_path}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono bg-black/40 px-2 py-1 rounded border border-purple-500/30 text-gray-300 max-h-20 overflow-auto">
                {JSON.stringify(data.params, null, 2)}
              </div>
            )
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
                value={currentTaskType}
                onChange={(e) => {
                  e.stopPropagation();
                  const newTaskType = e.target.value;
                  setCurrentTaskType(newTaskType);
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === id
                        ? { ...node, data: { ...node.data, taskType: newTaskType } }
                        : node
                    )
                  );
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

            {/* Campo especial para validate_csv */}
            {currentTaskType === 'validate_csv' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-purple-400 font-medium mb-1.5">Archivo CSV:</label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer"
                  />
                  {csvFile && (
                    <div className="text-xs bg-black/40 px-3 py-2 rounded border border-purple-500/30 mt-2">
                      <div className="text-purple-300 font-medium">Archivo seleccionado:</div>
                      <div className="text-gray-300 mt-1">📄 {csvFile.name}</div>
                      <div className="text-gray-400 text-[10px] mt-1">
                        Tamaño: {(csvFile.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  )}
                  {data.params?.path && !csvFile && (
                    <div className="text-xs bg-black/40 px-3 py-2 rounded border border-purple-500/30 mt-2">
                      <div className="text-purple-300 font-medium">Archivo guardado:</div>
                      <div className="text-gray-300 mt-1">📄 {data.params.original_name || 'archivo.csv'}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-purple-400 font-medium mb-1.5">Columnas esperadas (opcional):</label>
                  <input
                    type="text"
                    value={data.params?.columns?.join(', ') || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      const columns = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: { ...node.data.params, columns: columns.length > 0 ? columns : undefined } } }
                            : node
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Dejar vacío para solo validar formato"
                    className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 italic">
                    💡 Si no especificas columnas, solo se validará el formato CSV
                  </div>
                </div>
              </div>
            ) : currentTaskType === 'transform_simple' ? (
              <div className="space-y-3">
                <div className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1.5 rounded border border-cyan-500/30 mb-2">
                  ℹ️ Este nodo obtiene datos de nodos previos (http_get o validate_csv)
                </div>
                <div>
                  <label className="block text-xs text-purple-400 font-medium mb-1.5">Nombre de la tabla SQL:</label>
                  <input
                    type="text"
                    value={data.params?.table_name || 'data_table'}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: { ...node.data.params, table_name: e.target.value } } }
                            : node
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="data_table"
                    className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-purple-400 font-medium mb-1.5">Columnas a incluir (opcional):</label>
                  <input
                    type="text"
                    value={data.params?.select_columns?.join(', ') || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      const columns = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: { ...node.data.params, select_columns: columns.length > 0 ? columns : undefined } } }
                            : node
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Dejar vacío para incluir todas"
                    className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 italic">
                    💡 Separar columnas con comas. Ej: id, nombre, email
                  </div>
                </div>
              </div>
            ) : currentTaskType === 'save_db' ? (
              <div className="space-y-3">
                <div className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1.5 rounded border border-cyan-500/30 mb-2">
                  ℹ️ Este nodo ejecuta archivos SQL generados por transform_simple
                </div>
                <div>
                  <label className="block text-xs text-purple-400 font-medium mb-1.5">Ruta de la Base de Datos:</label>
                  <input
                    type="text"
                    value={data.params?.db_path || 'data/output.db'}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: { ...node.data.params, db_path: e.target.value } } }
                            : node
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="data/output.db"
                    className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 italic">
                    💡 La base de datos SQLite donde se guardarán los datos
                  </div>
                </div>
              </div>
            ) : currentTaskType === 'http_get' ? (
              <div className="space-y-3">
                <div className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1.5 rounded border border-cyan-500/30 mb-2">
                  ℹ️ Este nodo realiza una petición HTTP GET
                </div>
                <div>
                  <label className="block text-xs text-purple-400 font-medium mb-1.5">URL:</label>
                  <input
                    type="text"
                    value={data.params?.url || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: { ...node.data.params, url: e.target.value } } }
                            : node
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="https://api.example.com/data"
                    className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 italic">
                    💡 URL completa del endpoint a consultar
                  </div>
                </div>
              </div>
            ) : currentTaskType === 'notify_mock' ? (
              <div className="space-y-3">
                <div className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1.5 rounded border border-cyan-500/30 mb-2">
                  ℹ️ Este nodo envía una notificación de escritorio
                </div>
                <div>
                  <label className="block text-xs text-purple-400 font-medium mb-1.5">Mensaje:</label>
                  <textarea
                    value={data.params?.message || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  params: {
                                    channel: 'desknotification',
                                    message: e.target.value
                                  }
                                }
                              }
                            : node
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Workflow ejecutado correctamente!"
                    className="w-full bg-black/60 text-white border border-purple-500/50 rounded-md px-3 py-2 text-xs focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all min-h-[80px] resize-y"
                  />
                  <div className="text-[10px] text-gray-500 mt-1 italic">
                    💡 Mensaje que se mostrará en la notificación de escritorio
                  </div>
                </div>
              </div>
            ) : (
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
            )}

            {/* Botón de guardar para todos los tipos */}
            <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (currentTaskType === 'validate_csv') {
                      // Para validate_csv, subir el archivo primero
                      if (!csvFile && !data.params?.path) {
                        setAlertConfig({
                          type: 'error',
                          title: 'Archivo Requerido',
                          message: 'Por favor selecciona un archivo CSV.',
                        });
                        setShowAlert(true);
                        return;
                      }

                      let filePath = data.params?.path;

                      // Si hay un archivo nuevo, subirlo
                      if (csvFile) {
                        const formData = new FormData();
                        formData.append('file', csvFile);

                        try {
                          const response = await apiClient.post('/files/upload-csv', formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          });

                          filePath = response.data.path;

                          // Actualizar parámetros con la ruta del archivo
                          const updatedParams: any = {
                            path: filePath,
                            original_name: response.data.original_name,
                          };

                          // Solo incluir columns si están definidas
                          if (data.params?.columns && data.params.columns.length > 0) {
                            updatedParams.columns = data.params.columns;
                          }

                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === id
                                ? { ...node, data: { ...node.data, params: updatedParams } }
                                : node
                            )
                          );

                          setCsvFile(null);
                          setIsEditing(false);

                          setAlertConfig({
                            type: 'success',
                            title: 'Archivo Subido',
                            message: 'El archivo CSV se subió correctamente.',
                          });
                          setShowAlert(true);
                        } catch (uploadError) {
                          setAlertConfig({
                            type: 'error',
                            title: 'Error al Subir',
                            message: 'No se pudo subir el archivo. Verifica tu conexión.',
                          });
                          setShowAlert(true);
                        }
                      } else {
                        // Si no hay archivo nuevo, solo cerrar el modal
                        setIsEditing(false);
                      }
                    } else if (currentTaskType === 'transform_simple') {
                      // Para transform_simple, validar solo table_name
                      if (!data.params?.table_name) {
                        setAlertConfig({
                          type: 'error',
                          title: 'Campo Requerido',
                          message: 'Por favor especifica el nombre de la tabla SQL.',
                        });
                        setShowAlert(true);
                        return;
                      }

                      setIsEditing(false);
                    } else if (currentTaskType === 'http_get') {
                      // Para http_get, validar que URL esté presente
                      if (!data.params?.url || data.params.url.trim() === '') {
                        setAlertConfig({
                          type: 'error',
                          title: 'URL Requerida',
                          message: 'Por favor ingresa la URL del endpoint a consultar.',
                        });
                        setShowAlert(true);
                        return;
                      }

                      // Validar que la URL tenga formato correcto
                      try {
                        new URL(data.params.url);
                      } catch {
                        setAlertConfig({
                          type: 'error',
                          title: 'URL Inválida',
                          message: 'Por favor ingresa una URL válida (ej: https://api.example.com/data).',
                        });
                        setShowAlert(true);
                        return;
                      }

                      // Construir el formato JSON que espera el worker
                      const workerParams = {
                        url: data.params.url
                      };

                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: workerParams } }
                            : node
                        )
                      );
                      setIsEditing(false);
                    } else if (currentTaskType === 'notify_mock') {
                      // Para notify_mock, validar que mensaje esté presente
                      if (!data.params?.message || data.params.message.trim() === '') {
                        setAlertConfig({
                          type: 'error',
                          title: 'Mensaje Requerido',
                          message: 'Por favor ingresa el mensaje de la notificación.',
                        });
                        setShowAlert(true);
                        return;
                      }

                      // El formato JSON ya está construido por el onChange
                      // Solo verificar que channel esté presente
                      const workerParams = {
                        channel: 'desknotification',
                        message: data.params.message
                      };

                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: workerParams } }
                            : node
                        )
                      );
                      setIsEditing(false);
                    } else {
                      // Para otros tipos de nodos, parsear JSON normal
                      const parsedParams = JSON.parse(paramsJson);
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === id
                            ? { ...node, data: { ...node.data, params: parsedParams } }
                            : node
                        )
                      );
                      setIsEditing(false);
                    }
                  } catch (error) {
                    setAlertConfig({
                      type: 'error',
                      title: 'Error',
                      message: error instanceof Error ? error.message : 'Error al guardar cambios',
                    });
                    setShowAlert(true);
                  }
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md px-4 py-2 text-sm hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20 font-medium"
              >
                {currentTaskType === 'validate_csv' && csvFile ? 'Subir y Guardar' : 'Guardar Cambios'}
              </button>
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
