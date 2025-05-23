import React, { useEffect, useState, type ReactElement } from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useFlow } from "@/contexts/FlowContext"
import { type Instance } from "@/lib/settingsTypes"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Interface para o output completo do nó
interface WhatsAppNodeOutput {
  type: 'text';
  text: string;
}

interface ImageOutput {
  type: 'image';
  originalUrl: string;
  caption: string;
}

interface VideoOutput {
  type: 'video';
  url: string;
}

interface FileOutput {
  type: 'file';
  url: string;
  fileName: string;
}

interface AudioOutput {
  type: 'audio';
  url: string;
}

type WhatsAppOutput = WhatsAppNodeOutput | ImageOutput | VideoOutput | FileOutput | AudioOutput;

interface WhatsAppConfigProps {
  config?: {
    to?: string;
    messageType?: 'text' | 'video' | 'image' | 'file' | 'audio';
    templateName?: string;
    templateLanguage?: string;
    components?: any[];
  };
  output?: WhatsAppOutput;

  updateConfig: (config: any) => void;
  updateCredentials: (field: string, value: string) => void;
  stop?: boolean;
  setStop?: (stop: boolean) => void;
  nodeType: 'whatsapp_send_message' | 'whatsapp_send_message_wait' | 'whatsapp_send_template' | 'whatsapp_send_template_wait';
}

export function WhatsAppConfig({ 
  config = {}, 
  output = { type: 'text', text: '' },
  updateConfig, 
  updateCredentials,
  setActionConfig,
  actionConfig,
  stop = true,
  setStop,
  nodeType
}: WhatsAppConfigProps & { 
  setActionConfig: (cfg: any) => void;
  actionConfig: {
    input?: Record<string, unknown>;
    output?: WhatsAppOutput;
    config: {
      to?: string;
      messageType?: 'text' | 'video' | 'image' | 'file' | 'audio';
      templateName?: string;
      templateLanguage?: string;
      components?: any[];
    };
    credentials?: {
      apiKey?: string;
      source?: string;
      appName?: string;
      webhook?: string;
      provider?: string;
    };
    stop?: boolean;
  };
}) {
  const { toast } = useToast()
  const { flowData, handleSaveFlow } = useFlow()
  const [selectedInstance, setSelectedInstance] = useState<string>("")
  const [showCredentials, setShowCredentials] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newInstanceDraft, setNewInstanceDraft] = useState<any>(null)
  const [localCredentials, setLocalCredentials] = useState<{
    appName?: string;
    source?: string;
    webhook?: string;
    apiKey?: string;
    provider?: string;
  }>({
    appName: '',
    source: '',
    webhook: '',
    apiKey: '',
    provider: 'whatsapp'
  });

  // Inicializa o output quando o componente monta ou quando messageType muda
  useEffect(() => {
    const messageType = config?.messageType || 'text'
    
    if (!output || (output.type !== messageType && (
      (messageType === 'text' && 'text' in output) ||
      (messageType === 'video' && 'url' in output) ||
      (messageType === 'image' && 'originalUrl' in output)
    ))) {
      let newOutput: WhatsAppOutput;
      
      switch (messageType) {
        case 'text':
          newOutput = { type: 'text', text: '' };
          break;
        case 'video':
          newOutput = { type: 'video', url: '' };
          break;
        case 'image':
          newOutput = { type: 'image', originalUrl: '', caption: '' };
          break;
        default:
          newOutput = { type: 'text', text: '' };
      }
      
      setActionConfig({
        ...actionConfig,
        output: newOutput
      })
    }
  }, [config?.messageType])

  // Carrega as instâncias do WhatsApp do settings
  const settings = flowData?.attributes?.data?.settings
  const whatsappInstances = (typeof settings === 'string' ? JSON.parse(settings) : settings)?.instances?.filter(
    (instance: any) => instance.credencias.provider === "whatsapp"
  ) || []

  // Função para gerar nome único
  const getNextInstanceName = () => {
    let idx = 1;
    let name: string;
    do {
      name = `WhatsApp ${idx}`;
      idx++;
    } while (whatsappInstances.some((i: any) => i.name === name));
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
        provider: "whatsapp",
        appName: "",
        source: "",
        webhook: "",
        apiKey: ""
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
  const handleInstanceSelect = (instanceName: string) => {
    const instance = whatsappInstances.find((i: any) => i.name === instanceName)
    if (instance) {
      setSelectedInstance(instanceName)
      setShowCredentials(false)
      setIsCreating(false)
      setNewInstanceDraft(null)
      setLocalCredentials({
        appName: instance.credencias.appName || '',
        source: instance.credencias.source || '',
        webhook: instance.credencias.webhook || '',
        apiKey: instance.credencias.apiKey || '',
        provider: 'whatsapp'
      })
      // Atualiza o config do nó mantendo as configurações existentes
      updateConfig({
        ...config
      })
    }
  }

  // Manipula mudanças nos campos do formulário
  const handleCredentialsChange = (field: string, value: string) => {
    if (isCreating) {
      if (field === 'name') {
        setNewInstanceDraft({ ...newInstanceDraft, name: value });
      } else {
        setNewInstanceDraft({
          ...newInstanceDraft,
          credencias: { ...newInstanceDraft.credencias, [field]: value }
        });
      }
    } else {
      setLocalCredentials(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Salva as credenciais quando o usuário terminar de editar
  const handleSaveCredentials = async () => {
    // Se não houver instância selecionada, cria uma nova
    if (!selectedInstance) {
      const newInstanceName = `WhatsApp ${whatsappInstances.length + 1}`
      setSelectedInstance(newInstanceName)

      // Atualiza o settings com a nova instância
      const currentSettings = typeof settings === 'string' ? JSON.parse(settings) : settings || { instances: [] }
      const newSettings = {
        ...currentSettings,
        instances: [
          ...(currentSettings.instances || []),
          {
            name: newInstanceName,
            credencias: {
              ...localCredentials,
              provider: "whatsapp"
            }
          }
        ]
      }

      // Salva o novo settings
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
        description: `A instância "${newInstanceName}" foi criada e selecionada.`
      })
    } else {
      // Atualiza a instância existente
      const currentSettings = typeof settings === 'string' ? JSON.parse(settings) : settings || { instances: [] }
      const updatedInstances = currentSettings.instances?.map((instance: any) => {
        if (instance.name === selectedInstance) {
          return {
            ...instance,
            credencias: {
              ...instance.credencias,
              ...localCredentials
            }
          }
        }
        return instance
      })

      // Salva o settings atualizado
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
    setShowCredentials(false);
  };

  const handleMessageTypeChange = (messageType: 'text' | 'video' | 'image' | 'file' | 'audio') => {
    const newConfig = { ...config, messageType };
    
    let newOutput: WhatsAppOutput;
    
    switch (messageType) {
      case 'text':
        newOutput = { 
          type: 'text', 
          text: (output as WhatsAppNodeOutput)?.text || '' 
        };
        break;
      case 'video':
        newOutput = { 
          type: 'video', 
          url: (output as VideoOutput)?.url || '' 
        };
        break;
      case 'image':
        newOutput = { 
          type: 'image', 
          originalUrl: (output as ImageOutput)?.originalUrl || '',
          caption: (output as ImageOutput)?.caption || ''
        };
        break;
      case 'file':
        newOutput = {
          type: 'file',
          url: (output as FileOutput)?.url || '',
          fileName: (output as FileOutput)?.fileName || ''
        };
        break;
      case 'audio':
        newOutput = {
          type: 'audio',
          url: (output as AudioOutput)?.url || ''
        };
        break;
      default:
        newOutput = { type: 'text', text: '' };
    }

    setActionConfig({
      ...actionConfig,
      config: newConfig,
      output: newOutput,
      stop: true
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="instance">Instância WhatsApp</Label>
        </div>
        <div className="flex gap-2 items-center">
          {!isCreating && (
            <Select value={selectedInstance} onValueChange={handleInstanceSelect} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {whatsappInstances.map((instance: any) => (
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
            <Button variant="secondary" size="sm" onClick={() => setShowCredentials(false)}>
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
          <Label htmlFor="appName">Nome do App</Label>
          <Input
            id="appName"
            placeholder="Nome do App"
            value={newInstanceDraft.credencias.appName || ''}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: { ...newInstanceDraft.credencias, appName: e.target.value }
            })}
          />
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="Source"
            value={newInstanceDraft.credencias.source || ''}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: { ...newInstanceDraft.credencias, source: e.target.value }
            })}
          />
          <Label htmlFor="webhook">Webhook</Label>
          <Input
            id="webhook"
            placeholder="Webhook URL"
            value={newInstanceDraft.credencias.webhook || ''}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: { ...newInstanceDraft.credencias, webhook: e.target.value }
            })}
          />
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            placeholder="API Key"
            value={newInstanceDraft.credencias.apiKey || ''}
            onChange={e => setNewInstanceDraft({
              ...newInstanceDraft,
              credencias: { ...newInstanceDraft.credencias, apiKey: e.target.value }
            })}
          />
        </div>
      )}

      {/* Edição de instância existente */}
      {showCredentials && !isCreating && (
        <div className="space-y-2 border p-3 rounded-md bg-muted/50">
          <Label htmlFor="appName">Nome do App</Label>
          <Input
            id="appName"
            placeholder="Nome do App"
            value={localCredentials?.appName || ''}
            onChange={e => handleCredentialsChange('appName', e.target.value)}
          />
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            placeholder="Source"
            value={localCredentials?.source || ''}
            onChange={e => handleCredentialsChange('source', e.target.value)}
          />
          <Label htmlFor="webhook">Webhook</Label>
          <Input
            id="webhook"
            placeholder="Webhook URL"
            value={localCredentials?.webhook || ''}
            onChange={e => handleCredentialsChange('webhook', e.target.value)}
          />
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            placeholder="API Key"
            value={localCredentials?.apiKey || ''}
            onChange={e => handleCredentialsChange('apiKey', e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" size="sm" onClick={handleSaveCredentials}>
              Salvar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowCredentials(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Campos do nó: Número de Destino e Mensagem */}
      {!isCreating && !showCredentials && (
        <>
          <div className="space-y-2">
            <Label htmlFor="to">Número de Destino</Label>
            <Input
              id="to"
              placeholder="Ex: 5511999999999"
              value={config?.to || ''}
              onChange={(e) => {
                const newConfig = { ...config, to: e.target.value };
                updateConfig(newConfig);
                setActionConfig({
                  ...actionConfig,
                  config: newConfig,
                  stop: true
                });
              }}
            />
          </div>

          {/* Formulário simplificado para nós que não esperam resposta */}
          {(nodeType === 'whatsapp_send_message' || nodeType === 'whatsapp_send_template') && (
            <>
              {nodeType === 'whatsapp_send_message' ? (
                <div className="space-y-2">
                  <Label htmlFor="text">Mensagem</Label>
                  <Input
                    id="text"
                    placeholder="Digite sua mensagem"
                    value={(output as WhatsAppNodeOutput)?.text || ''}
                    onChange={e => setActionConfig({
                      ...actionConfig,
                      output: { 
                        type: 'text',
                        text: e.target.value
                      }
                    })}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="templateName">Nome do Template</Label>
                  <Input
                    id="templateName"
                    placeholder="Nome do template"
                    value={config?.templateName || ''}
                    onChange={(e) => {
                      const newConfig = { ...config, templateName: e.target.value };
                      updateConfig(newConfig);
                      setActionConfig({
                        ...actionConfig,
                        config: newConfig,
                        stop: true
                      });
                    }}
                  />

                  <Label htmlFor="templateLanguage">Idioma do Template</Label>
                  <Input
                    id="templateLanguage"
                    placeholder="pt_BR"
                    value={config?.templateLanguage || ''}
                    onChange={(e) => {
                      const newConfig = { ...config, templateLanguage: e.target.value };
                      updateConfig(newConfig);
                      setActionConfig({
                        ...actionConfig,
                        config: newConfig,
                        stop: true
                      });
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Formulário completo para nós que esperam resposta */}
          {(nodeType === 'whatsapp_send_message_wait' || nodeType === 'whatsapp_send_template_wait') && (
            <>
              {nodeType === 'whatsapp_send_message_wait' && (
                <div className="space-y-2">
                  <Label htmlFor="messageType">Tipo de Mensagem</Label>
                  <select
                    id="messageType"
                    className="w-full text border border-gray-600 rounded-md px-3 py-2"
                    value={config?.messageType || 'text'}
                    onChange={e => handleMessageTypeChange(e.target.value as 'text' | 'video' | 'image' | 'file' | 'audio')}
                  >
                    <option value="text">Texto</option>
                    <option value="video">Vídeo</option>
                    <option value="image">Imagem</option>
                    <option value="file">Arquivo</option>
                    <option value="audio">Áudio</option>
                  </select>

                  {config?.messageType === 'text' && (
                    <div className="space-y-2">
                      <Label htmlFor="text">Mensagem de Texto</Label>
                      <Input
                        id="text"
                        placeholder="Digite sua mensagem"
                        value={(output as WhatsAppNodeOutput)?.text || ''}
                        onChange={e => setActionConfig({
                          ...actionConfig,
                          output: { 
                            type: 'text',
                            text: e.target.value
                          }
                        })}
                      />
                    </div>
                  )}

                  {config?.messageType === 'video' && (
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">URL do Vídeo</Label>
                      <Input
                        id="videoUrl"
                        placeholder="URL do vídeo"
                        value={(output as VideoOutput)?.url || ''}
                        onChange={e => setActionConfig({
                          ...actionConfig,
                          output: { 
                            type: 'video',
                            url: e.target.value
                          }
                        })}
                      />
                    </div>
                  )}

                  {config?.messageType === 'image' && (
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">URL da Imagem</Label>
                      <Input
                        id="imageUrl"
                        placeholder="URL da imagem"
                        value={(output as ImageOutput)?.originalUrl || ''}
                        onChange={e => setActionConfig({
                          ...actionConfig,
                          output: { 
                            type: 'image',
                            originalUrl: e.target.value,
                            caption: (output as ImageOutput)?.caption || ''
                          }
                        })}
                      />
                      <Label htmlFor="caption">Legenda</Label>
                      <Input
                        id="caption"
                        placeholder="Legenda da imagem"
                        value={(output as ImageOutput)?.caption || ''}
                        onChange={e => setActionConfig({
                          ...actionConfig,
                          output: { 
                            type: 'image',
                            originalUrl: (output as ImageOutput)?.originalUrl || '',
                            caption: e.target.value
                          }
                        })}
                      />
                    </div>
                  )}

                  {config?.messageType === 'file' && (
                    <div className="space-y-2">
                      <Label htmlFor="fileUrl">URL do Arquivo</Label>
                      <Input
                        id="fileUrl"
                        placeholder="URL do arquivo"
                        value={(output as FileOutput)?.url || ''}
                        onChange={e => setActionConfig({
                          ...actionConfig,
                          output: { 
                            type: 'file',
                            url: e.target.value,
                            fileName: (output as FileOutput)?.fileName || ''
                          }
                        })}
                      />
                      <Label htmlFor="fileName">Nome do Arquivo</Label>
                      <Input
                        id="fileName"
                        placeholder="Nome do arquivo"
                        value={(output as FileOutput)?.fileName || ''}
                        onChange={e => setActionConfig({
                          ...actionConfig,
                          output: { 
                            type: 'file',
                            url: (output as FileOutput)?.url || '',
                            fileName: e.target.value
                          }
                        })}
                      />
                    </div>
                  )}

                  {config?.messageType === 'audio' && (
                    <div className="space-y-2">
                      <Label htmlFor="audioUrl">URL do Áudio</Label>
                      <Input
                        id="audioUrl"
                        placeholder="URL do áudio"
                        value={(output as AudioOutput)?.url || ''}
                        onChange={e => setActionConfig({
                          ...actionConfig,
                          output: { 
                            type: 'audio',
                            url: e.target.value
                          }
                        })}
                      />
                    </div>
                  )}
                </div>
              )}

              {nodeType === 'whatsapp_send_template_wait' && (
                <div className="space-y-2">
                  <Label htmlFor="templateName">Nome do Template</Label>
                  <Input
                    id="templateName"
                    placeholder="Nome do template"
                    value={config?.templateName || ''}
                    onChange={(e) => {
                      const newConfig = { ...config, templateName: e.target.value };
                      updateConfig(newConfig);
                      setActionConfig({
                        ...actionConfig,
                        config: newConfig,
                        stop: true
                      });
                    }}
                  />

                  <Label htmlFor="templateLanguage">Idioma do Template</Label>
                  <Input
                    id="templateLanguage"
                    placeholder="pt_BR"
                    value={config?.templateLanguage || ''}
                    onChange={(e) => {
                      const newConfig = { ...config, templateLanguage: e.target.value };
                      updateConfig(newConfig);
                      setActionConfig({
                        ...actionConfig,
                        config: newConfig,
                        stop: true
                      });
                    }}
                  />
                </div>
              )}

              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Este nó irá aguardar uma resposta do usuário antes de continuar o fluxo.
                  A resposta será armazenada na variável de saída do nó.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export function renderWhatsAppConfigFields(
  selectedAction: { id: string; name: string },
  actionConfig: {
    input?: Record<string, unknown>;
    output?: WhatsAppOutput;
    config: {
      to?: string;
      messageType?: 'text' | 'video' | 'image' | 'file' | 'audio';
      templateName?: string;
      templateLanguage?: string;
      components?: any[];
    };
    credentials?: {
      apiKey?: string;
      source?: string;
      appName?: string;
      webhook?: string;
      provider?: string;
    };
    stop?: boolean;
  },
  setActionConfig: (cfg: any) => void
): ReactElement {
  const updateConfig = (newConfig: any): void => {
    setActionConfig({
      ...actionConfig,
      config: newConfig,
      stop: true
    });
  };

  const updateCredentials = (field: string, value: string): void => {
    // Não armazena as credenciais no nó, apenas atualiza o estado local
    setActionConfig({
      ...actionConfig,
      stop: true
    });
  };

  return (
    <WhatsAppConfig
      config={actionConfig.config}
      output={actionConfig.output}
      updateConfig={updateConfig}
      updateCredentials={updateCredentials}
      setActionConfig={setActionConfig}
      actionConfig={actionConfig}
      stop={actionConfig.stop}
      setStop={(stop: boolean) => setActionConfig({ ...actionConfig, stop })}
      nodeType={selectedAction.id as 'whatsapp_send_message' | 'whatsapp_send_message_wait' | 'whatsapp_send_template' | 'whatsapp_send_template_wait'}
    />
  );
} 