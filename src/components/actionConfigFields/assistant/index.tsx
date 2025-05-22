import React, { useState, useEffect } from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useFlow } from "@/contexts/FlowContext"

interface AssistantConfigProps {
  selectedAction: {
    id: string;
    name: string;
  };
  actionConfig: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Record<string, unknown>;
    credentials?: Record<string, any>;
  };
  setActionConfig: (cfg: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Record<string, unknown>;
    credentials?: Record<string, any>;
  }) => void;
}

const emptyCredentials = {
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
    let newCredentials = { ...actionConfig.credentials };
    if (field.startsWith('model.')) {
      newCredentials.model = { ...newCredentials.model, [field.split('.')[1]]: value };
    } else if (field.startsWith('memory.')) {
      newCredentials.memory = { ...newCredentials.memory, [field.split('.')[1]]: value };
    } else {
      newCredentials[field] = value;
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
          {/* Só mostra o select se NÃO estiver criando nova instância */}
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
          {showCredentials && !isCreating && (
            <Button variant="outline" size="sm" onClick={() => setShowCredentials(false)}>
              Cancelar edição
            </Button>
          )}
        </div>
      </div>

      {/* Formulário de criação de nova instância */}
      {isCreating && newInstanceDraft && (
        <div className="space-y-2 border p-3 rounded-md bg-muted/50">
          <Label>Nome da Instância</Label>
          <Input
            value={newInstanceDraft.name}
            onChange={e => setNewInstanceDraft({ ...newInstanceDraft, name: e.target.value })}
          />
          <Label htmlFor="app">App</Label>
          <Input
            id="app"
            placeholder="Nome do App"
            value={newInstanceDraft.credencias.app || ''}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: { ...newInstanceDraft.credencias, app: e.target.value }
            })}
          />
          <Label htmlFor="idassistente">ID do Assistente</Label>
          <Input
            id="idassistente"
            placeholder="ID do Assistente"
            value={newInstanceDraft.credencias.idassistente || ''}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: { ...newInstanceDraft.credencias, idassistente: e.target.value }
            })}
          />
          <Label htmlFor="model.name">Modelo</Label>
          <Input
            id="model.name"
            placeholder="gpt-3.5-turbo"
            value={newInstanceDraft.credencias.model?.name || 'gpt-3.5-turbo'}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: {
                ...newInstanceDraft.credencias,
                model: { ...newInstanceDraft.credencias.model, name: e.target.value }
              }
            })}
          />
          <Label htmlFor="model.temperature">Temperatura</Label>
          <Input
            id="model.temperature"
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={newInstanceDraft.credencias.model?.temperature ?? 0.7}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: {
                ...newInstanceDraft.credencias,
                model: { ...newInstanceDraft.credencias.model, temperature: Number(e.target.value) }
              }
            })}
          />
          <Label htmlFor="memory.maxTokens">Máximo de Tokens</Label>
          <Input
            id="memory.maxTokens"
            type="number"
            min="0"
            value={newInstanceDraft.credencias.memory?.maxTokens ?? 2000}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: {
                ...newInstanceDraft.credencias,
                memory: { ...newInstanceDraft.credencias.memory, maxTokens: Number(e.target.value) }
              }
            })}
          />
          <Label htmlFor="memory.retentionPeriod">Período de Retenção</Label>
          <Input
            id="memory.retentionPeriod"
            placeholder="Ex: 1d, 7d, 30d"
            value={newInstanceDraft.credencias.memory?.retentionPeriod || '7d'}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: {
                ...newInstanceDraft.credencias,
                memory: { ...newInstanceDraft.credencias.memory, retentionPeriod: e.target.value }
              }
            })}
          />
          <Label htmlFor="tools">Ferramentas (JSON)</Label>
          <Input
            id="tools"
            type="text"
            placeholder='[{"tool":"nome","parameters":{}}]'
            value={JSON.stringify(newInstanceDraft.credencias.tools || [], null, 2)}
            onChange={e => {
              try {
                const tools = JSON.parse(e.target.value);
                setNewInstanceDraft({
                  ...newInstanceDraft,
                  credencias: { ...newInstanceDraft.credencias, tools }
                });
              } catch (err) {}
            }}
          />
          <div className="flex gap-2 mt-2">
            <Button variant="default" size="sm" onClick={handleSaveNewInstance}>
              Salvar
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancelCreate}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Edição de instância existente */}
      {showCredentials && !isCreating && (
        <>
          <div className="space-y-2">
            <Label htmlFor="app">App</Label>
            <Input
              id="app"
              placeholder="Nome do App"
              value={credentials.app || ''}
              onChange={e => handleCredentialsChange('app', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idassistente">ID do Assistente</Label>
            <Input
              id="idassistente"
              placeholder="ID do Assistente"
              value={credentials.idassistente || ''}
              onChange={e => handleCredentialsChange('idassistente', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model.name">Modelo</Label>
            <Input
              id="model.name"
              placeholder="gpt-3.5-turbo"
              value={credentials.model?.name || 'gpt-3.5-turbo'}
              onChange={e => handleCredentialsChange('model.name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model.temperature">Temperatura</Label>
            <Input
              id="model.temperature"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={credentials.model?.temperature ?? 0.7}
              onChange={e => handleCredentialsChange('model.temperature', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory.maxTokens">Máximo de Tokens</Label>
            <Input
              id="memory.maxTokens"
              type="number"
              min="0"
              value={credentials.memory?.maxTokens ?? 2000}
              onChange={e => handleCredentialsChange('memory.maxTokens', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory.retentionPeriod">Período de Retenção</Label>
            <Input
              id="memory.retentionPeriod"
              placeholder="Ex: 1d, 7d, 30d"
              value={credentials.memory?.retentionPeriod || '7d'}
              onChange={e => handleCredentialsChange('memory.retentionPeriod', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tools">Ferramentas (JSON)</Label>
            <Input
              id="tools"
              type="text"
              placeholder='[{"tool":"nome","parameters":{}}]'
              value={JSON.stringify(credentials.tools || [], null, 2)}
              onChange={e => {
                try {
                  const tools = JSON.parse(e.target.value);
                  handleCredentialsChange('tools', tools);
                } catch (err) {}
              }}
            />
          </div>
        </>
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
    credentials?: Record<string, any>;
  },
  setActionConfig: (cfg: {
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
    config: Record<string, unknown>;
    credentials?: Record<string, any>;
  }) => void
) {
  // fallback seguro para actionConfig e credentials
  const safeActionConfig = {
    config: {},
    credentials: { ...emptyCredentials },
    ...actionConfig,
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