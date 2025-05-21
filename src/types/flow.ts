import { Dispatch, SetStateAction } from 'react';
import { Edge as ReactFlowEdge } from 'reactflow';
import { Node } from './node';

export type { Node } from './node';
export type Edge = ReactFlowEdge;

export interface Flow {
  id: string;
  attributes: {
    name: string;
    status: string;
    description?: string;
    data: {
      nodes: Node[];
      edges: Edge[];
    } | null;
  };
}

export interface Action {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ActionConfig {
  subject?: string;
  to?: string;
  body?: string;
  message?: string;
  phone?: string;
  template?: string;
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
  actionConfig: ActionConfig;
  setActionConfig: Dispatch<SetStateAction<ActionConfig>>;
  handleCreateFlow: () => Promise<void>;
  handleSaveFlow: (data: { nodes: Node[]; edges: Edge[] }) => Promise<void>;
  handleActionSelect: (action: Action) => void;
  handleActionConfigSubmit: () => Promise<void>;
}

export interface NodeConfig {
  // WhatsApp config
  to?: string;
  message?: string;
  template?: string;
  phone?: string;
  credentials?: {
    provider: string;
    appName: string;
    source: string; // phone number
    webhook: string;
    apiKey: string;
  };
  
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

  // Webhook config
  webhook?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    response?: Record<string, unknown>;
  };
} 