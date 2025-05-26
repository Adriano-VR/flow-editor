// import { Dispatch, SetStateAction } from 'react';
import { Edge as ReactFlowEdge } from 'reactflow';
import { Node, NodeApiRequest } from './node';
import { Settings } from '@/lib/settingsTypes';
// import { Settings } from '@/lib/settingsTypes';

export type { Node } from './node';
export type Edge = ReactFlowEdge;

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
  markerEnd?: {
    type: string;
    width: number;
    height: number;
    color: string;
  };
  label?: string;
  labelStyle?: {
    fill: string;
    fontWeight: number;
    fontSize: number;
    cursor: string;
    opacity: number;
  };
  labelBgStyle?: {
    fill: string;
    fillOpacity: number;
    opacity: number;
  };
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
}

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
  settings?: Settings;
  name?: string;
  status?: string;
  description?: string;
}

export interface Flow {
  id: number;
  name: string;
  description: string;
  status: string;
  billing: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  data: FlowData;
}

export interface FlowResponse {
  data: Flow;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ActionConfig {
  input?: {
    variables: Array<{
      variable: string;
    }>;
  };
  output?: {
    text: string;
  };
  subject?: string;
  to?: string;
  body?: string;
  message?: string;
  phone?: string;
  template?: string;
  [key: string]: unknown;
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

export type NodeConfig = NodeApiRequest['config']; 