import { Pencil, Trash, Save, MessageSquare, Brain, Timer, Play, List, Wrench, Code, FileText, User, Thermometer, Database, Hash, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Node } from '@/types/flow';

interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNode: Node | null;
  onSave: (node: Node) => void;
  onDelete: () => void;
}

export function EditNodeDialog({ open, onOpenChange, editingNode, onSave, onDelete }: EditNodeDialogProps) {
  if (!editingNode) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Editar Nó
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {editingNode.data.name === 'whatsapp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Número do WhatsApp
                </Label>
                <Input
                  id="to"
                  placeholder="+55 (00) 00000-0000"
                  value={editingNode.data.config?.to || ''}
                  onChange={(e) => {
                    onSave({
                      ...editingNode,
                      data: {
                        ...editingNode.data,
                        config: {
                          ...(editingNode.data.config || {}),
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
                  value={editingNode.data.config?.message || ''}
                  onChange={(e) => {
                    onSave({
                      ...editingNode,
                      data: {
                        ...editingNode.data,
                        config: {
                          ...(editingNode.data.config || {}),
                          message: e.target.value
                        }
                      }
                    });
                  }}
                />
              </div>
            </div>
          )}

          {editingNode.data.name === 'openAi' && (
            <>
              {editingNode.data.label === 'Modelo' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model" className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Modelo
                    </Label>
                    <Select
                      value={editingNode.data.config?.model || 'gpt-3.5-turbo'}
                      onValueChange={(value) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={editingNode.data.config?.prompt || ''}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={editingNode.data.config?.temperature || 0.7}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
                              temperature: parseFloat(e.target.value)
                            }
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {editingNode.data.label === 'Memória' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memoryType" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Tipo de Memória
                    </Label>
                    <Select
                      value={editingNode.data.config?.memoryType || 'conversation'}
                      onValueChange={(value) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={editingNode.data.config?.maxTokens || 1000}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
                              maxTokens: parseInt(e.target.value)
                            }
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {editingNode.data.label === 'Ferramenta' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="toolName" className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Nome da Ferramenta
                    </Label>
                    <Input
                      id="toolName"
                      placeholder="Digite o nome da ferramenta"
                      value={editingNode.data.config?.toolName || ''}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={editingNode.data.config?.toolDescription || ''}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={typeof editingNode.data.config?.parameters === 'string' 
                        ? editingNode.data.config.parameters 
                        : JSON.stringify(editingNode.data.config?.parameters || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          onSave({
                            ...editingNode,
                            data: {
                              ...editingNode.data,
                              config: {
                                ...(editingNode.data.config || {}),
                                parameters: parsed as Record<string, unknown>
                              }
                            }
                          });
                        } catch {
                          onSave({
                            ...editingNode,
                            data: {
                              ...editingNode.data,
                              config: {
                                ...(editingNode.data.config || {}),
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

              {editingNode.data.label === 'Criar Agente' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome do Agente
                    </Label>
                    <Input
                      id="agentName"
                      placeholder="Digite o nome do agente"
                      value={editingNode.data.config?.agentName || ''}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={editingNode.data.config?.agentDescription || ''}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={editingNode.data.config?.capabilities?.join('\n') || ''}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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

          {editingNode.data.name === 'internal' && (
            <>
              {editingNode.data.label === 'Atraso' && (
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
                      value={editingNode.data.config?.duration || 0}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
                      value={editingNode.data.config?.unit || 'seconds'}
                      onValueChange={(value: 'seconds' | 'minutes' | 'hours') => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
              {editingNode.data.label === 'Início' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Condição de Início
                    </Label>
                    <Textarea
                      id="condition"
                      placeholder="Digite a condição de início (opcional)"
                      value={editingNode.data.config?.condition || ''}
                      onChange={(e) => {
                        onSave({
                          ...editingNode,
                          data: {
                            ...editingNode.data,
                            config: {
                              ...(editingNode.data.config || {}),
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
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={onDelete}
              variant="destructive"
              className="flex items-center gap-2 group-hover:cursor-pointer"
            >
              <Trash className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => onSave(editingNode)}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 