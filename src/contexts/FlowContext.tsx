"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createFlow,getFlow, updateFlow } from "@/lib/api";
import { nodeTypes as nodeTypeDefinitions } from "@/lib/nodeTypes";
import { Flow, Node, Edge, Action, FlowContextType, actionConfig } from "@/types/flow";

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [flowData, setFlowData] = useState<Flow | null>(null);
  const [flowName, setFlowName] = useState("Novo Flow");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionConfig, setActionConfig] = useState<actionConfig>({});
  



  useEffect(() => {
    const loadFlowData = async () => {
      if (selectedFlowId) {
        try {
          const response = await getFlow(selectedFlowId);
          setFlowData(response.data);
          setFlowName(response.data.name || "Novo Flow");
        } catch (error) {
          console.error('Error loading flow:', error);
        }
      }
    };

    loadFlowData();
  }, [selectedFlowId]);

  const handleCreateFlow = async () => {
    try {
      setIsCreating(true);
      const newFlow = await createFlow({
        data: {
          name: flowName,
          status: "draft",
          billing: "free",
          published: true,
          data: {
            nodes: [],
            edges: []
          }
        }
      });
      
      if (newFlow.data?.id) {
        setSelectedFlowId(newFlow.data.id.toString());
      }
    } catch (error) {
      console.error('Error creating flow:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveFlow = async (data: { nodes: Node[]; edges: Edge[] }) => {
    if (!selectedFlowId) return;

    try {
      await updateFlow(selectedFlowId, {
        data: {
          name: flowData?.attributes?.name || "Novo Flow",
          status: "draft",
          billing: "free",
          published: true,
          data
        }
      });
    } catch (error) {
      console.error('Error saving flow:', error);
    }
  };

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    setActionConfig({});
    setIsActionModalOpen(true);
  };

  const handleActionConfigSubmit = async () => {
    if (!selectedAction || !flowData?.attributes?.data || !selectedFlowId) return;

    let actionDefinition;

    const [category, subcategory, ...actionParts] = selectedAction.id.split('_');
    const actionName = actionParts.join('_');

    if (category === 'app' && subcategory) {
      actionDefinition = nodeTypeDefinitions.app[subcategory]?.[actionName];
    } else if (category === 'internal') {
      actionDefinition = nodeTypeDefinitions.internal[actionName];
    }

    if (!actionDefinition) {
      console.error('Action definition not found:', { category, subcategory, actionName });
      return;
    }

    let config = {};
    switch (selectedAction.id) {
      case 'whatsapp-send-message':
        config = {
          phone: actionConfig.phone,
          message: actionConfig.message
        };
        break;
      case 'whatsapp-receive-message':
        config = {
          template: actionConfig.template,
          phone: actionConfig.phone
        };
        break;
      default:
        config = actionConfig;
    }

    const newNode: Node = {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type,
      data: {
        label: actionDefinition.name,
        config: config,
        name: actionDefinition.name, // campo obrigatório
      },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };

    const updatedData = {
      nodes: [...(flowData.attributes?.data.nodes || []), newNode],
      edges: flowData.attributes?.data.edges || [],
    };

    try {
      const response = await updateFlow(selectedFlowId, {
        data: {
          name: flowName,
          status: "draft",
          billing: "free",
          published: true,
          data: updatedData
        }
      });
      
      setFlowData(response.data);
      setIsActionModalOpen(false);
      setSelectedAction(null);
      setActionConfig({});
    } catch (error) {
      console.error('Error saving flow:', error);
    }
  };

  const handleJsonUpdate = async (json: string) => {
    if (!selectedFlowId) return;

    try {
      const parsedJson = JSON.parse(json);
      await updateFlow(selectedFlowId, {
        data: {
          name: flowData?.attributes?.name || "Novo Flow",
          status: "draft",
          billing: "free",
          published: true,
          data: parsedJson
        }
      });
      
      // Atualiza o estado local com o novo JSON
      setFlowData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          attributes: {
            ...prev.attributes,
            data: parsedJson
          }
        };
      });
    } catch (error) {
      console.error('Error updating flow JSON:', error);
    }
  };

  const value = {
    selectedFlowId,
    setSelectedFlowId,
    flowData,
    flowName,
    setFlowName,
    isCreating,
    isDrawerOpen,
    setIsDrawerOpen,
    searchQuery,
    setSearchQuery,
    isActionModalOpen,
    setIsActionModalOpen,
    selectedAction,
    setSelectedAction,
    actionConfig,
    setActionConfig,
    handleCreateFlow,
    handleSaveFlow,
    handleActionSelect,
    handleActionConfigSubmit,
    handleJsonUpdate,
  };

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
} 