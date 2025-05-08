"use client"
import React, { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
    Controls,
    Background,
    addEdge,
    Edge,
    Connection,
    NodeChange,
    EdgeChange,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getFlow } from "../lib/api";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";
import { nodeTypes as nodeTypeDefinitions, getNodeCategories, NodeTypeDefinition } from '@/lib/nodeTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Code } from 'lucide-react';
import { Node } from "@/types/flow";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FlowData {
  data: {
    id: number;
    attributes: {
      name: string;
      status: string;
      data: {
        nodes: Node[];
        edges: Edge[];
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
  trigger: ({ data }: { data: NodeTypeDefinition }) => {
    const Icon = data.icon as React.ComponentType<{ size?: number; color?: string }>;
    return (
      <div className="flex flex-col items-center">
        <div
          className={`
            flex flex-col items-center justify-center
            rounded-full shadow-lg
            border-2 
            w-36 h-36
            relative
          `}
          style={{ 
            minWidth: 96, 
            minHeight: 96,
            backgroundColor: data.color || '#3B82F6'
          }}
        >
          <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
              style={{ 
                background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white/80"></div>
            </div>
            <Handle
              type="target"
              position={Position.Left}
              className="absolute inset-0 opacity-0"
            />
          </div>

          <div className="flex items-center justify-center w-11/12 h-11/12 rounded-full mb-2">
            {Icon && <Icon size={90} color="#fff" />}
          </div>
          
          <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
              style={{ 
                background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white/80"></div>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              className="absolute inset-0 opacity-0"
            />
          </div>
        </div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize" >{data.name}</div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
      </div>
    );
  },
  action: ({ data }: { data: NodeTypeDefinition }) => {
    const Icon = data.icon as React.ComponentType<{ size?: number; color?: string }>;
    console.log(data);
    // Design especial para assistente virtual
    if (data.name === 'openAi') {
      return (
        <div className="flex flex-col items-center">
          <div
            className={`
              flex flex-col items-center justify-center
              shadow-lg
              border-2 
              relative
              bg-white
              p-4
              rounded-lg
              min-w-[200px]
            `}
            style={{ 
              borderColor: data.color || '#3B82F6',
              backgroundColor: `${data.color}15`
            }}
          >
            <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
                style={{ 
                  background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white/80"></div>
              </div>
              <Handle
                type="target"
                position={Position.Left}
                className="absolute inset-0 opacity-0"
              />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: data.color || '#3B82F6' }}>
                {Icon && <Icon size={24} color="white" />}
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-bold" style={{ color: data.color || '#3B82F6' }}>{data.label}</div>
                <div className="text-xs text-gray-500">Assistente Virtual</div>
              </div>
            </div>
            
            <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
              <div 
                className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
                style={{ 
                  background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white/80"></div>
              </div>
              <Handle
                type="source"
                position={Position.Right}
                className="absolute inset-0 opacity-0"
              />
            </div>
          </div>
        </div>
      );
    }

    // Design padrão para outros nós de ação
    return (
      <div className="flex flex-col items-center">
        <div
          className={`
            flex flex-col items-center justify-center
            rounded-full shadow-lg
            border-2 
            w-36 h-36
            relative
          `}
          style={{ 
            minWidth: 96, 
            minHeight: 96,
            backgroundColor: data.color || '#3B82F6'
          }}
        >
          <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
              style={{ 
                background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white/80"></div>
            </div>
            <Handle
              type="target"
              position={Position.Left}
              className="absolute inset-0 opacity-0"
            />
          </div>

          <div className="flex items-center justify-center w-11/12 h-11/12 rounded-full mb-2">
            {Icon && <Icon size={90} color="#fff" />}
          </div>
          
          <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
              style={{ 
                background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white/80"></div>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              className="absolute inset-0 opacity-0"
            />
          </div>
        </div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1 capitalize" >{data.name}</div>
        <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.label}</div>
      </div>
    );
  },
  condition: ({ data }: { data: NodeTypeDefinition }) => {
    const Icon = data.icon as React.ComponentType<{ size?: number; color?: string }>;
    return (
      <div
        className={`
          flex flex-col items-center justify-center
          shadow-lg
          border-4
          relative
          bg-white
          p-4
          rounded-lg
        `}
        style={{ 
          minWidth: 120,
          minHeight: 80,
          borderColor: data.color || '#EAB308'
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="absolute left-[-8px] top-1/2 -translate-y-1/2"
        />
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: data.color || '#EAB308' }}>
            {Icon && <Icon size={20} color="white" />}
          </div>
          <div className="text-sm font-bold" style={{ color: data.color || '#EAB308' }}>{data.label}</div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Sim</div>
            <div className="relative">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
                style={{ 
                  background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white/80"></div>
              </div>
              <Handle
                type="source"
                position={Position.Bottom}
                id="true"
                className="absolute inset-0 opacity-0"
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Não</div>
            <div className="relative">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/20 hover:scale-110"
                style={{ 
                  background: `linear-gradient(to bottom right, ${data.color}99, ${data.color})`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white/80"></div>
              </div>
              <Handle
                type="source"
                position={Position.Bottom}
                id="false"
                className="absolute inset-0 opacity-0"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export default function FlowEditor({ flowId, initialData, onSave }: FlowEditorProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeConfig, setNodeConfig] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [newNodeConfig, setNewNodeConfig] = useState<any>({});
  const [tempNode, setTempNode] = useState<Node | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#64748b',
        strokeWidth: 2,
        strokeDasharray: '5,5',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#64748b',
      },
     
      labelStyle: { fill: '#64748b', fontWeight: 700 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
      labelBgPadding: [4, 4],
      labelBgBorderRadius: 4,
    }, eds));
    debouncedSave();
  }, [debouncedSave]);

  // Modified node config save handler
  const handleSaveNode = () => {
    if (!selectedNode) return;

    const updatedNodes = nodes.map((node) => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            config: nodeConfig ? JSON.parse(nodeConfig) : {},
          },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
    setSelectedNode(null);
    debouncedSave();
  };

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

  const handleDeleteEdge = (event: React.MouseEvent, edge: Edge) => {
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

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeConfig(node.data.config ? JSON.stringify(node.data.config) : '');
    setShowJsonEditor(true);
  };


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
      "Executar Agente": "openAi"
    };

    const newNode: Node = {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type,
      data: {
        label: actionDefinition.name,
        icon: actionDefinition.icon,
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
    if (selectedCategory === 'internal' && actionDefinition.name !== 'Atraso') {
      setNodes((nds) => [...nds, newNode]);
      setSelectedAction('');
      return;
    }

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
          case 'Executar Agente':
            return (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentId">ID do Agente</Label>
                  <Input
                    id="agentId"
                    placeholder="Digite o ID do agente"
                    value={newNodeConfig.agentId || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, agentId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input">Input</Label>
                  <Textarea
                    id="input"
                    placeholder="Digite o input para o agente"
                    value={newNodeConfig.input || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, input: e.target.value })}
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
                    value={newNodeConfig.parameters || ''}
                    onChange={(e) => setNewNodeConfig({ ...newNodeConfig, parameters: e.target.value })}
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
                  onValueChange={(value) => setNewNodeConfig({ ...newNodeConfig, unit: value })}
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
        }
        return null;
      default:
        return null;
    }
  };

  // Add this new function to handle the Code button click
  const handleCodeButtonClick = () => {
    setShowJsonEditor(!showJsonEditor);
    if (!showJsonEditor) {
      // When showing the editor, set the selected node to null to show the full flow
      setSelectedNode(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[80vh]">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-[80vh] text-red-500">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 font-semibold">
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
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-sm text-muted-foreground">
              Último salvamento: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleCodeButtonClick}
            className={showJsonEditor ? "bg-muted" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showJsonEditor && (
        <div className="mb-4 h-[200px] border rounded-lg">
          <Textarea
            value={nodeConfig}
            onChange={(e) => setNodeConfig(e.target.value)}
            placeholder='{"message": "Olá!"}'
          />
        </div>
      )}

      <div className="flex-1 border rounded-lg">
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
          className="cursor-crosshair"
          style={{ cursor: 'crosshair' }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nó</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Configuração (JSON)</label>
              <Input
                value={nodeConfig}
                onChange={(e) => setNodeConfig(e.target.value)}
                placeholder='{"message": "Olá!"}'
              />
            </div>
            <div className="flex justify-between">
              <Button 
                onClick={handleDeleteNode}
                variant="destructive"
              >
                Deletar Nó
              </Button>
              <Button onClick={handleSaveNode}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
