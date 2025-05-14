"use client"
import React, { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
    Controls,
    Background,
    addEdge,
    Edge as ReactFlowEdge,
    Connection,
    NodeChange,
    EdgeChange,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getFlow } from "../lib/api";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { NodeTypeDefinition } from '@/lib/nodeTypes';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconRenderer } from "@/lib/IconRenderer";
import { LiaBrainSolid } from "react-icons/lia";
import { FaMemory } from "react-icons/fa";
import { FiTool } from "react-icons/fi";
import { JsonEditor } from './JsonEditor';
import { NodeActionButtons } from './NodeActionButtons';
import { NodeProvider } from '../contexts/NodeContext';
import { EditNodeDialog } from './EditNodeDialog';
import { NodeSelectionDrawer, NodeSelectionDrawerRef } from './NodeSelectionDrawer';
import { Node, Edge } from "@/types/flow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodeContextMenu } from './NodeContextMenu';
import { PlayButton } from './PlayButton';
import { createNode, updateNode, deleteNode, duplicateNode } from '@/lib/nodeOperations';

// Add styles for edge hover effect
const edgeStyles = `
  .react-flow__edge:hover .edge-delete-label {
    opacity: 1 !important;
  }
  .react-flow__edge:hover .edge-delete-label + .react-flow__edge-labelbg {
    opacity: 0.8 !important;
  }
`;

interface NodeConfig {
  // WhatsApp config
  to?: string;
  message?: string;
  template?: string;
  phone?: string;
  
  // OpenAI/Assistant config
  model?: string;
  temperature?: number;
  prompt?: string;
  memoryType?: string;
  maxTokens?: number;
  agentName?: string;
  agentDescription?: string;
  capabilities?: string[];
  toolName?: string;
  toolDescription?: string;
  parameters?: Record<string, unknown>;
  agentId?: string;
  input?: string;
  
  // Internal config
  duration?: number;
  unit?: 'seconds' | 'minutes' | 'hours';
  condition?: string;
}

interface FlowData {
  data: {
    id: number;
    attributes: {
      name: string;
      status: string;
      data: {
        nodes: Node[];
        edges: ReactFlowEdge[];
      } | null;
    };
  };
  meta: unknown;
}

interface FlowEditorProps {
  flowId: string;
  initialData?: {
    nodes: Node[];
    edges: Edge[];
  };
  onSave?: (data: { nodes: Node[]; edges: Edge[] }) => Promise<void>;
}

const nodeTypes = {
  trigger: ({ data }: NodeProps) => {
    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex flex-col items-center justify-center
            rounded-full
            border-2
            w-36 h-36
            relative
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            ${data.isActive ? 'animate-pulse' : ''}
            ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          `}
          style={{ 
            minWidth: 96, 
            minHeight: 96,
            backgroundColor: data.color || '#3B82F6',
            borderColor: data.color || '#3B82F6',
            animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        >
          <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
              style={{ 
                borderColor: data.color || '#3B82F6',
              }}
            />
            <Handle
              type="source"
              position={Position.Right}
              className="absolute inset-0 opacity-0"
            />
          </div>

          <div className="flex items-center justify-center w-11/12 h-11/12 rounded-full mb-2">
            <IconRenderer iconName={data.icon ?? ''} />
          </div>

          <NodeActionButtons data={data} type="trigger" />
        </div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize">{data.name}</div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
        {data.label === 'Início' && data.config?.condition && (
          <div className="text-xs text-gray-600 text-center px-1 mt-1 max-w-[200px] break-words">
            {data.config.condition}
          </div>
        )}
      </div>
    );
  },
  action: ({ data }: NodeProps) => {
    const isEndNode = data.label === 'Fim';
    const isModelNode = data.label === 'Modelo';
    const isMemoryNode = data.label === 'Memória';
    const isToolNode = data.label === 'Ferramenta';
    const isSpecialNode = isModelNode || isMemoryNode || isToolNode;

    // Design especial para Criar Agente
    if (data.name === 'openAi' && data.label === 'Criar Agente') {
      return (
        <div className="flex flex-col items-center group">
          <div
            className={`
              flex flex-col items-center justify-center
              border-2 
              relative
              bg-white
              p-3
              rounded-xl
              h-auto
              backdrop-blur-sm
              transition-all duration-300
              hover:shadow-2xl
              hover:-translate-y-1
              shadow-[0_8px_30px_rgba(0,0,0,0.12)]
              ${data.isActive ? 'animate-pulse' : ''}
              ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
            `}
            style={{ 
              borderColor: data.color || '#3B82F6',
              backgroundColor: `${data.color}08`,
              boxShadow: `0 4px 20px ${data.color}20`,
              animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}
          >
            <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                style={{ 
                  borderColor: data.color || '#3B82F6',
                }}
              />
              <Handle
                type="target"
                position={Position.Left}
                className="absolute inset-0 opacity-0"
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md" 
                style={{ 
                  backgroundColor: data.color || '#3B82F6',
                  boxShadow: `0 4px 12px ${data.color}40`
                }}>
                  <div className=" rounded-lg p-1" style={{ backgroundColor: data.color || '#EAB308' }}>

<IconRenderer iconName={data.icon ?? ''} className="text-4xl text-white" />
  </div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-bold" style={{ color: data.color || '#3B82F6' }}>{data.label}</div>
                <div className="text-sm text-gray-500">Assistente Virtual</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1">
              <div className="flex flex-col items-center relative w-20">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#3B82F6',
                  }}>
                  <LiaBrainSolid color="#3B82F6" />
                </div>
                <div className="text-xs mt-2 font-medium text-center" style={{ color: data.color || '#3B82F6' }}>Modelo</div>
                <Handle
                  type="target"
                  position={Position.Bottom}
                  id="model"
                  className="absolute bottom-[-4px]"
                  style={{ bottom: '-20px', left: '50%' }}
                />
              </div>
              <div className="flex flex-col items-center relative w-20">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#3B82F6',
                  }}>
                  <FaMemory color="#3B82F6" />
                </div>
                <div className="text-xs mt-2 font-medium text-center" style={{ color: data.color || '#3B82F6' }}>Memória</div>
                <Handle
                  type="target"
                  position={Position.Bottom}
                  id="memory"
                  className="absolute bottom-[-4px]"
                  style={{ bottom: '-20px', left: '50%' }}
                />
              </div>
              <div className="flex flex-col items-center relative w-20">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#3B82F6',
                  }}>
                  <FiTool color="#3B82F6" />
                </div>
                <div className="text-xs mt-2 font-medium text-center" style={{ color: data.color || '#3B82F6' }}>Ferramenta</div>
                <Handle
                  type="target"
                  position={Position.Bottom}
                  id="tool"
                  className="absolute bottom-[-4px]"
                  style={{ bottom: '-20px', left: '50%' }}
                />
              </div>
            </div>
            
            <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                style={{ 
                  borderColor: data.color || '#3B82F6',
                }}
              />
              <Handle
                type="source"
                position={Position.Right}
                className="absolute inset-0 opacity-0"
              />
            </div>

            <NodeActionButtons data={data} type="action" />
          </div>
        </div>
      );
    }

    // Design especial para Modelo, Memória e Ferramenta
    if (isSpecialNode) {
      return (
        <div className="flex flex-col items-center group">
          <div
            className={`
              flex flex-col items-center justify-center
              rounded-full
              border-2
              w-32 h-32
              relative
              transition-all duration-300
              hover:shadow-2xl
              hover:-translate-y-1
              shadow-[0_8px_30px_rgba(0,0,0,0.12)]
              ${data.isActive ? 'animate-pulse' : ''}
              ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
            `}
            style={{ 
              minWidth: 96, 
              minHeight: 96,
              backgroundColor: data.color || '#3B82F6',
              borderColor: data.color || '#3B82F6',
              animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}
          >
            <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 w-5 h-5 z-10">
              <div 
          
                className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                style={{ 
                  borderColor: data.color || '#3B82F6',
                }}
              >
              </div>
              <Handle
                type="source"
                position={Position.Top}
                className="absolute inset-0 opacity-0"
              />
            </div>

            <div className="flex items-center justify-center w-11/12 h-11/12 rounded-full mb-2">
              <IconRenderer className="text-7xl text-white" iconName={data.icon ?? ''} />
            </div>

            <NodeActionButtons data={data} type="action" />
          </div>
          <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize">{data.name}</div>
          <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center group">
        <div
          className={`
            flex flex-col items-center justify-center
            rounded-full
            border-2
            w-36 h-36
            relative
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            ${data.isActive ? 'animate-pulse' : ''}
            ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          `}
          style={{ 
            minWidth: 96, 
            minHeight: 96,
            backgroundColor: data.color || '#3B82F6',
            borderColor: data.color || '#3B82F6',
            animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        >
          <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
              style={{ 
                borderColor: data.color || '#25D366',
              }}
            />
            <Handle
              type="target"
              position={Position.Left}
              className="absolute inset-0 opacity-0"
            />
          </div>

          <div className="flex items-center justify-center w-11/12 h-11/12 rounded-full mb-2">
            <IconRenderer iconName={data.icon ?? ''} />
          </div>
          
          {!isEndNode && (
            <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                style={{ 
                  borderColor: data.color || '#25D366',
                }}
              />
              <Handle
                type="source"
                position={Position.Right}
                className="absolute inset-0 opacity-0"
              />
            </div>
          )}

          <NodeActionButtons data={data} type="action" />
        </div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize">{data.name}</div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
      </div>
    );
  },
  condition: ({ data }: NodeProps) => {
    return (
      <div className="flex flex-col items-center group">
        {/* Componentizar */}
        <div
          className={`
            flex flex-col items-center justify-center
            relative
            bg-white
            p-2
            gap-1
            rounded-xl
            min-w-[200px]
            backdrop-blur-sm
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            border-2
            ${data.isActive ? 'animate-pulse' : ''}
            ${data.isExecuting ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
          `}
          style={{ 
            borderColor: data.color || '#EAB308',
            backgroundColor: `${data.color}08`,
            boxShadow: `0 4px 20px ${data.color}20`,
            animation: data.isActive ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        >
          <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
              style={{ 
                borderColor: data.color || '#EAB308',
              }}
            />
            <Handle
              type="target"
              position={Position.Left}
              className="absolute inset-0 opacity-0"
            />
          </div>

          <div className="flex items-center gap-4  ">
            <div className=" rounded-lg p-1" style={{ backgroundColor: data.color || '#EAB308' }}>

          <IconRenderer iconName={data.icon ?? ''} className="text-4xl text-white" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold" style={{ color: data.color || '#EAB308' }}>{data.label}</div>
              <div className="text-sm text-gray-500">Condição</div>
            </div>
          </div>

          <div className="flex mt-2 items-center justify-between gap-2 border-t border-gray-100">
            <div className="flex flex-col items-center relative w-10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#25D366',
                  }}>
                  <div className="text-green-500 text-xs">✓</div>
                </div>
              
             
              <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="absolute  "
                style={{ bottom: '-20px', right: '60px',opacity:0 }}
              />
            </div>
            <div className="flex flex-col items-center relative w-10">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#25D366',
                  }}>
                  <div className="text-red-500 text-xs">✕</div>
                </div>
              <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="absolute bottom-[-4px] "
                style={{ bottom: '-20px', right: '60px',opacity:0 }}
              />
            </div>
          </div>

          <NodeActionButtons data={data} type="condition" />
        </div>
      </div>
    );
  },
};

export default function FlowEditor({ flowId, initialData, onSave }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newNodeConfig, setNewNodeConfig] = useState<NodeConfig>({});
  const [tempNode, setTempNode] = useState<Node | null>(null);
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const drawerRef = useRef<NodeSelectionDrawerRef>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (onSave) {
        onSave({ nodes, edges });
        setLastSaved(new Date());
      }
    }, 1000); // 1 second delay
  }, [nodes, edges, onSave]);

  // Modified node change handler
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    debouncedSave();
  }, [onNodesChange, debouncedSave]);

  // Modified edge change handler
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    debouncedSave();
  }, [onEdgesChange, debouncedSave]);

  // Modified connect handler
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle || null,
      targetHandle: params.targetHandle || null,
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#64748b',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#64748b',
      },
      label: '×',
      labelStyle: { 
        fill: '#ef4444',
        fontWeight: 700,
        fontSize: 20,
        cursor: 'pointer',
        opacity: 0,
      },
      labelBgStyle: { 
        fill: '#e5e7eb',
        fillOpacity: 0.8,
        opacity: 0,
      },
      labelBgPadding: [4, 4],
      labelBgBorderRadius: 4,
    };
    setEdges((eds) => addEdge(newEdge, eds));
    debouncedSave();
  }, [debouncedSave]);

  // Add edge mouse enter handler
  const onEdgeMouseEnter = useCallback((event: React.MouseEvent, edge: Edge) => {
    setEdges((eds) => eds.map((e) => {
      if (e.id === edge.id) {
        return {
          ...e,
          labelStyle: {
            ...e.labelStyle,
            opacity: 1,
          },
          labelBgStyle: {
            ...e.labelBgStyle,
            opacity: 0.8,
          },
        };
      }
      return e;
    }));
  }, []);

  // Add edge mouse leave handler
  const onEdgeMouseLeave = useCallback((event: React.MouseEvent, edge: Edge) => {
    setEdges((eds) => eds.map((e) => {
      if (e.id === edge.id) {
        return {
          ...e,
          labelStyle: {
            ...e.labelStyle,
            opacity: 0,
          },
          labelBgStyle: {
            ...e.labelBgStyle,
            opacity: 0,
          },
        };
      }
      return e;
    }));
  }, []);

  // Single node deletion handler
  const handleNodeDelete = async (nodeId: string) => {
    try {
      // Primeiro atualiza o estado local
      const result = deleteNode(nodes, edges, nodeId);
      
      // Limpa o nó selecionado e fecha o diálogo
      setSelectedNode(null);
      setEditingNode(null);
      setIsEditDialogOpen(false);
      
      // Salva as mudanças na API
      if (onSave) {
        await onSave({ nodes: result.nodes, edges: result.edges });
        setLastSaved(new Date());
        
        // Atualiza o estado local após a confirmação da API
        setNodes(result.nodes);
        setEdges(result.edges);
      }
    } catch (error) {
      console.error('Error deleting node:', error);
      // Reverte as mudanças locais em caso de erro
      setNodes(nodes);
      setEdges(edges);
    }
  };

  const handleDeleteEdge = (event: React.MouseEvent, edge: ReactFlowEdge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    debouncedSave();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadFlow = async () => {
      try {
        setLoading(true);
        const response = await getFlow(flowId);
        
        const flowData: FlowData = response;
        console.log('Flow data:', flowData);

        if (!flowData.data?.attributes) {
          throw new Error('No flow attributes found in response');
        }

        // Initialize with empty arrays if no data exists
        if (!flowData.data.attributes.data) {
          setNodes([]);
          setEdges([]);
          return;
        }

        const { nodes: flowNodes, edges: flowEdges } = flowData.data.attributes.data;
        
        // Only load data if we don't have any nodes yet
        if (nodes.length === 0) {
          setNodes(flowNodes || []);
          setEdges(flowEdges || []);
        }
        
        setFlowData(flowData);
      } catch (err) {
        console.error('Error loading flow:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flow');
      } finally {
        setLoading(false);
      }
    };

    loadFlow();
  }, [flowId]);

  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes || []);
      setEdges(initialData.edges || []);
    }
  }, [initialData]);

  const handleNodeClick = useCallback((event: React.MouseEvent | null, node: Node) => {
    setSelectedNode(node);
    setEditingNode(node);
    setIsEditDialogOpen(true);
  }, []);

  const handleNodeEdit = useCallback((node: Node) => {
    setSelectedNode(node);
    setEditingNode(node);
  }, []);

  const handleNodeTypeSelect = (actionDefinition: NodeTypeDefinition) => {
    const actionTypes: Record<string, string> = {
      "Enviar Mensagem": "whatsapp",
      "Receber Mensagem": "whatsapp",
      "Modelo": "openAi",
      "Memória": "openAi",
      "Ferramenta": "openAi",
      "Criar Agente": "openAi",
      "Executar Agente": "openAi",
      "Atraso": "internal"
    };

    const newNode: Node = {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type,
      data: {
        label: actionDefinition.name,
        icon: actionDefinition.icon ?? '',
        name: actionTypes[actionDefinition.name] ?? 'internal',
        color: actionDefinition.color,
        config: actionDefinition.config || {},
      },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };

    // Se for um nó interno que não é delay, adiciona diretamente sem mostrar o diálogo
    if (actionDefinition.name !== 'Atraso' && actionDefinition.name !== 'Início') {
      setNodes((nds) => [...nds, newNode]);
      return;
    }

    // Para o nó de delay e início, sempre mostra o diálogo de configuração
    setTempNode(newNode);
    setNewNodeConfig(actionDefinition.config || {});
    setIsConfigDialogOpen(true);
  };

  const handleConfigSubmit = () => {
    if (!tempNode) return;

    const finalNode = {
      ...tempNode,
      data: {
        ...tempNode.data,
        config: newNodeConfig,
      },
    };

    setNodes((nds) => [...nds, finalNode]);
    setIsConfigDialogOpen(false);
    setTempNode(null);
    setNewNodeConfig({});
  };

  const renderConfigFields = () => {
    if (!tempNode) return null;

    // Primeiro verifica o tipo base (whatsapp, openAi ou internal)
    switch (tempNode.data.name) {
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Número do WhatsApp</Label>
              <Input
                id="to"
                placeholder="+55 (00) 00000-0000"
                value={newNodeConfig.to || ''}
                onChange={(e) => setNewNodeConfig({ ...newNodeConfig, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem"
                value={newNodeConfig.message || ''}
                onChange={(e) => setNewNodeConfig({ ...newNodeConfig, message: e.target.value })}
              />
            </div>
          </div>
        );
      case 'openAi':
        // Depois verifica o nome específico da ação para mostrar campos diferentes
        switch (tempNode.data.label) {
          case 'Modelo':
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Select
                    value={newNodeConfig.model || 'gpt-3.5-turbo'}
                    onValueChange={(value) => setNewNodeConfig({ ...newNodeConfig, model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Digite o prompt"
                    value={newNodeConfig.prompt || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, prompt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={newNodeConfig.temperature || 0.7}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            );
          case 'Memória':
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memoryType">Tipo de Memória</Label>
                  <Select
                    value={newNodeConfig.memoryType || 'conversation'}
                    onValueChange={(value) => setNewNodeConfig({ ...newNodeConfig, memoryType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversation">Conversa</SelectItem>
                      <SelectItem value="summary">Resumo</SelectItem>
                      <SelectItem value="vector">Vetorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Máximo de Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="1"
                    value={newNodeConfig.maxTokens || 1000}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, maxTokens: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            );
          case 'Criar Agente':
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentName">Nome do Agente</Label>
                  <Input
                    id="agentName"
                    placeholder="Digite o nome do agente"
                    value={newNodeConfig.agentName || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, agentName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentDescription">Descrição</Label>
                  <Textarea
                    id="agentDescription"
                    placeholder="Descreva o propósito do agente"
                    value={newNodeConfig.agentDescription || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, agentDescription: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capabilities">Capacidades</Label>
                  <Textarea
                    id="capabilities"
                    placeholder="Liste as capacidades do agente (uma por linha)"
                    value={newNodeConfig.capabilities?.join('\n') || ''}
                    onChange={(e) => setNewNodeConfig({ 
                      ...newNodeConfig, 
                      capabilities: e.target.value.split('\n').filter(v => v.trim()) 
                    })}
                  />
                </div>
              </div>
            );
          case 'Ferramenta':
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="toolName">Nome da Ferramenta</Label>
                  <Input
                    id="toolName"
                    placeholder="Digite o nome da ferramenta"
                    value={newNodeConfig.toolName || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, toolName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toolDescription">Descrição</Label>
                  <Textarea
                    id="toolDescription"
                    placeholder="Descreva a funcionalidade da ferramenta"
                    value={newNodeConfig.toolDescription || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, toolDescription: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parameters">Parâmetros (JSON)</Label>
                  <Textarea
                    id="parameters"
                    placeholder='{"param1": "valor1", "param2": "valor2"}'
                    value={typeof newNodeConfig.parameters === 'string' ? newNodeConfig.parameters : JSON.stringify(newNodeConfig.parameters || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setNewNodeConfig({ ...newNodeConfig, parameters: parsed as Record<string, unknown> });
                      } catch {
                        // If parsing fails, store as empty object
                        setNewNodeConfig({ ...newNodeConfig, parameters: {} });
                      }
                    }}
                  />
                </div>
              </div>
            );
          default:
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Configuração</Label>
                  <div className="text-sm text-muted-foreground">
                    Tipo de ação OpenAI não reconhecido: {tempNode.data.label}
                  </div>
                </div>
              </div>
            );
        }
      case 'internal':
        // Verifica o nome específico da ação interna
        if (tempNode.data.label === 'Atraso') {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  placeholder="Digite a duração"
                  value={newNodeConfig.duration || 0}
                  onChange={(e) => setNewNodeConfig({ 
                    ...newNodeConfig, 
                    duration: parseInt(e.target.value) || 0 
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Select
                  value={newNodeConfig.unit || 'seconds'}
                  onValueChange={(value: 'seconds' | 'minutes' | 'hours') => setNewNodeConfig({ ...newNodeConfig, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Segundos</SelectItem>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        } else if (tempNode.data.label === 'Início') {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condição de Início</Label>
                <Textarea
                  id="condition"
                  placeholder="Digite a condição de início (opcional)"
                  value={newNodeConfig.condition || ''}
                  onChange={(e) => setNewNodeConfig({ 
                    ...newNodeConfig, 
                    condition: e.target.value 
                  })}
                />
              </div>
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  const handleCreateFlowFromJson = useCallback((nodes: Node[], edges: Edge[]) => {
    setNodes(nodes);
    setEdges(edges);
    debouncedSave();
  }, [debouncedSave]);

  const handleExecuteFlow = async () => {
    try {
      setIsExecuting(true);
      const startNode = nodes.find(node => node.type === 'trigger');
      if (!startNode) return;

      // Função para processar um nó
      const processNode = async (nodeId: string) => {
        // Ativa o nó atual
        setActiveNodeId(nodeId);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula processamento

        // Encontra as arestas que saem deste nó
        const outgoingEdges = edges.filter(edge => edge.source === nodeId);
        
        // Processa os próximos nós em sequência
        for (const edge of outgoingEdges) {
          // Ativa a aresta atual
          setEdges(eds => eds.map(e => ({
            ...e,
            style: {
              ...e.style,
              stroke: e.id === edge.id ? '#3B82F6' : '#64748b',
              strokeWidth: e.id === edge.id ? 3 : 2,
            }
          })));

          const nextNode = nodes.find(n => n.id === edge.target);
          if (nextNode) {
            await processNode(nextNode.id);
          }

          // Desativa a aresta após processar
          setEdges(eds => eds.map(e => ({
            ...e,
            style: {
              ...e.style,
              stroke: '#64748b',
              strokeWidth: 2,
            }
          })));
        }
      };

      await processNode(startNode.id);
    } catch (error) {
      console.error('Error executing flow:', error);
    } finally {
      setActiveNodeId(null);
      setIsExecuting(false);
      // Reseta todas as arestas
      setEdges(eds => eds.map(e => ({
        ...e,
        style: {
          ...e.style,
          stroke: '#64748b',
          strokeWidth: 2,
        }
      })));
    }
  };

  // Modifica os nós para incluir a animação
  const nodesWithAnimation = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      isActive: activeNodeId === node.id,
      isExecuting
    }
  }));



  const handleNodeUpdate = (nodeId: string, updates: Partial<Node>) => {
    const result = updateNode(nodes, edges, nodeId, updates);
    setNodes(result.nodes);
    setEdges(result.edges);
    debouncedSave();
  };



  if (loading) {
    return <div className="flex items-center justify-center h-[80vh]">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-[80vh] text-red-500">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <style>{edgeStyles}</style>
      <div className="flex justify-between items-center mb-4 font-semibold">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{flowData?.data?.attributes?.name || 'Novo Flow'}</h2>
          <NodeSelectionDrawer ref={drawerRef} onNodeSelect={handleNodeTypeSelect} />
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-sm text-muted-foreground">
              Último salvamento: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <PlayButton 
            onPlay={handleExecuteFlow} 
            onExecutionStateChange={setIsExecuting}
          />
          <JsonEditor 
            flowData={selectedNode} 
            onSave={(json) => {
              if (selectedNode) {
                const updatedNodes = nodes.map((node) => {
                  if (node.id === selectedNode.id) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        config: JSON.parse(json),
                      },
                    };
                  }
                  return node;
                });
                setNodes(updatedNodes);
                debouncedSave();
              }
            }}
            onCreateFlow={handleCreateFlowFromJson}
            completeFlow={{ nodes, edges }}
          />
        </div>
      </div>

      <div className="flex-1 border rounded-lg relative">
        <NodeContextMenu onAddNode={() => drawerRef.current?.open()}>
          <NodeProvider 
            onEdit={handleNodeEdit} 
            onDelete={handleNodeDelete}
          >
            <div className="absolute top-4 right-4 z-10">
              <Button
                onClick={() => drawerRef.current?.open()}
                size="icon"
                className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </Button>
            </div>
            <ReactFlow
              nodes={nodesWithAnimation}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleDeleteEdge}
              onEdgeMouseEnter={onEdgeMouseEnter}
              onEdgeMouseLeave={onEdgeMouseLeave}
              nodeTypes={nodeTypes}
              fitView
              className="cursor-crosshair bg-gray-50 rounded-2xl"
              style={{ cursor: 'crosshair' }}
            >
              <Background color="#94a3b8" gap={16} size={1} />
              <Controls />
            </ReactFlow>
          </NodeProvider>
        </NodeContextMenu>
      </div>

      <EditNodeDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedNode(null);
            setEditingNode(null);
          }
        }}
        editingNode={editingNode}
        onSave={(node) => {
          handleNodeUpdate(node.id, node);
          setSelectedNode(null);
          setEditingNode(null);
          setIsEditDialogOpen(false);
        }}
        onDelete={() => selectedNode && handleNodeDelete(selectedNode.id)}
      />

      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Nó</DialogTitle>
          </DialogHeader>
          {renderConfigFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfigSubmit}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
