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
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getFlow } from "../lib/api";
import { Button } from './ui/button';
import { NodeTypeDefinition } from '@/lib/nodeTypes';
import { FiTool } from "react-icons/fi";
import { JsonEditor } from './JsonEditor';
import { NodeProvider } from '../contexts/NodeContext';
import { EditNodeDialog } from './EditNodeDialog';
import { NodeSelectionDrawer, NodeSelectionDrawerRef } from './NodeSelectionDrawer';
import { Node, Edge } from "@/types/flow";
import { PlayButton } from './PlayButton';
import { IntegrationDialog } from './IntegrationDialog';
import { ChatAssistant } from './ChatAssistant';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { CommentNode } from './nodes/CommentNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { ApiNode } from './nodes/ApiNode';
import { WebhookNode } from './nodes/WebhookNode';
import InputNode from './nodes/InputNode';
import ErrorNode from './nodes/ErrorNode';
import  FlowEditDrawer  from './FlowEditDrawer';
import { useFlow } from '@/contexts/FlowContext';
import { Pencil } from 'lucide-react';
import { NodeCommandMenu } from './NodeCommandMenu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress"
import { FlowThreadsList } from './FlowThreadsList';
import { List } from 'lucide-react';

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
  comment?: string;
  query?: string;
  endpoint?: string;
  method?: string;
  url?: string;
}

interface FlowData {
  data: {
    id: number;
    attributes: {
      name: string;
      description?: string;
      credentials?: {
        provider?: string;
        appName?: string;
        source?: string;
        webhook?: string;
        apiKey?: string;
      };
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
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  comment: CommentNode,
  database: DatabaseNode,
  api: ApiNode,
  webhook: WebhookNode,
  input: InputNode,
  error: ErrorNode,
};

export default function FlowEditor({ flowId, onSave }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
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
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { handleSaveFlow, handleDeleteFlow, createNode } = useFlow();
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [showCanvasTooltip, setShowCanvasTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [showThreadsList, setShowThreadsList] = useState(false);

  // Efeito para limpar o estado quando o flowId muda
  useEffect(() => {
    // Limpa imediatamente todos os estados
    setNodes([]);
    setEdges([]);
    setFlowData(null);
    setSelectedNode(null);
    setEditingNode(null);
    setError(null);
    setLastSaved(null);
    setIsConfigDialogOpen(false);
    setNewNodeConfig({});
    setTempNode(null);
    setIsEditDialogOpen(false);
    setActiveNodeId(null);
    setIsEditDrawerOpen(false);
    setShowCommandMenu(false);
    setShowCanvasTooltip(false);
    setProgress(0);

    // Limpa qualquer timeout pendente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  }, [flowId, setNodes, setEdges]);

  // Efeito para carregar os dados do novo flow
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
          setFlowData(flowData);
          return;
        }

        const { nodes: flowNodes, edges: flowEdges } = flowData.data.attributes.data;
        
        // Always set nodes and edges from the loaded flow data
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
  }, [flowId, setNodes, setEdges]);

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
      // Remove the node and its connected edges
      const updatedNodes = nodes.filter(node => node.id !== nodeId);
      const updatedEdges = edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
      
      // Atualiza o estado local imediatamente (otimisticamente)
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      
      // Limpa o nó selecionado e fecha o diálogo
      setSelectedNode(null);
      setEditingNode(null);
      setIsEditDialogOpen(false);
      
      // Salva as mudanças na API em background
      if (onSave) {
        onSave({ nodes: updatedNodes, edges: updatedEdges })
          .then(() => {
            setLastSaved(new Date());
          })
          .catch((error) => {
            console.error('Error saving after node deletion:', error);
            // Em caso de erro, reverte as mudanças
            setNodes(nodes);
            setEdges(edges);
          });
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

  const handleNodeClick = useCallback((event: React.MouseEvent | null, node: Node) => {
    setSelectedNode(node);
    setEditingNode(node);
    setIsEditDialogOpen(true);
  }, []);

  const handleNodeEdit = useCallback((node: Node) => {
    setSelectedNode(node);
    setEditingNode(node);
  }, []);

  const handleNodeTypeSelect = useCallback((actionDefinition: NodeTypeDefinition) => {
    // Se já estiver com um diálogo aberto, não abre outro
    if (isConfigDialogOpen) return;

    // Cria o nó usando a função createNode
    const newNode = createNode(actionDefinition);

    // Para todos os nós que precisam de configuração, abre o diálogo
    if (
      actionDefinition.name === 'Atraso' ||
      actionDefinition.name === 'Início' ||
      (actionDefinition.category === 'app' && actionDefinition.type !== 'webhook') ||
      actionDefinition.name === 'Comentário' ||
      actionDefinition.name === 'Banco de Dados'
    ) {
      setTempNode(newNode);
      setNewNodeConfig(actionDefinition.config || {});
      setIsConfigDialogOpen(true);
      return;
    }

    // Para outros nós internos simples, adiciona direto
    setNodes((nds) => [...nds, newNode]);
  }, [isConfigDialogOpen, setNodes, createNode]);

  const handleConfigSubmit = (updatedConfig: Record<string, any>) => {
    if (!tempNode) return;

    // Evita duplo submit/dupla abertura
    if (!isConfigDialogOpen) return;

    const { input, output, ...restConfig } = updatedConfig;

    const finalNode = {
      ...tempNode,
      data: {
        ...tempNode.data,
        input: input || tempNode.data.input,
        output: output || tempNode.data.output,
        config: restConfig || {}
      },
    };

    setNodes((nds) => [...nds, finalNode]);
    setIsConfigDialogOpen(false);
    setTempNode(null);
    setNewNodeConfig({});
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

  const handleNodeUpdate = async (nodeId: string, updates: Partial<Node>) => {
    // Find the existing node to preserve its properties
    const existingNode = nodes.find(node => node.id === nodeId);
    if (!existingNode) return;

    // Create a new array of nodes with the updated node
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        // Extrai e remove credenciais e config do updates.data para evitar duplicação
        const { 
          input, 
          output, 
          credentials, 
          config: newConfig,
          credentials: _credentials, // Remove credenciais do restData
          config: _config, // Remove config do restData
          ...restData 
        } = updates.data || {};
        
        // Remove qualquer aninhamento extra de config ou credentials
        const { credentials: configCredentials, config: nestedConfig, ...configWithoutCredentials } = newConfig || {};
        
        // Mescla o config aninhado se existir
        const finalConfig = nestedConfig ? {
          ...nestedConfig,
          ...configWithoutCredentials
        } : configWithoutCredentials;
        
        // Usa as credenciais do nível raiz se existirem, senão usa as do config
        const finalCredentials = credentials || configCredentials || node.data.credentials;
        
        return {
          ...node, // Keep all original node properties
          ...updates, // Apply updates
          position: node.position, // Explicitly preserve position
          data: {
            ...node.data, // Keep all original data
            input: input || node.data.input, // Preserva input no nível raiz
            output: output || node.data.output, // Preserva output no nível raiz
            credentials: finalCredentials, // Preserva credentials no nível raiz
            config: finalConfig, // Config limpo sem aninhamentos
            ...restData // Aplica outras atualizações de data (sem credenciais/config)
          }
        };
      }
      return node;
    });

    // Update the nodes state directly
    setNodes(updatedNodes);

    // Save immediately instead of using debounce
    try {
      await handleSaveFlow({
        nodes: updatedNodes,
        edges,
        name: flowData?.data?.attributes?.name,
        status: flowData?.data?.attributes?.status,
        description: flowData?.data?.attributes?.description
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving node update:', error);
      // Revert changes if save fails
      setNodes(nodes);
    }
  };

  const handleFlowEdit = async (data: { name: string; description: string; status: string }) => {
    if (!flowData?.data?.attributes) return;
    
    try {
      await handleSaveFlow({
        nodes,
        edges,
        name: data.name,
        status: data.status,
        description: data.description
      });
      
      // Update local state
      setFlowData(prev => {
        if (!prev?.data?.attributes) return null;
        return {
          ...prev,
          data: {
            ...prev.data,
            attributes: {
              ...prev.data.attributes,
              name: data.name,
              status: data.status,
              description: data.description,
              data: {
                ...prev.data.attributes.data,
                nodes,
                edges
              }
            }
          }
        };
      });
    } catch (error) {
      console.error('Error updating flow:', error);
    }
  };

  // Right-click handler for canvas
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowCommandMenu(true);
  };

  // Add mouse move handler
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    // Check if we're over a node or edge
    const target = event.target as HTMLElement;
    const isOverNode = target.closest('.react-flow__node');
    const isOverEdge = target.closest('.react-flow__edge');
    
    if (!isOverNode && !isOverEdge) {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowCanvasTooltip(true);
      }, 1000);
    } else {
      setShowCanvasTooltip(false);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Adiciona efeito para animar o progresso
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            return 0;
          }
          return prevProgress + 10;
        });
      }, 500);

      return () => {
        clearInterval(timer);
        setProgress(0);
      };
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Add back the keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setShowCommandMenu(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add back the canvas tooltip handler
  useEffect(() => {
    if (showCanvasTooltip) {
      const timer = setTimeout(() => {
        setShowCanvasTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCanvasTooltip]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-muted-foreground">
        <Progress value={progress} className="w-[200px] transition-all duration-500" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center h-[80vh] text-red-500">{error}</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditDrawerOpen(true)}
              className="relative"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => drawerRef.current?.open()}
                    className="flex items-center gap-2"
                  >
                    <FiTool className="h-4 w-4" />
                    Adicionar Nó
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique para adicionar um nó, use o botão direito do mouse no canvas ou pressione <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded border">/</kbd></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <NodeSelectionDrawer ref={drawerRef} onNodeSelect={handleNodeTypeSelect} />
          </div>

          <h1 className="text-xl font-semibold absolute left-1/2 -translate-x-1/2">
            {flowData?.data?.attributes?.name || 'Flow Editor'}
          </h1>

          <div className="flex items-center gap-2">
            {lastSaved && (
              <div className="text-sm text-muted-foreground">
                Último salvamento: {lastSaved.toLocaleTimeString()}
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowThreadsList(true)}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lista de threads <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded border ml-1">Alt + L</kbd></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PlayButton 
              onPlay={handleExecuteFlow} 
              onExecutionStateChange={setIsExecuting}
            />
            <ChatAssistant flowId={flowId} />
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

        <div className="flex-1 relative">
          <div className="h-full w-full" onContextMenu={handleContextMenu}>
            {showCanvasTooltip && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm">
                Pressione <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded border">/</kbd> ou clique com botão direito para adicionar um nó
              </div>
            )}
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
              onMouseMove={handleMouseMove}
              nodeTypes={nodeTypes}
              fitView
              className="bg-slate-50"
            >
              <Background />
              <Controls />
              {showCommandMenu && (
                <NodeCommandMenu
                  open={showCommandMenu}
                  onOpenChange={setShowCommandMenu}
                  onClose={() => setShowCommandMenu(false)}
                  onNodeSelect={handleNodeTypeSelect}
                />
              )}
            </ReactFlow>
          </div>
        </div>
      </div>

      <FlowThreadsList
        open={showThreadsList}
        onOpenChange={setShowThreadsList}
        nodes={nodes}
        edges={edges}
        activeNodeId={activeNodeId}
        onNodeSelect={(nodeId) => {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            setIsEditDialogOpen(true);
          }
        }}
        onNodeEdit={(nodeId) => {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            setSelectedNode(node);
            setEditingNode(node);
            setIsEditDialogOpen(true);
          }
        }}
        onNodeDelete={handleNodeDelete}
      />

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

      <IntegrationDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        icon={tempNode?.data.icon ?? ''}
        name={tempNode?.data.label ?? ''}
        description={`Configure the ${tempNode?.data.label ?? ''} node`}
        config={newNodeConfig}
        actionDefinition={{
          id: tempNode?.id?.split('-')[0] ?? '',  // Extract the original action id
          ...tempNode?.data
        }}
        onSave={handleConfigSubmit}
        isInternal={tempNode?.data.name === 'internal'}
      />

      <FlowEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        flowData={{
          name: flowData?.data?.attributes?.name || '',
          description: flowData?.data?.attributes?.description || '',
          status: flowData?.data?.attributes?.status || 'draft'
        }}
        onSave={handleFlowEdit}
        onDelete={() => handleDeleteFlow(flowId)}
      />
    </div>
  );
}
