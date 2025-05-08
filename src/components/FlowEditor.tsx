"use client"
import React, { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    addEdge,
    Edge,
    Connection,
    NodeChange,
    EdgeChange,
    applyNodeChanges,
    applyEdgeChanges,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";
import { nodeTypes as nodeTypeDefinitions, getNodeCategories, NodeTypeDefinition } from '@/lib/nodeTypes';
import { JsonEditor } from './JsonEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MessageCircle, Mail, Code, CheckCircle2, XCircle } from 'lucide-react';
import { Node } from "@/types/flow";

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
  meta: any;
}

interface FlowEditorProps {
  flowId: string;
  initialData?: {
    nodes: Node[];
    edges: Edge[];
  };
  onSave?: (data: { nodes: Node[]; edges: Edge[] }) => void;
  onOpenDrawer?: (node: Node) => void;
}

const nodeTypes = {
  trigger: ({ data }: { data: any }) => {
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
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-white absolute left-[-8px] top-1/2 -translate-y-1/2"
          />
          <div className="flex items-center justify-center w-11/12 h-11/12  rounded-full mb-2">
          {Icon && <Icon size={90} color="#fff" />}
          </div>
          
          <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div className="w-full h-full rounded-full flex items-center justify-center shadow bg-green-600">
              <Plus size={12} color="#fff" />
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
        {/* <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.}</div> */}
      </div>
    );
  },
  action: ({ data }: { data: any }) => {
    const Icon = data.icon as React.ComponentType<{ size?: number; color?: string }>;
    console.log('Icon is a function:', typeof data.icon === 'function'); // deve imprimir: true

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
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-white absolute left-[-8px] top-1/2 -translate-y-1/2"
          />
          <div className="flex items-center justify-center w-11/12 h-11/12  rounded-full mb-2">
          {Icon && <Icon size={90} color="#fff" />}
          </div>
          
          <div className="absolute right-[-25px] top-1/2 -translate-y-1/2 w-5 h-5 z-10">
            <div className="w-full h-full rounded-full flex items-center justify-center shadow bg-green-600">
              <Plus size={12} color="#fff" />
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
        {/* <div className="text-xs font-bold text-black text-center px-1 mt-1">{data.}</div> */}
      </div>
    );
  },
  condition: ({ data }: { data: any }) => {
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
          className="w-3 h-3 bg-white absolute left-[-8px] top-1/2 -translate-y-1/2"
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
            <Handle
              type="source"
              position={Position.Bottom}
              id="true"
              className="w-4 h-4 p-1"
              style={{ 
                position: 'absolute', 
                left: '90px', 
                bottom: '-15%',

                backgroundColor: 'red',
                border: 'none'
              }}
            >
            </Handle>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Não</div>
            <Handle
              type="source"
              position={Position.Bottom}
              id="false"
              className="w-4 h-4 p-1"
              style={{ 
                position: 'absolute', 
                left: '50px', 
                bottom: '-15%',
                backgroundColor: 'green',
                border: 'none'
              }}
            >
            </Handle>
          </div>
        </div>
      </div>
    );
  },
};

export default function FlowEditor({ flowId, initialData, onSave, onOpenDrawer }: FlowEditorProps) {
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
    onOpenDrawer?.(node);
  };

  const handleJsonSave = (json: string) => {
    try {
      const parsedJson = JSON.parse(json);
      if (selectedNode) {
        const updatedNodes = nodes.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                config: parsedJson,
              },
            };
          }
          return node;
        });
        setNodes(updatedNodes);
        debouncedSave();
      }
    } catch (err) {
      console.error('Error saving JSON:', err);
    }
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
      "Modelo" : 'openAi',
       "Memória" : 'openAi',
        "Ferramenta" : 'openAi',
         "Criar Agente" : 'openAi',
          "Executar Agente" : 'openAi'
     
      // Adicione mais mapeamentos conforme necessário
    };

    const newNode: Node = {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type,
      data: {
        label: actionDefinition.name,
        icon: actionDefinition.icon,
        name: actionTypes[actionDefinition.name] ?? null, // Mapeia para 'whatsapp' se não houver mapeamento
        color: actionDefinition.color,
        config: actionDefinition.config || {},
       
      },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };
    

    setNodes((nds) => [...nds, newNode]);
    setSelectedAction('');
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
          <JsonEditor
            flowData={selectedNode}
            onSave={(json) => {
              try {
                const parsedJson = JSON.parse(json);
                if (selectedNode) {
                  // Update single node
                  const updatedNodes = nodes.map((node) => {
                    if (node.id === selectedNode.id) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          config: parsedJson,
                        },
                      };
                    }
                    return node;
                  });
                  setNodes(updatedNodes);
                } else {
                  // Update entire flow
                  if (parsedJson.nodes && Array.isArray(parsedJson.nodes)) {
                    setNodes(parsedJson.nodes);
                  }
                  if (parsedJson.edges && Array.isArray(parsedJson.edges)) {
                    setEdges(parsedJson.edges);
                  }
                }
                debouncedSave();
                toast({
                  title: "Sucesso!",
                  description: "JSON aplicado com sucesso",
                });
              } catch (err) {
                console.error('Error saving JSON:', err);
                toast({
                  title: "Erro",
                  description: "JSON inválido. Verifique o formato.",
                  variant: "destructive",
                });
              }
            }}
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
    </div>
  );
}
