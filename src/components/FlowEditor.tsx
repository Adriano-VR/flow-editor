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
import {updateNode, deleteNode } from '@/lib/nodeOperations';
import { nodeTypes as allNodeTypes } from "@/lib/nodeTypes";
import { IntegrationDialog } from './IntegrationDialog';
import { ChatAssistant } from './ChatAssistant';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { CommentNode } from './nodes/CommentNode';
import { DatabaseNode } from './nodes/DatabaseNode';
import { ApiNode } from './nodes/ApiNode';
import { WebhookNode } from './nodes/WebhookNode';

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

// Gere actionTypes automaticamente a partir do allNodeTypes
const appActionTypes = Object.values(allNodeTypes.app.subcategories)
  .flatMap((subcat: any) => subcat.actions)
  .reduce((acc: Record<string, string>, action: any) => {
    acc[action.name] = action.subcategory || action.category || "app";
    return acc;
  }, {} as Record<string, string>);

const internalActionTypes = Object.values(allNodeTypes.internal)
  .reduce((acc: Record<string, string>, action: any) => {
    acc[action.name] = "internal";
    return acc;
  }, {} as Record<string, string>);

const actionTypes: Record<string, string> = {
  ...appActionTypes,
  ...internalActionTypes,
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  comment: CommentNode,
  database: DatabaseNode,
  api: ApiNode,
  webhook: WebhookNode,
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
    // Se já estiver com um diálogo aberto, não abre outro
    if (isConfigDialogOpen) return;

    const newNode: Node = {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type,
      data: {
        label: actionDefinition.name,
        icon: actionDefinition.icon ?? '',
        name: actionDefinition.name,
        color: actionDefinition.color,
        config: actionDefinition.config || {},
      },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };

    // Para todos os nós que precisam de configuração, abre o diálogo
    if (
      actionDefinition.name === 'Atraso' ||
      actionDefinition.name === 'Início' ||
      actionDefinition.category === 'app' ||
      actionDefinition.name === 'Comentário' ||
      actionDefinition.name === 'Banco de Dados' ||
      actionDefinition.name === 'Webhook'
    ) {
      setTempNode(newNode);
      setNewNodeConfig(actionDefinition.config || {});
      setIsConfigDialogOpen(true);
      return;
    }

    // Para outros nós internos simples, adiciona direto
    setNodes((nds) => [...nds, newNode]);
  };

  const handleConfigSubmit = () => {
    if (!tempNode) return;

    // Evita duplo submit/dupla abertura
    if (!isConfigDialogOpen) return;

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
          case 'API':
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.exemplo.com/endpoint"
                    value={newNodeConfig.endpoint || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, endpoint: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Método</Label>
                  <Select
                    value={newNodeConfig.method || 'GET'}
                    onValueChange={(value) => setNewNodeConfig({ ...newNodeConfig, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="condition" className="text-white">Condição de Início</Label>
                <Textarea
                  id="condition"
                  placeholder="Digite a condição de início (opcional)"
                  value={newNodeConfig.condition || ''}
                  onChange={(e) => setNewNodeConfig({ 
                    ...newNodeConfig, 
                    condition: e.target.value 
                  })}
                  className="bg-[#2d3748] text-white border-gray-600 focus:border-green-500 focus:ring-green-500 placeholder-gray-400"
                />
              </div>
            </div>
          );
        }
        // Adicionar suporte ao node de comentário
        if (tempNode.data.label === 'Comentário') {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment">Comentário</Label>
                <Textarea
                  id="comment"
                  placeholder="Digite seu comentário"
                  value={newNodeConfig.comment || ''}
                  onChange={(e) => setNewNodeConfig({ ...newNodeConfig, comment: e.target.value })}
                />
              </div>
            </div>
          );
        }
        if (tempNode.data.label === 'Banco de Dados') {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Query SQL</Label>
                <Textarea
                  id="query"
                  placeholder="Digite a query SQL"
                  value={newNodeConfig.query || ''}
                  onChange={(e) => setNewNodeConfig({ ...newNodeConfig, query: e.target.value })}
                />
              </div>
            </div>
          );
        }
        if (tempNode.data.label === 'Webhook') {
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://webhook.site/unique-url"
                  value={newNodeConfig.url || ''}
                  onChange={(e) => setNewNodeConfig({ ...newNodeConfig, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Método</Label>
                <Select
                  value={newNodeConfig.method || 'POST'}
                  onValueChange={(value) => setNewNodeConfig({ ...newNodeConfig, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
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

      <IntegrationDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        icon={tempNode?.data.icon ?? ''}
        name={tempNode?.data.label ?? ''}
        description={`Configure the ${tempNode?.data.label ?? ''} node`}
        config={newNodeConfig}
        renderConfigFields={(config, setConfig) => {
          // Atualiza o newNodeConfig quando o config mudar
          const handleConfigChange = (newConfig: any) => {
            setNewNodeConfig(newConfig);
            setConfig(newConfig);
          };

          return (
            <div className="[&_input]:bg-[#2d3748] [&_input]:text-white [&_input]:border-gray-600 [&_select]:bg-[#2d3748] [&_select]:text-white [&_select]:border-gray-600 [&_select]:focus:border-green-500 [&_select]:focus:ring-green-500 [&_textarea]:bg-[#2d3748] [&_textarea]:text-white [&_textarea]:border-gray-600 [&_textarea]:focus:border-green-500 [&_textarea]:focus:ring-green-500 [&_label]:text-white">
              {tempNode?.data.label === 'Início' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-white">Condição de Início</Label>
                    <Textarea
                      id="condition"
                      placeholder="Digite a condição de início (opcional)"
                      value={config.condition || ''}
                      onChange={(e) => handleConfigChange({ ...config, condition: e.target.value })}
                      className="bg-[#2d3748] text-white border-gray-600 focus:border-green-500 focus:ring-green-500 placeholder-gray-400"
                    />
                  </div>
                </div>
              ) : (
                renderConfigFields()
              )}
            </div>
          );
        }}
        onSave={handleConfigSubmit}
        isInternal={tempNode?.data.name === 'internal'}
      />
    </div>
  );
}
