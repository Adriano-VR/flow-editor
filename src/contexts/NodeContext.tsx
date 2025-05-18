import React, { createContext, useContext, ReactNode } from 'react';
import { Node as ReactFlowNode } from 'reactflow';
import { MessageSquare, Bot, GitBranch } from 'lucide-react';
import { Node, Edge } from '@/types/flow';
import { NodeTypeDefinition } from '@/lib/nodeTypes';

interface NodeType {
  icon: React.ElementType;
  color: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}

interface NodeOperationResult {
  nodes: Node[];
  edges: Edge[];
}

interface NodeContextData {
  nodeTypes: Record<string, NodeType>;
  onEdit: (node: ReactFlowNode) => void;
  onDelete: (nodeId: string) => void;
  createNode: (nodes: Node[], edges: Edge[], nodeType: NodeTypeDefinition, position: { x: number; y: number }) => NodeOperationResult;
  updateNode: (nodes: Node[], edges: Edge[], nodeId: string, updates: Partial<Node>) => NodeOperationResult;
  deleteNode: (nodes: Node[], edges: Edge[], nodeId: string) => NodeOperationResult;
  duplicateNode: (nodes: Node[], edges: Edge[], nodeId: string, offset?: { x: number; y: number }) => NodeOperationResult;
}

const NodeContext = createContext<NodeContextData>({
  nodeTypes: {},
  onEdit: () => {},
  onDelete: () => {},
  createNode: () => ({ nodes: [], edges: [] }),
  updateNode: () => ({ nodes: [], edges: [] }),
  deleteNode: () => ({ nodes: [], edges: [] }),
  duplicateNode: () => ({ nodes: [], edges: [] })
});

const nodeTypes = {
  'criar-agente': {
    icon: Bot,
    color: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-blue-500',
    textColor: 'text-gray-700'
  },
  'enviar-mensagem': {
    icon: MessageSquare,
    color: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-green-500',
    textColor: 'text-gray-700'
  },
  'condicao': {
    icon: GitBranch,
    color: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-purple-500',
    textColor: 'text-gray-700'
  }
};

interface NodeProviderProps {
  children: ReactNode;
  onEdit: (node: ReactFlowNode) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeProvider({ children, onEdit, onDelete }: NodeProviderProps) {
  const createNode = (
    nodes: Node[],
    edges: Edge[],
    nodeType: NodeTypeDefinition,
    position: { x: number; y: number }
  ): NodeOperationResult => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeType.type,
      position,
      data: {
        label: String(nodeType.label ?? nodeType.name ?? ''),
        config: nodeType.config || {},
        icon: nodeType.icon ?? '',
        name: nodeType.name ?? '',
        color: nodeType.color ?? ''
      }
    };

    return {
      nodes: [...nodes, newNode],
      edges
    };
  };

  const updateNode = (
    nodes: Node[],
    edges: Edge[],
    nodeId: string,
    updates: Partial<Node>
  ): NodeOperationResult => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          ...updates,
          data: {
            ...node.data,
            ...(updates.data || {})
          }
        };
      }
      return node;
    });

    return {
      nodes: updatedNodes,
      edges
    };
  };

  const deleteNode = (
    nodes: Node[],
    edges: Edge[],
    nodeId: string
  ): NodeOperationResult => {
    // Remove the node
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    
    // Remove all connected edges
    const updatedEdges = edges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );

    return {
      nodes: updatedNodes,
      edges: updatedEdges
    };
  };

  const duplicateNode = (
    nodes: Node[],
    edges: Edge[],
    nodeId: string,
    offset: { x: number; y: number } = { x: 50, y: 50 }
  ): NodeOperationResult => {
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    
    if (!nodeToDuplicate) {
      return { nodes, edges };
    }

    const newNode: Node = {
      ...nodeToDuplicate,
      id: `node-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + offset.x,
        y: nodeToDuplicate.position.y + offset.y
      }
    };

    return {
      nodes: [...nodes, newNode],
      edges
    };
  };

  return (
    <NodeContext.Provider value={{ 
      nodeTypes, 
      onEdit, 
      onDelete,
      createNode,
      updateNode,
      deleteNode,
      duplicateNode
    }}>
      {children}
    </NodeContext.Provider>
  );
}

export function useNode() {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error('useNode must be used within a NodeProvider');
  }
  return context;
} 