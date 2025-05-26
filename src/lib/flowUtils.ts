import { Flow } from "@/types/flow";
import { FlowData } from "@/components/NodeCommandMenu";
import { Settings } from "@/lib/settingsTypes";
import { Node } from "@/types/node";
import { Edge } from "@/types/flow";

export function flowToFlowData(flow: Flow | null): FlowData {
  console.log("flowToFlowData input:", flow);
  
  if (!flow) {
    console.log("flow is null, returning default FlowData");
    return {
      edges: [],
      nodes: [],
      settings: {},
    };
  }

  // Extrai os dados do formato do backend
  const flowData = flow.data?.data || {};
  
  const result = {
    edges: flowData.edges || [],
    nodes: flowData.nodes || [],
    settings: flowData.settings || {},
    name: flow.data?.name,
    status: flow.data?.status,
    description: flow.data?.description,
  };
  
  console.log("flowToFlowData output:", result);
  return result;
}

export function flowDataToFlow(flowData: FlowData, existingFlow: Flow | null): {
  id?: string;
  name?: string;
  status?: string;
  description?: string;
  data: {
    nodes: Node[];
    edges: Edge[];
    settings?: Settings;
  };
} {
  console.log("flowDataToFlow input:", { flowData, existingFlow });
  
  const result = {
    id: existingFlow?.id,
    name: flowData.name || existingFlow?.data?.name,
    status: flowData.status || existingFlow?.data?.status,
    description: flowData.description || existingFlow?.data?.description,
    data: {
      nodes: flowData.nodes,
      edges: flowData.edges,
      settings: flowData.settings as Settings,
    }
  };
  
  console.log("flowDataToFlow output:", result);
  return result;
} 