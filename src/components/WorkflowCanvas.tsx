import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  BackgroundVariant,
  OnConnect,
  Node,
  Edge as FlowEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TaskNode from './TaskNode';
import { Step, Edge, TaskType } from '../types';

const nodeTypes = {
  taskNode: TaskNode,
};

interface WorkflowCanvasProps {
  initialSteps?: Step[];
  initialEdges?: Edge[];
  taskTypes?: TaskType[];
  onNodesChange?: (steps: Omit<Step, 'id' | 'workflow_id'>[]) => void;
  onEdgesChange?: (edges: Omit<Edge, 'id' | 'workflow_id'>[]) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  initialSteps = [],
  initialEdges = [],
  taskTypes = [],
  onNodesChange,
  onEdgesChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  // Convert steps to React Flow nodes
  const convertStepsToNodes = (steps: Step[], existingNodes: Node[] = []): Node[] => {
    return steps.map((step, index) => {
      // Buscar si el nodo ya existe para preservar su posición
      const existingNode = existingNodes.find(n => n.id === step.node_key);
      
      return {
        id: step.node_key,
        type: 'taskNode',
        position: existingNode?.position || { x: 250 + (index * 150), y: 200 + (index * 50) },
        data: {
          label: step.node_key,
          taskType: step.type,
          params: step.params,
          taskTypes,
        },
      };
    });
  };

  // Convert edges to React Flow edges
  const convertToReactFlowEdges = (edges: Edge[]): FlowEdge[] => {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.from_node_key,
      target: edge.to_node_key,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));
  };

  const [nodes, setNodes, onNodesStateChange] = useNodesState(
    convertStepsToNodes(initialSteps, [])
  );
  const [edges, setEdges, onEdgesStateChange] = useEdgesState(
    convertToReactFlowEdges(initialEdges)
  );

  // Sincronizar con cambios externos (undo/redo y optimizaciones de IA)
  useEffect(() => {
    const newNodes = convertStepsToNodes(initialSteps, nodes);
    // Comparar nodos completos (IDs y datos) para detectar cambios en params
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(newNodes);
    if (nodesChanged) {
      console.log('[WorkflowCanvas] Nodes changed, updating canvas');
      isExternalUpdate.current = true;
      setNodes(newNodes);
    }
  }, [initialSteps]);

  useEffect(() => {
    const newEdges = convertToReactFlowEdges(initialEdges);
    // Solo actualizar si hay cambios reales
    if (JSON.stringify(edges.map(e => e.id).sort()) !== JSON.stringify(newEdges.map(e => e.id).sort())) {
      isExternalUpdate.current = true;
      setEdges(newEdges);
    }
  }, [initialEdges]);

  // Manejar nuevas conexiones entre nodos
  const onConnect: OnConnect = useCallback(
    (params) => {
      if (!params.source || !params.target) return;
      
      const newEdge: FlowEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const isExternalUpdate = React.useRef(false);

  useEffect(() => {
    if (onNodesChange && nodes.length > 0 && !isExternalUpdate.current) {
      const timer = setTimeout(() => {
        const steps = nodes.map((node) => ({
          node_key: node.id,
          type: node.data.taskType,
          params: node.data.params || {},
        }));
        onNodesChange(steps);
      }, 300);
      return () => clearTimeout(timer);
    }
    isExternalUpdate.current = false;
  }, [nodes, onNodesChange]);

  useEffect(() => {
    if (onEdgesChange && edges.length >= 0 && !isExternalUpdate.current) {
      const timer = setTimeout(() => {
        const workflowEdges = edges.map((edge) => ({
          id: edge.id,
          from_node_key: edge.source,
          to_node_key: edge.target,
        }));
        onEdgesChange(workflowEdges);
      }, 300);
      return () => clearTimeout(timer);
    }
    isExternalUpdate.current = false;
  }, [edges, onEdgesChange]);


  const addNode = () => {
    const newNodeId = `node_${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'taskNode',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 300,
      },
      data: {
        label: newNodeId,
        taskType: taskTypes[0]?.type || '',
        params: {},
        taskTypes,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  };

  return (
    <div className="w-full h-[600px] bg-[#1a1a1a] rounded-xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesStateChange}
        onEdgesChange={onEdgesStateChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView={false}
        attributionPosition="bottom-left"
        className="bg-[#1a1a1a]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#0891b2"
          className="opacity-20"
        />
        <Controls className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg" />
        <MiniMap
          className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg"
          nodeColor={(node) => {
            if (node.selected) return '#06b6d4';
            return '#6366f1';
          }}
        />
        <Panel position="top-left" className="flex gap-2">
          <button
            type="button"
            onClick={addNode}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Nodo
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/20 font-medium text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </Panel>
        <Panel position="top-right" className="flex flex-col gap-2">
          {/* Botones Undo/Redo */}
          <div className="flex items-center gap-1 border border-cyan-500/20 rounded-lg p-1 bg-gray-900/90 backdrop-blur-sm">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              type="button"
              title="Deshacer (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="text-sm font-medium">Deshacer</span>
            </button>
            <div className="w-px h-6 bg-cyan-500/20"></div>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              type="button"
              title="Rehacer (Ctrl+Shift+Z o Ctrl+Y)"
            >
              <span className="text-sm font-medium">Rehacer</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          {/* Instrucciones */}
          <div className="bg-gray-900/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-4 py-2">
            <div className="text-cyan-100 text-sm">
              <div className="font-semibold text-cyan-400">Controles:</div>
              <div className="text-xs text-gray-300 mt-1">
                • Click para seleccionar<br/>
                • Arrastra para mover<br/>
                • Conecta los puntos para crear flujos<br/>
                • Scroll para zoom
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
