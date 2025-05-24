import React, { useState, useEffect } from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useFlow } from "@/contexts/FlowContext"
import { AssistantFormFields } from './AssistantFormFields'

interface AssistantCredentials {
  app: string;
  idassistente: string;
  model: {
    name: string;
    temperature: number;
  };
  memory: {
    maxTokens: number;
    retentionPeriod: string;
  };
  tools: any[];
}

interface AssistantConfigProps {
  selectedAction: {
    id: string;
    name: string;
  };
  actionConfig: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Record<string, unknown>;
    credentials?: AssistantCredentials;
  };
  setActionConfig: (cfg: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Record<string, unknown>;
    credentials?: AssistantCredentials;
  }) => void;
}

const emptyCredentials: AssistantCredentials = {
  app: "",
  idassistente: "",
  memory: {
    maxTokens: 2000,
    retentionPeriod: "7d"
  },
  model: {
    name: "gpt-3.5-turbo",
    temperature: 0.7
  },
  tools: []
};

export function AssistantConfig({ 
  selectedAction,
  actionConfig = { config: {}, credentials: { ...emptyCredentials } },
  setActionConfig
}: AssistantConfigProps) {
  const { toast } = useToast()
  const { flowData, handleSaveFlow } = useFlow()
  const [selectedInstance, setSelectedInstance] = useState<string>("")
  const [showCredentials, setShowCredentials] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newInstanceDraft, setNewInstanceDraft] = useState<any>(null)

  // Sempre inicializa credentials como objeto simples
  useEffect(() => {
    if (!actionConfig.credentials) {
      setActionConfig({
        ...actionConfig,
        credentials: { ...emptyCredentials }
      });
    }
  }, [actionConfig, setActionConfig]);

  // Carrega as instâncias do Assistant do settings
  const settings = flowData?.attributes?.data?.settings
  const assistantInstances = (typeof settings === 'string' ? JSON.parse(settings) : settings)?.instances?.filter(
    (instance: any) => instance.credencias.provider === "assistant"
  ) || []

  // Função para gerar nome único
  const getNextInstanceName = () => {
    let idx = 1;
    let name: string;
    do {
      name = `Assistant ${idx}`;
      idx++;
    } while (assistantInstances.some((i: any) => i.name === name));
    return name;
  };

  // Ao clicar em Nova Instância, só abre o formulário
  const handleCreateInstance = () => {
    const newName = getNextInstanceName();
    setIsCreating(true);
    setShowCredentials(true);
    setSelectedInstance("");
    setNewInstanceDraft({
      name: newName,
      credencias: {
        provider: "assistant",
        app: "",
        idassistente: "",
        memory: {
          maxTokens: 2000,
          retentionPeriod: "7d"
        },
        model: {
          name: "gpt-3.5-turbo",
          temperature: 0.7
        },
        tools: []
      }
    });
  }

  // Salva a nova instância
  const handleSaveNewInstance = async () => {
    const currentSettings = typeof settings === 'string' ? JSON.parse(settings) : settings || { instances: [] }
    const newSettings = {
      ...currentSettings,
      instances: [
        ...(currentSettings.instances || []),
        newInstanceDraft
      ]
    }
    await handleSaveFlow({
      nodes: flowData?.attributes?.data?.nodes || [],
      edges: flowData?.attributes?.data?.edges || [],
      name: flowData?.attributes?.name,
      status: flowData?.attributes?.status,
      description: flowData?.attributes?.description,
      settings: newSettings
    })
    toast({
      title: "Nova instância criada",
      description: `A instância "${newInstanceDraft.name}" foi criada. Configure as credenciais abaixo.`
    })
    setSelectedInstance(newInstanceDraft.name)
    setIsCreating(false)
    setShowCredentials(false)
    setNewInstanceDraft(null)
  }

  // Cancela a criação
  const handleCancelCreate = () => {
    setIsCreating(false)
    setShowCredentials(false)
    setNewInstanceDraft(null)
  }

  // Seleciona instância (não abre edição automaticamente)
  const handleInstanceChange = (instanceName: string) => {
    setSelectedInstance(instanceName)
    setShowCredentials(false)
    setIsCreating(false)
    setNewInstanceDraft(null)
    const instance = assistantInstances.find((i: any) => i.name === instanceName)
    if (instance) {
      setActionConfig({
        ...actionConfig,
        credentials: { ...instance.credencias }
      })
    }
  }

  // Atualiza campo de credentials
  const handleCredentialsChange = async (field: string, value: any) => {
    let newCredentials = { ...actionConfig.credentials } as AssistantCredentials;
    
    if (field.startsWith('model.')) {
      const modelField = field.split('.')[1];
      newCredentials.model = { 
        ...newCredentials.model,
        [modelField]: value 
      };
    } else if (field.startsWith('memory.')) {
      const memoryField = field.split('.')[1];
      newCredentials.memory = { 
        ...newCredentials.memory,
        [memoryField]: value 
      };
    } else if (field === 'tools') {
      newCredentials.tools = value;
    } else {
      newCredentials = {
        ...newCredentials,
        [field]: value
      };
    }

    setActionConfig({ ...actionConfig, credentials: newCredentials });

    // Atualiza instância no settings se houver uma selecionada
    if (selectedInstance) {
      const currentSettings = typeof settings === 'string' ? JSON.parse(settings) : settings || { instances: [] }
      const updatedInstances = currentSettings.instances?.map((instance: any) => {
        if (instance.name === selectedInstance) {
          return {
            ...instance,
            credencias: { ...newCredentials, provider: "assistant" }
          }
        }
        return instance
      })
      await handleSaveFlow({
        nodes: flowData?.attributes?.data?.nodes || [],
        edges: flowData?.attributes?.data?.edges || [],
        name: flowData?.attributes?.name,
        status: flowData?.attributes?.status,
        description: flowData?.attributes?.description,
        settings: {
          ...currentSettings,
          instances: updatedInstances
        }
      })
    }
  }

  const credentials = actionConfig.credentials || emptyCredentials;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="instance">Instância Assistant</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateInstance}
            className="flex items-center gap-2"
            disabled={isCreating}
          >
            <Plus className="h-4 w-4" />
            Nova Instância
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          {!isCreating && (
            <Select value={selectedInstance} onValueChange={handleInstanceChange} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {assistantInstances.map((instance: any) => (
                  <SelectItem key={instance.name} value={instance.name}>
                    {instance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedInstance && !showCredentials && !isCreating && (
            <Button variant="secondary" size="sm" onClick={() => setShowCredentials(true)}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Formulário de criação de nova instância */}
      {isCreating && newInstanceDraft && (
        <AssistantFormFields
          open={isCreating}
          onOpenChange={setIsCreating}
          values={newInstanceDraft}
          onChange={(field, value) => {
            if (field === 'name') {
              setNewInstanceDraft({ ...newInstanceDraft, name: value });
            } else {
              setNewInstanceDraft({
                ...newInstanceDraft,
                credencias: { ...newInstanceDraft.credencias, [field]: value }
              });
            }
          }}
          onSave={handleSaveNewInstance}
          onCancel={handleCancelCreate}
          title="Nova Instância"
        />
      )}

      {/* Edição de instância existente */}
      {showCredentials && !isCreating && (
        <AssistantFormFields
          open={showCredentials}
          onOpenChange={setShowCredentials}
          values={{ credencias: credentials }}
          onChange={handleCredentialsChange}
          onSave={() => setShowCredentials(false)}
          onCancel={() => setShowCredentials(false)}
          title={`Editar Instância: ${selectedInstance}`}
        />
      )}
    </div>
  )
}

export function renderAssistantConfigFields(
  selectedAction: { id: string; name: string },
  actionConfig: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Record<string, unknown>;
    credentials?: AssistantCredentials;
  },
  setActionConfig: (cfg: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Record<string, unknown>;
    credentials?: AssistantCredentials;
  }) => void
) {
  // fallback seguro para actionConfig e credentials
  const safeActionConfig = {
    ...actionConfig,
    config: actionConfig?.config || {},
    credentials: { ...emptyCredentials, ...(actionConfig?.credentials || {}) }
  };
  return (
    <AssistantConfig
      selectedAction={selectedAction}
      actionConfig={safeActionConfig}
      setActionConfig={setActionConfig}
    />
  );
} 