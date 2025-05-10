import { Dispatch, SetStateAction } from 'react';
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export interface Flow {
  id: string;
  attributes: {
    name: string;
    status: string;
    data: {
      nodes: Node[];
      edges: Edge[];
    } | null;
  };
}

export interface NodeConfig {
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

export type Node = ReactFlowNode<{
  label: string;
  name: string;
  icon: string;
  color: string;
  config?: NodeConfig;
}>;

export type Edge = ReactFlowEdge;

export interface Action {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface actionConfig {
  subject?: string;
  to?: string;
  body?: string;
  message?: string;
  phone?: string;
  template?:string
}

export interface FlowContextType {
  selectedFlowId: string | null;
  setSelectedFlowId: (id: string | null) => void;
  flowData: Flow | null;
  flowName: string;
  setFlowName: (name: string) => void;
  isCreating: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isActionModalOpen: boolean;
  setIsActionModalOpen: (open: boolean) => void;
  selectedAction: Action | null;
  setSelectedAction: (action: Action | null) => void;
  actionConfig: actionConfig;
  setActionConfig: Dispatch<SetStateAction<actionConfig>>;
  handleCreateFlow: () => Promise<void>;
  handleSaveFlow: (data: { nodes: Node[]; edges: Edge[] }) => Promise<void>;
  handleActionSelect: (action: Action) => void;
  handleActionConfigSubmit: () => Promise<void>;
} 