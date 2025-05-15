import { Node, Edge } from '@/types/flow';
import { NodeTypeDefinition } from './nodeTypes';

export interface NodeOperationResult {
  nodes: Node[];
  edges: Edge[];
}

export const createNode = (
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

export const updateNode = (
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

export const deleteNode = (
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

export const duplicateNode = (
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