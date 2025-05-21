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
  isLoading: boolean;
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
  getFlows: () => Promise<{ data: Flow[] }>;
  createNode: (actionDefinition: NodeTypeDefinition, position?: { x: number; y: number }) => Node;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flowData, setFlowData] = useState<Flow | null>(null);
  const [flowName, setFlowName] = useState("");
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
    if (!flowId) {
      throw new Error("Flow ID is required");
    }
   
    try {
      setIsDeleting(flowId);
      const response = await deleteFlow(flowId);
      
      if (!response) {
        throw new Error("Failed to delete flow");
      }

      const updatedResponse = await getFlows();
      setFlows(updatedResponse.data);
      
      // Se o flow deletado era o selecionado, limpa a seleção
      if (selectedFlowId === flowId) {
        setSelectedFlowId(null);
        setFlowData(null);
      }
    } catch (err) {
      console.error('Error deleting flow:', err);
      throw err; // Re-throw the error to be handled by the component
    } finally {
      setIsDeleting(null);
    }
  };

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setIsLoading(true);
        const response = await getFlows();
        setFlows(response.data);
      } catch (err) {
        console.error('Error fetching flows:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlows();
  }, []);

  useEffect(() => {
    const loadFlowData = async () => {
      if (selectedFlowId) {
        try {
          const response = await getFlow(selectedFlowId);
          const newFlowData = response.data;
          setFlowData(newFlowData);
          
          // Atualiza o nome do flow apenas se ele existir nos dados
          if (newFlowData?.attributes?.name) {
            setFlowName(newFlowData.attributes.name);
          }
        } catch (error) {
          console.error('Error loading flow:', error);
        }
      } else {
        // Limpa os dados quando não há flow selecionado
        setFlowData(null);
        setFlowName("");
      }
    };

    loadFlowData();
  }, [selectedFlowId]);

  const handleSaveFlow = async (data: { nodes: Node[]; edges: Edge[]; name?: string; status?: string; description?: string }) => {
    if (!selectedFlowId) return;

    try {
      const updatedName = data.name || flowData?.attributes?.name;
      if (updatedName) {
        setFlowName(updatedName);
      }

      await updateFlow(selectedFlowId, {
        data: {
          name: updatedName,
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
            name: updatedName || prev.attributes.name,
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

  const createNode = (actionDefinition: NodeTypeDefinition, position?: { x: number; y: number }): Node => {
    // Remove input/output/credentials do config se existirem
    const { 
      input: configInput, 
      output: configOutput, 
      credentials: configCredentials,
      config: nestedConfig, // Remove config aninhado se existir
      ...restConfig 
    } = actionDefinition.config || {};

    // Config limpo sem credenciais e sem aninhamento
    const configWithoutCredentials = nestedConfig || restConfig;

    // Prioriza credenciais do nível raiz, depois do config
    const finalCredentials = {
      ...(actionDefinition.credentials || {}), // Primeiro usa credenciais do nível raiz
      ...(configCredentials || {}) // Depois usa credenciais do config se não existirem no nível raiz
    };

    return {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type as 'action' | 'internal',
      data: {
        type: actionDefinition.type as 'action' | 'internal',
        app: actionDefinition.subcategory as 'whatsapp' | 'instagram' | 'assistant' | 'openai' | 'conversion' | 'veo2' | 'klingai' | 'elevenlabs' | 'form' | 'klap' | undefined,
        name: actionDefinition.name,
        label: actionDefinition.label ?? actionDefinition.name,
        stop: false,
        input: actionDefinition.input || { variables: [] },
        output: actionDefinition.output || { text: '' },
        config: configWithoutCredentials, // Config sem credenciais e sem aninhamento
        credentials: finalCredentials, // Credenciais apenas no nível raiz
        icon: actionDefinition.icon,
        color: actionDefinition.color
      },
      position: position || {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };
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

    // Cria o nó usando a função createNode
    const newNode = createNode(actionDefinition);

    // Atualiza o input/output com os valores do actionConfig
    if (actionConfig.input) {
      newNode.data.input = actionConfig.input;
    }
    if (actionConfig.output) {
      newNode.data.output = actionConfig.output;
    }

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
    isLoading,
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
    getFlows,
    createNode,
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