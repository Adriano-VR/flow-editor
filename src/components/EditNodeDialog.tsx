import {  Trash, MessageSquare, Brain, Timer, Play, List, Wrench, Code, FileText, User, Thermometer, Database, Hash, Clock, SaveAll, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Node } from '@/types/flow';
import { useState, useEffect } from 'react';
import { IconRenderer } from '@/lib/IconRenderer';
import { renderActionConfigFields } from '@/components/actionConfigFields';

interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNode: Node | null;
  onSave: (node: Node) => void;
  onDelete: () => void;
}

export function EditNodeDialog({ open, onOpenChange, editingNode, onSave, onDelete }: EditNodeDialogProps) {
  const [localNode, setLocalNode] = useState<Node | null>(null);

  useEffect(() => {
    if (editingNode) {
      setLocalNode(editingNode);
    }
  }, [editingNode]);

  if (!editingNode || !localNode) return null;

  const handleSave = () => {
    onSave(localNode);
    onOpenChange(false);
  };

  const isEndNode = localNode.data.label === 'Fim';
  const isConditionNode = localNode.data.label === 'Condição';

  const getNodeIcon = () => {
    switch (localNode.data.name) {
      case 'whatsapp':
        return 'message-square';
      case 'openAi':
        return 'brain';
      case 'internal':
        return localNode.data.label === 'Atraso' ? 'timer' : 'play';
      default:
        return 'code';
    }
  };

  // Encontra a definição do nó nos tipos de nó disponíveis
  const getActionDefinition = () => {
    // Constrói o actionDefinition no mesmo formato que o IntegrationDialog recebe
    return {
      id: localNode.id.split('-')[0], // Extrai o ID original da ação
      ...localNode.data,
      config: localNode.data.config || {}
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-white max-w-md w-full p-0 rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-[#23272f]">
        <DialogTitle className="sr-only">Editar Nó</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-700 bg-[#23272f]">
          <div className="flex items-center gap-3">
            <IconRenderer iconName={getNodeIcon()} className="text-2xl text-green-500" />
            <span className="text-lg font-semibold">{localNode.data.label}</span>
          </div>
         
        </div>

        {/* Content */}
        <div className="px-6 py-4 bg-[#23272f] min-h-[250px] overflow-auto">
          <div className="[&_input]:bg-[#2d3748] [&_input]:text-white [&_input]:border-gray-600 [&_input]:focus:border-green-500 [&_input]:focus:ring-green-500 [&_input]:placeholder-gray-400 [&_select]:bg-[#2d3748] [&_select]:text-white [&_select]:border-gray-600 [&_select]:focus:border-green-500 [&_select]:focus:ring-green-500 [&_textarea]:bg-[#2d3748] [&_textarea]:text-white [&_textarea]:border-gray-600 [&_textarea]:focus:border-green-500 [&_textarea]:focus:ring-green-500">
            {(isEndNode || isConditionNode) && (
              <div className="mb-4 p-3 bg-[#2d3748] rounded-md">
                <Label className="flex items-center gap-2 text-gray-300">
                  <Info className="w-4 h-4" />
                  Este nó só possui conexão de entrada
                </Label>
              </div>
            )}

            {/* WhatsApp Node */}
            {localNode.data.name === 'whatsapp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Número do WhatsApp
                  </Label>
                  <Input
                    id="to"
                    placeholder="+55 (00) 00000-0000"
                    value={localNode.data.config?.to || ''}
                    onChange={(e) => {
                      setLocalNode({
                        ...localNode,
                        data: {
                          ...localNode.data,
                          config: {
                            ...(localNode.data.config || {}),
                            to: e.target.value
                          }
                        }
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mensagem
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Digite sua mensagem"
                    value={localNode.data.config?.message || ''}
                    onChange={(e) => {
                      setLocalNode({
                        ...localNode,
                        data: {
                          ...localNode.data,
                          config: {
                            ...(localNode.data.config || {}),
                            message: e.target.value
                          }
                        }
                      });
                    }}
                  />
                </div>
              </div>
            )}

            {/* OpenAI Node */}
            {localNode.data.name === 'openAi' && (
              <>
                {localNode.data.label === 'Modelo' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="model" className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Modelo
                      </Label>
                      <Select
                        value={localNode.data.config?.model || 'gpt-3.5-turbo'}
                        onValueChange={(value) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                model: value
                              }
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prompt" className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Prompt
                      </Label>
                      <Textarea
                        id="prompt"
                        placeholder="Digite o prompt"
                        value={localNode.data.config?.prompt || ''}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                prompt: e.target.value
                              }
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature" className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        Temperatura
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={localNode.data.config?.temperature || 0.7}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                temperature: parseFloat(e.target.value)
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                {localNode.data.label === 'Memória' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memoryType" className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Tipo de Memória
                      </Label>
                      <Select
                        value={localNode.data.config?.memoryType || 'conversation'}
                        onValueChange={(value) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                memoryType: value
                              }
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conversation">Conversa</SelectItem>
                          <SelectItem value="summary">Resumo</SelectItem>
                          <SelectItem value="vector">Vetorial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens" className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Máximo de Tokens
                      </Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="1"
                        value={localNode.data.config?.maxTokens || 1000}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                maxTokens: parseInt(e.target.value)
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                {localNode.data.label === 'Ferramenta' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="toolName" className="flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Nome da Ferramenta
                      </Label>
                      <Input
                        id="toolName"
                        placeholder="Digite o nome da ferramenta"
                        value={localNode.data.config?.toolName || ''}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                toolName: e.target.value
                              }
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toolDescription" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Descrição
                      </Label>
                      <Textarea
                        id="toolDescription"
                        placeholder="Descreva a funcionalidade da ferramenta"
                        value={localNode.data.config?.toolDescription || ''}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                toolDescription: e.target.value
                              }
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parameters" className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Parâmetros (JSON)
                      </Label>
                      <Textarea
                        id="parameters"
                        placeholder='{"param1": "valor1", "param2": "valor2"}'
                        value={typeof localNode.data.config?.parameters === 'string' 
                          ? localNode.data.config.parameters 
                          : JSON.stringify(localNode.data.config?.parameters || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  parameters: parsed as Record<string, unknown>
                                }
                              }
                            });
                          } catch {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  parameters: {}
                                }
                              }
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {localNode.data.label === 'Criar Agente' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nome do Agente
                      </Label>
                      <Input
                        id="agentName"
                        placeholder="Digite o nome do agente"
                        value={localNode.data.config?.agentName || ''}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                agentName: e.target.value
                              }
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentDescription" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Descrição
                      </Label>
                      <Textarea
                        id="agentDescription"
                        placeholder="Descreva o propósito do agente"
                        value={localNode.data.config?.agentDescription || ''}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                agentDescription: e.target.value
                              }
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capabilities" className="flex items-center gap-2">
                        <List className="w-4 h-4" />
                        Capacidades
                      </Label>
                      <Textarea
                        id="capabilities"
                        placeholder="Liste as capacidades do agente (uma por linha)"
                        value={localNode.data.config?.capabilities?.join('\n') || ''}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                capabilities: e.target.value.split('\n').filter(v => v.trim())
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Internal Node */}
            {localNode.data.name === 'internal' && (
              <>
                {localNode.data.label === 'Atraso' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duração
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        placeholder="Digite a duração"
                        value={localNode.data.config?.duration || 0}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                duration: parseInt(e.target.value) || 0
                              }
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit" className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        Unidade
                      </Label>
                      <Select
                        value={localNode.data.config?.unit || 'seconds'}
                        onValueChange={(value: 'seconds' | 'minutes' | 'hours') => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                unit: value
                              }
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">Segundos</SelectItem>
                          <SelectItem value="minutes">Minutos</SelectItem>
                          <SelectItem value="hours">Horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {localNode.data.label === 'Início' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="condition" className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Condição de Início
                      </Label>
                      <Textarea
                        id="condition"
                        placeholder="Digite a condição de início (opcional)"
                        value={localNode.data.config?.condition || ''}
                        onChange={(e) => {
                          setLocalNode({
                            ...localNode,
                            data: {
                              ...localNode.data,
                              config: {
                                ...(localNode.data.config || {}),
                                condition: e.target.value
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {renderActionConfigFields(
              getActionDefinition(),
              localNode.data.config || {},
              (newConfig) => {
                setLocalNode({
                  ...localNode,
                  data: {
                    ...localNode.data,
                    config: newConfig
                  }
                });
              }
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-3 bg-[#23272f] border-t border-gray-700">
          <div className="cursor-pointer" onClick={() => {
            onDelete();
            onOpenChange(false);
          }}>
            <Trash className="text-red-400" />
          </div>
          <div className="cursor-pointer" onClick={handleSave}>
            <SaveAll className="text-green-500" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 