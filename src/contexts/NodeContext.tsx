import React, { createContext, useContext, ReactNode } from 'react';
import { Node as ReactFlowNode } from 'reactflow';
import { MessageSquare, Bot, GitBranch } from 'lucide-react';

interface NodeType {
  icon: React.ElementType;
  color: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}

interface NodeContextData {
  nodeTypes: Record<string, NodeType>;
  onEdit: (node: ReactFlowNode) => void;
  onDelete: (nodeId: string) => void;
}

const NodeContext = createContext<NodeContextData>({} as NodeContextData);

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
  return (
    <NodeContext.Provider value={{ nodeTypes, onEdit, onDelete }}>
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