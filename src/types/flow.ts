import { Dispatch, SetStateAction } from 'react';
import { Node as ReactFlowNode, Edge as ReactFlowEdge, MarkerType } from 'reactflow';

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

export type Node = ReactFlowNode<{
  label: string;
  config: unknown;
  icon?: string;
  subcategory?: string;
  color?: string;
  name:string;
  onAddNode?: () => void;
  data?:string
}>;

export type Edge = ReactFlowEdge & {
  style?: {
    stroke: string;
    strokeWidth: number;
  };
  markerEnd?: {
    type: MarkerType;
    width: number;
    height: number;
    color: string;
  };
};

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