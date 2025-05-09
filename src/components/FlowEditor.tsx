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
import { nodeTypes as nodeTypeDefinitions, getNodeCategories, NodeTypeDefinition } from '@/lib/nodeTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Node, Edge } from "@/types/flow";
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
          `}
          style={{ 
            minWidth: 96, 
            minHeight: 96,
            backgroundColor: data.color || '#3B82F6',
            borderColor: data.color || '#3B82F6'
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
    if (data.name === 'openAi') {
      // Se for Modelo, Memória ou Ferramenta, mostra apenas um handle para cima
      if (data.label && ['Modelo', 'Memória', 'Ferramenta'].includes(data.label)) {
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
              `}
              style={{ 
                minWidth: 96, 
                minHeight: 96,
                backgroundColor: data.color || '#3B82F6',
                borderColor: data.color || '#3B82F6'
              }}
            >
              <div className="absolute top-[-35px] left-1/2 -translate-x-1/2 w-8 h-8 z-10">
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#3B82F6',
                  }}
                >
                  <IconRenderer iconName={data.icon ?? ''} />
                </div>
                <Handle
                  type="source"
                  position={Position.Top}
                  className="absolute inset-0 opacity-0"
                />
              </div>

              <div className="flex items-center justify-center w-11/12 h-11/12 rounded-full mb-2">
                <IconRenderer iconName={data.icon ?? ''} />
              </div>

              <NodeActionButtons data={data} type="action" />
            </div>
            <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize">{data.name}</div>
            <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
          </div>
        );
      }

      // Design especial para Criar Agente
      if (data.label === 'Criar Agente') {
        return (
          <div className="flex flex-col items-center group">
            <div
              className={`
                flex flex-col items-center justify-center
                border-2 
                relative
                bg-white
                p-6
                rounded-xl
                min-w-[280px]
                backdrop-blur-sm
                transition-all duration-300
                hover:shadow-2xl
                hover:-translate-y-1
                shadow-[0_8px_30px_rgba(0,0,0,0.12)]
              `}
              style={{ 
                borderColor: data.color || '#3B82F6',
                backgroundColor: `${data.color}08`,
                boxShadow: `0 4px 20px ${data.color}20`
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
                  <IconRenderer iconName={data.icon ?? ''} />
                </div>
                <div className="flex flex-col">
                  <div className="text-lg font-bold" style={{ color: data.color || '#3B82F6' }}>{data.label}</div>
                  <div className="text-sm text-gray-500">Assistente Virtual</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6 mt-2 px-2 pt-4 border-t border-gray-100">
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
                    style={{ bottom: '-30px', left: '50%' }}
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
                    style={{ bottom: '-30px', left: '50%' }}
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
                    style={{ bottom: '-30px', left: '50%' }}
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

      // Design padrão para outros nós OpenAI
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
            `}
            style={{ 
              minWidth: 96, 
              minHeight: 96,
              backgroundColor: data.color || '#3B82F6',
              borderColor: data.color || '#3B82F6'
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

            <NodeActionButtons data={data} type="action" />
          </div>
          <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize">{data.name}</div>
          <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
        </div>
      );
    }

    // Design para nós WhatsApp
    if (data.name === 'whatsapp') {
      return (
        <div className="flex flex-col items-center group">
          <div
            className={`
              flex flex-col items-center justify-center
              relative
              bg-white
              p-6
              rounded-xl
              min-w-[280px]
              backdrop-blur-sm
              transition-all duration-300
              hover:shadow-2xl
              hover:-translate-y-1
              shadow-[0_8px_30px_rgba(0,0,0,0.12)]
              border-2
            `}
            style={{ 
              borderColor: data.color || '#25D366',
              backgroundColor: `${data.color}08`,
              boxShadow: `0 4px 20px ${data.color}20`
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

            {/* titulo */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-md" 
                style={{ 
                  backgroundColor: data.color || '#25D366',
                  boxShadow: `0 4px 12px ${data.color}40`
                }}>
                <IconRenderer iconName={data.icon ?? ''} className="text-4xl" />
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-bold" style={{ color: data.color || '#25D366' }}>{data.label}</div>
                <div className="text-sm text-gray-500">WhatsApp</div>
              </div>
            </div>

            {/* nos */}
            <div className="flex items-center justify-between gap-2 border-t border-gray-100">
              <div className="flex flex-col items-center relative w-20">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#25D366',
                  }}>
                  <div className="text-green-500 text-xs">✓</div>
                </div>
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id="success"
                  className="absolute bottom-[-4px] opacity-0"
                  style={{ bottom: '-30px', left: '50%' }}
                />
              </div>
              <div className="flex flex-col items-center relative w-20">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border hover:scale-110 bg-white"
                  style={{ 
                    borderColor: data.color || '#25D366',
                  }}>
                  <div className="text-red-500 text-xs">✕</div>
                </div>
                <Handle
                  type="source"
                  position={Position.Bottom}
                  id="error"
                  className="absolute bottom-[-4px] opacity-0"
                  style={{ bottom: '-30px', left: '50%' }}
                />
              </div>
            </div>

            <NodeActionButtons data={data} type="action" />
          </div>
        </div>
      );
    }

    // Design para nós internos (incluindo delay)
    if (data.name === 'internal') {
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
            `}
            style={{ 
              minWidth: 96, 
              minHeight: 96,
              backgroundColor: data.color || '#3B82F6',
              borderColor: data.color || '#3B82F6'
            }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              Action
            </div>
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

            <NodeActionButtons data={data} type="action" />
          </div>
          <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize">{data.name}</div>
          <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
        </div>
      );
    }

    return null;
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
            p-5
            rounded-xl
            min-w-[200px]
            backdrop-blur-sm
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
            border-2
          `}
          style={{ 
            borderColor: data.color || '#EAB308',
            backgroundColor: `${data.color}08`,
            boxShadow: `0 4px 20px ${data.color}20`
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

          <div className="flex items-center gap-4 ">
          <IconRenderer iconName={data.icon ?? ''} className="text-4xl" />
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
                style={{ bottom: '-30px', right: '60px',opacity:0 }}
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
                style={{ bottom: '-30px', right: '60px',opacity:0 }}
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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newNodeConfig, setNewNodeConfig] = useState<NodeConfig>({});
  const [tempNode, setTempNode] = useState<Node | null>(null);
  const [flowData, setFlowData] = useState<FlowData | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const categories = getNodeCategories();

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
      },
      labelBgStyle: { 
        fill: '#ffffff',
        fillOpacity: 0.8,
      },
      labelBgPadding: [4, 4],
      labelBgBorderRadius: 4,
    };
    setEdges((eds) => addEdge(newEdge, eds));
    debouncedSave();
  }, [debouncedSave]);


  // Modified delete handlers
  const handleDeleteNode = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
    debouncedSave();
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

        if (!flowData.data.attributes.data) {
          // Initialize with empty nodes and edges if data is null
          setNodes([]);
          setEdges([]);
          return;
        }

        const { nodes: flowNodes, edges: flowEdges } = flowData.data.attributes.data;
        console.log('Nodes:', flowNodes);
        console.log('Edges:', flowEdges);

        setNodes(flowNodes || []);
        setEdges(flowEdges || []);
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
    // Não abre o diálogo para nós do tipo condição
    if (node.type === 'condition') {
      return;
    }
    setSelectedNode(node);
    setEditingNode(node);
    setIsEditDialogOpen(true);
  }, []);

  const handleNodeEdit = useCallback((node: Node) => {
    setSelectedNode(node);
    setEditingNode(node);
  }, []);

  const handleAddNode = () => {
    if (!selectedAction || !selectedCategory) return;

    let actionDefinition: NodeTypeDefinition | undefined;

    if (selectedCategory === 'app' && selectedSubcategory) {
      const actionName = selectedAction.split('_').slice(1).join('_');
      actionDefinition = nodeTypeDefinitions.app[selectedSubcategory]?.[actionName];
    } else if (selectedCategory === 'internal') {
      const actionName = selectedAction.split('_').slice(1).join('_');
      actionDefinition = nodeTypeDefinitions.internal[actionName];
    }

    if (!actionDefinition) {
      console.error('Action definition not found:', { selectedCategory, selectedSubcategory, selectedAction });
      return;
    }

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
    if (selectedCategory === 'internal' && actionDefinition.name !== 'Atraso' && actionDefinition.name !== 'Início') {
      setNodes((nds) => [...nds, newNode]);
      setSelectedAction('');
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
    setSelectedAction('');
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

  if (loading) {
    return <div className="flex items-center justify-center h-[80vh]">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-[80vh] text-red-500">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 font-semibold">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{flowData?.data?.attributes?.name || 'Novo Flow'}</h2>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] ">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, category]) => (
                  <SelectItem key={key} value={key} className="font-semibold">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory === 'app' && (
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione um app" />
                </SelectTrigger>
                <SelectContent >
                  {Object.entries(categories.app.subcategories).map(([key, subcategory]) => (
                    <SelectItem key={key} value={key} className="font-semibold">
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory === 'app' && selectedSubcategory
                  ? categories.app.subcategories[selectedSubcategory].actions.map((action: NodeTypeDefinition) => (
                      <SelectItem key={action.id} value={action.id}>
                        {action.name}
                      </SelectItem>
                    ))
                  : categories.internal.actions.map((action: NodeTypeDefinition) => (
                      <SelectItem key={action.id} value={action.id} className="font-semibold">
                        {action.name}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>

            <Button onClick={handleAddNode} disabled={!selectedAction}>
              Adicionar Nó
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-sm text-muted-foreground">
              Último salvamento: {lastSaved.toLocaleTimeString()}
            </div>
          )}
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
        <NodeProvider 
          onEdit={handleNodeEdit} 
          onDelete={(nodeId) => {
            console.log('Deleting node:', nodeId); // Debug log
            setNodes((nds) => {
              console.log('Current nodes:', nds); // Debug log
              return nds.filter((node) => node.id !== nodeId);
            });
            setEdges((eds) => {
              console.log('Current edges:', eds); // Debug log
              return eds.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
              );
            });
            debouncedSave();
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleDeleteEdge}
            nodeTypes={nodeTypes}
            fitView
            className="cursor-crosshair bg-gray-50 rounded-2xl"
            style={{ cursor: 'crosshair' }}
          >
            <Background color="#94a3b8" gap={16} size={1} />
            <Controls />
          </ReactFlow>
        </NodeProvider>
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
          setNodes((nds) => nds.map((n) => {
            if (n.id === node.id) {
              return node;
            }
            return n;
          }));
          setSelectedNode(null);
          setEditingNode(null);
          setIsEditDialogOpen(false);
          debouncedSave();
        }}
        onDelete={handleDeleteNode}
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
