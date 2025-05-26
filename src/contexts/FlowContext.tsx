"use client"
import { useReactFlow } from 'reactflow';

import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { createFlow, getFlow, updateFlow, deleteFlow, getFlows } from "@/lib/api";
import { nodeTypes as nodeTypeDefinitions } from "@/lib/nodeTypes";
import { Flow, Node, Edge, Action, ActionConfig } from "@/types/flow";
import { Settings } from '@/lib/settingsTypes';
import { NodeTypeDefinition } from '@/lib/nodeTypes';

// Definindo o tipo FlowResponse localmente
interface FlowResponse {
  data: Flow;
  message?: string;
  error?: string;
}

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
  actionConfig: ActionConfig;
  setActionConfig: (config: ActionConfig) => void;
  handleCreateFlow: (name: string) => Promise<string | null>;
  handleDeleteFlow: (flowId: string) => Promise<void>;
  handleSaveFlow: (data: { nodes: Node[]; edges: Edge[]; name?: string; status?: string; description?: string; settings?: Settings }) => Promise<FlowResponse>;
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
  const [actionConfig, setActionConfig] = useState<ActionConfig>({});
  const [flows, setFlows] = useState<Flow[]>([]);
  const { screenToFlowPosition } = useReactFlow();

  const handleCreateFlow = async (name: string): Promise<string | null> => {
    if (!name.trim()) return null;

    try {
      setIsCreating(true);
      const flowData = {
        name: name.trim(),
        status: "draft",
        billing: "free",
        published: true,
        uuid: crypto.randomUUID(),  
        data: {
          nodes: [],
          edges: [],
          settings: {}
        }
      };

      const response = await createFlow(flowData as unknown as Partial<Flow>);


      if (response && response.data && response.data.id) {
        const updatedResponse = await getFlows();
        console.log('updatedResponse', updatedResponse);
        setFlows(updatedResponse.data);
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
      
      if (selectedFlowId === flowId) {
        setSelectedFlowId(null);
        setFlowData(null);
      }
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
        setIsLoading(true);
        const response = await getFlows();
        console.log(response);
        setFlows(response.data);
      } catch (err) {
        console.error('Error fetching flows:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlows();
    console.log('flows', flows);
  }, []);

  useEffect(() => {
    const loadFlowData = async () => {
      if (selectedFlowId) {
        try {
          const response = await getFlow(selectedFlowId);
          const newFlowData = response.data;
          setFlowData(newFlowData);
          if (newFlowData?.name) {
            setFlowName(newFlowData.name);
          }
        } catch (error) {
          console.error('Error loading flow:', error);
        }
      } else {
        setFlowData(null);
        setFlowName("");
      }
    };

    loadFlowData();
  }, [selectedFlowId]);

  const handleSaveFlow = async (data: { nodes: Node[]; edges: Edge[]; name?: string; status?: string; description?: string; settings?: Settings }): Promise<FlowResponse> => {
    if (!selectedFlowId) {
      console.error('No flow selected');
      throw new Error('No flow selected');
    }

    try {
      console.log('=== handleSaveFlow Debug ===');
      console.log('1. Received data:', data);
      console.log('2. Nodes count in received data:', data.nodes.length);
      console.log('3. Edges count in received data:', data.edges.length);
      
      const updatedName = data.name || flowData?.name;
      if (updatedName) {
        setFlowName(updatedName);
      }

      // Obtém as configurações atuais
      const currentSettings = flowData?.data?.settings;
      const settingsObject = typeof currentSettings === 'string' ? JSON.parse(currentSettings) : currentSettings || {};

      // Mescla as configurações existentes com as novas
      const mergedSettings = {
        ...settingsObject,
        ...(data.settings || {}),
        // Preserva as instâncias existentes e adiciona as novas
        instances: [
          ...(settingsObject.instances || []),
          ...(data.settings?.instances?.filter((newInstance: any) => 
            !settingsObject.instances?.some((existingInstance: any) => 
              existingInstance.name === newInstance.name && 
              existingInstance.credencias.provider === newInstance.credencias.provider
            )
          ) || [])
        ]
      };

      // Ensure we're sending the correct data structure
      const updateData = {
        name: updatedName,
        status: data.status || flowData?.status || "draft",
        description: data.description || flowData?.description || "",
        data: {
          nodes: Array.isArray(data.nodes) ? [...data.nodes] : [],
          edges: Array.isArray(data.edges) ? [...data.edges] : [],
          settings: mergedSettings
        }
      };

      console.log('4. Transformed updateData:', updateData);
      console.log('5. Nodes count in updateData:', updateData.data.nodes.length);
      console.log('6. Edges count in updateData:', updateData.data.edges.length);
      console.log('7. Instances count in updateData:', updateData.data.settings.instances?.length);

      const response = await updateFlow(selectedFlowId, updateData);
      console.log('8. API response:', response);

      if (response?.data) {
        console.log('9. Setting new flow data:', response.data);
        console.log('10. Nodes count in response:', response.data.data?.nodes?.length);
        console.log('11. Edges count in response:', response.data.data?.edges?.length);
        console.log('12. Instances count in response:', response.data.data?.settings?.instances?.length);
        setFlowData(response.data);
        return response;
      } else {
        throw new Error('No data returned from update');
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      throw error;
    }
  };

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    setActionConfig({});
    setIsActionModalOpen(true);
  };

  const createNode = (actionDefinition: NodeTypeDefinition, position?: { x: number; y: number }) => {
    const { 
      input: configInput, 
      output: configOutput, 
      credentials: configCredentials,
      config: nestedConfig, 
      ...restConfig 
    } = actionDefinition.config || {};

    const configWithoutCredentials = nestedConfig || restConfig;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const positionFlow = position || screenToFlowPosition({ x: centerX, y: centerY });

    return {
      id: `${actionDefinition.id}-${Date.now()}`,
      type: actionDefinition.type as 'action' | 'internal',
      data: {
        type: actionDefinition.type as 'action' | 'internal',
        app: actionDefinition.subcategory as any,
        name: actionDefinition.name,
        label: actionDefinition.label ?? actionDefinition.name,
        stop: actionDefinition.stop === undefined ? false : actionDefinition.stop,
        input: actionDefinition.input ? {
          variables: actionDefinition.input.variables ? [{ variable: actionDefinition.input.variables.nome }] : []
        } : { variables: [] },
        output: actionDefinition.output ? {
          text: actionDefinition.output.text || ''
        } : { text: '' },
        config: configWithoutCredentials as Record<string, unknown>,
        icon: actionDefinition.icon,
        color: actionDefinition.color
      },
      position: positionFlow || {
        x: 400,
        y: 300,
      },
    };
  };

  const handleActionConfigSubmit = async () => {
    if (!selectedAction || !flowData?.data || !selectedFlowId) return;

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

    const newNode = createNode(actionDefinition);

    if (actionConfig.input) {
      newNode.data.input = actionConfig.input;
    }
    if (actionConfig.output) {
      newNode.data.output = actionConfig.output;
    }

    const updatedData = {
      nodes: [...(flowData.data.nodes || []), newNode],
      edges: flowData.data.edges || [],
    };

    try {
      const response = await updateFlow(selectedFlowId, {
        name: flowName,
        status: "draft",
        billing: "free",
        published: true,
        data: updatedData
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
        name: flowData?.name || "Novo Flow",
        status: "draft",
        billing: "free",
        published: true,
        data: parsedJson
      });
      setFlowData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          data: parsedJson
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