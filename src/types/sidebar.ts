import { Node } from "reactflow";
import { Edge } from "./flow";

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

export interface SidebarProps {
  onSelectFlow: (flowId: string) => void;
} 