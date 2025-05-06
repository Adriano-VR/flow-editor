"use client"
import React, { useCallback, useState, useEffect } from "react";
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
import { Plus } from 'lucide-react';

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
        <div className="text-xs font-bold">{data.label}</div>
        {data.config && Object.entries(data.config).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-500">
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
        <div className="text-xs font-bold">{data.label}</div>
        {data.config && Object.entries(data.config).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-500">
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
        <div className="text-xs font-bold">{data.label}</div>
        {data.config && Object.entries(data.config).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-500">
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

  const categories = getNodeCategories();

  const addNode = useCallback((node: Node) => {
    setNodes((nds) => [...nds, node]);
    if (onSave) {
      onSave({ nodes: [...nodes, node], edges });
    }
  }, [nodes, edges, onSave]);

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

  const onConnect = (params: Connection) => {
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
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeConfig(node.data.config ? JSON.stringify(node.data.config) : '');
  };

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

    addNode(newNode);
    setSelectedAction('');
  };

  const handleSaveFlow = () => {
    if (onSave) {
      onSave({ nodes, edges });
      toast({
        title: "Flow salvo",
        description: "Todas as alterações foram salvas com sucesso.",
      });
    }
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    
    // Remove connected edges
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));

    setSelectedNode(null);
  };

  const handleDeleteEdge = (event: React.MouseEvent, edge: Edge) => {
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[80vh]">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-[80vh] text-red-500">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categories).map(([key, category]) => (
                <SelectItem key={key} value={key}>
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
              <SelectContent>
                {Object.entries(categories.app.subcategories).map(([key, subcategory]) => (
                  <SelectItem key={key} value={key}>
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
                    <SelectItem key={action.id} value={action.id}>
                      {action.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAddNode} disabled={!selectedAction}>
            Adicionar Nó
          </Button>
        </div>
        <Button onClick={handleSaveFlow}>Salvar Flow</Button>
      </div>

      <div className="flex-1 border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleDeleteEdge}
          nodeTypes={nodeTypes}
          fitView
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
