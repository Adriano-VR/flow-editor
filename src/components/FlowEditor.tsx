"use client"
import React, { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    addEdge,
    Edge,
    Connection,
    Node,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MessageCircle, Mail } from 'lucide-react';

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
  onOpenDrawer?: () => void;
}

const nodeTypes = {
  trigger: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {data.subcategory === 'whatsapp' ? (
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
          ) : data.icon && (
            <data.icon className="h-4 w-4 text-stone-400" />
          )}
          <div className="text-sm font-semibold">{data.label}</div>
        </div>
        {data.config && Object.entries(data.config).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-500 mt-1">
            {key}: {JSON.stringify(value)}
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-stone-400 hover:bg-stone-500"
      />
    </div>
  ),
  action: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 hover:bg-blue-500"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {data.subcategory === 'whatsapp' ? (
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
          ) : data.icon && (
            <data.icon className="h-4 w-4 text-blue-400" />
          )}
          <div className="text-sm font-semibold">{data.label}</div>
        </div>
        {data.config && Object.entries(data.config).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-500 mt-1">
            {key}: {JSON.stringify(value)}
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 hover:bg-blue-500"
      />
    </div>
  ),
  condition: ({ data }: { data: any }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-yellow-400">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-400 hover:bg-yellow-500"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {data.subcategory === 'whatsapp' ? (
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
          ) : data.icon && (
            <data.icon className="h-4 w-4 text-yellow-400" />
          )}
          <div className="text-sm font-semibold">{data.label}</div>
        </div>
        {data.config && Object.entries(data.config).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-500 mt-1">
            {key}: {JSON.stringify(value)}
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-yellow-400 hover:bg-yellow-500"
      />
    </div>
  ),
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
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#64748b',
      },
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

    console.log('Creating new node with onAddNode:', onOpenDrawer);

    const newNode: Node = {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type,
      data: {
        label: actionDefinition.name,
        // icon: Mail, // <-- Aqui define o ícone desejado
        config: actionDefinition.config || {},
        onAddNode: () => {
          console.log('Node plus button clicked');
          onOpenDrawer?.();
        },
      },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };
    

    setNodes((nds) => [...nds, newNode]);
    setSelectedAction('');
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
                {Object.entries(categories.app.subcategories).map(([key, subcategory]) => {
                  
                  return (
                    <SelectItem key={key} value={key} className="font-semibold">
                   
                      {subcategory.name}
                                        
                    </SelectItem>
                  );
                })}
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
        {lastSaved && (
          <div className="text-sm text-muted-foreground">
            Último salvamento: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

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
