"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createFlow, getFlow, updateFlow, deleteFlow, getFlows } from "@/lib/api";
import { nodeTypes as nodeTypeDefinitions } from "@/lib/nodeTypes";
import { Flow, Node, Edge, Action, actionConfig } from "@/types/flow";
import { Flow as FlowType } from "@/types/sidebar";
import { NodeTypeDefinition } from '@/lib/nodeTypes';

interface FlowContextType {
  flows: Flow[];
  selectedFlowId: string | null;
  setSelectedFlowId: (id: string | null) => void;
  isCreating: boolean;
  isDeleting: string | null;
  flowData: Flow | null;
  flowName: string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isActionModalOpen: boolean;
  setIsActionModalOpen: (isOpen: boolean) => void;
  selectedAction: Action | null;
  setSelectedAction: (action: Action | null) => void;
  actionConfig: actionConfig;
  setActionConfig: (config: actionConfig) => void;
  handleCreateFlow: (name: string) => Promise<string | null>;
  handleDeleteFlow: (flowId: string) => Promise<void>;
  handleSaveFlow: (data: { nodes: Node[]; edges: Edge[]; name?: string; status?: string; description?: string }) => Promise<void>;
  handleActionSelect: (action: Action) => void;
  handleActionConfigSubmit: () => Promise<void>;
  handleJsonUpdate: (json: string) => Promise<void>;
  setFlows: React.Dispatch<React.SetStateAction<Flow[]>>;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [flowData, setFlowData] = useState<Flow | null>(null);
  const [flowName, setFlowName] = useState("Novo Flow");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionConfig, setActionConfig] = useState<actionConfig>({});
  const [flows, setFlows] = useState<FlowType[]>([]);

  const handleCreateFlow = async (name: string): Promise<string | null> => {
    if (!name.trim()) return null;

    try {
      setIsCreating(true);
      const flowData = {
        data: {
          name: name.trim(),
          status: "draft",
          billing: "free",
          published: true,
          data: {
            nodes: [],
            edges: []
          }
        }
      };

      const response = await createFlow(flowData as Partial<Flow>);

      if (response && response.data && response.data.id) {
        const updatedResponse = await getFlows();
        setFlows([updatedResponse.data[0], ...updatedResponse.data.slice(1)]);
        setSelectedFlowId(response.data.id.toString());
        return response.data.id.toString();
      }
      return null;
    } catch (err) {
      console.error('Error creating flow:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFlow = async (flowId: string): Promise<void> => {
   
    try {
      setIsDeleting(flowId);
      await deleteFlow(flowId);
      const updatedResponse = await getFlows();
      setFlows(updatedResponse.data);
    } catch (err) {
      console.error('Error deleting flow:', err);
      throw err;
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await getFlows();
        setFlows(response.data);
      } catch (err) {
        console.error('Error fetching flows:', err);
      }
    };

    fetchFlows();
  }, []);

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

  const handleSaveFlow = async (data: { nodes: Node[]; edges: Edge[]; name?: string; status?: string; description?: string }) => {
    if (!selectedFlowId) return;

    try {
      await updateFlow(selectedFlowId, {
        data: {
          name: data.name || flowData?.attributes?.name || "Novo Flow",
          status: data.status || flowData?.attributes?.status || "draft",
          description: data.description || flowData?.attributes?.description || "",
          billing: "free",
          published: true,
          data: {
            nodes: data.nodes,
            edges: data.edges
          }
        }
      });

      // Atualiza o estado local
      setFlowData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          attributes: {
            ...prev.attributes,
            name: data.name || prev.attributes.name,
            status: data.status || prev.attributes.status,
            description: data.description || prev.attributes.description,
            data: {
              ...prev.attributes.data,
              nodes: data.nodes,
              edges: data.edges
            }
          }
        };
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
      actionDefinition = (nodeTypeDefinitions.app.subcategories as Record<string, { actions: NodeTypeDefinition[] }>)[subcategory]?.actions.find(a => a.id === actionName);
    } else if (category === 'internal') {
      actionDefinition = nodeTypeDefinitions.internal.actions.find(a => a.id === actionName);
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
        name: actionDefinition.name,
        icon: actionDefinition.icon || '',
        color: actionDefinition.color || '#3B82F6',
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

  const value: FlowContextType = {
    flows,
    selectedFlowId,
    setSelectedFlowId,
    isCreating,
    isDeleting,
    flowData,
    flowName,
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
    handleDeleteFlow,
    handleSaveFlow,
    handleActionSelect,
    handleActionConfigSubmit,
    handleJsonUpdate,
    setFlows,
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