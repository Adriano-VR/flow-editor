"use client"

import { useState, useEffect } from "react"
import {
  Trash,
  MessageSquare,
  Brain,
  Timer,
  Play,
  List,
  Wrench,
  Code,
  FileText,
  User,
  Thermometer,
  Database,
  Hash,
  Save,
  Info,
  X,
  Clock,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Node } from "@/types/flow"
import { IconRenderer } from "@/lib/IconRenderer"
import { renderActionConfigFields } from "@/components/actionConfigFields"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingNode: Node | null
  onSave: (node: Node) => void
  onDelete: () => void
}

export function EditNodeDialog({ open, onOpenChange, editingNode, onSave, onDelete }: EditNodeDialogProps) {
  const [localNode, setLocalNode] = useState<Node | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (editingNode) {
      setLocalNode(editingNode)
    }
  }, [editingNode])

  if (!editingNode || !localNode) return null

  const handleSave = async () => {
    try {
      setIsSaving(true)
      onSave(localNode)
      setTimeout(() => {
        setIsSaving(false)
        onOpenChange(false)
      }, 500)
    } catch (error) {
      console.error("Error saving node:", error)
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete()
        setIsDeleting(false)
        onOpenChange(false)
      }, 500)
    } catch (error) {
      console.error("Error deleting node:", error)
      setIsDeleting(false)
    }
  }

  const isEndNode = localNode.data.label === "Fim"
  const isConditionNode = localNode.data.label === "Condição"

  const getNodeIcon = () => {
    switch (localNode.data.name) {
      case "whatsapp":
        return "message-square"
      case "openAi":
        return "brain"
      case "internal":
        return localNode.data.label === "Atraso" ? "timer" : "play"
      default:
        return "code"
    }
  }

  const getNodeColor = () => {
    switch (localNode.data.name) {
      case "whatsapp":
        return "bg-green-100 text-green-700"
      case "openAi":
        return "bg-blue-100 text-blue-700"
      case "internal":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  // Encontra a definição do nó nos tipos de nó disponíveis
  const getActionDefinition = () => {
    // Constrói o actionDefinition no mesmo formato que o IntegrationDialog recebe
    return {
      id: localNode.id.split("-")[0], // Extrai o ID original da ação
      ...localNode.data,
      config: localNode.data.config || {},
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${getNodeColor()} flex items-center justify-center`}>
                <IconRenderer iconName={getNodeIcon()} className="text-xl" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {localNode.data.label}
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure as propriedades deste nó</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5 text-slate-500" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 py-4">
            {(isEndNode || isConditionNode) && (
              <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                <Info className="h-4 w-4" />
                <AlertDescription>Este nó só possui conexão de entrada</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* WhatsApp Node */}
              {localNode.data.name === "whatsapp" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="to" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      Número do WhatsApp
                    </Label>
                    <Input
                      id="to"
                      placeholder="+55 (00) 00000-0000"
                      value={localNode.data.config?.to || ""}
                      onChange={(e) => {
                        setLocalNode({
                          ...localNode,
                          data: {
                            ...localNode.data,
                            config: {
                              ...(localNode.data.config || {}),
                              to: e.target.value,
                            },
                          },
                        })
                      }}
                      className="border-slate-200 focus-visible:ring-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Número de telefone com código do país</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      Mensagem
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Digite sua mensagem"
                      value={localNode.data.config?.message || ""}
                      onChange={(e) => {
                        setLocalNode({
                          ...localNode,
                          data: {
                            ...localNode.data,
                            config: {
                              ...(localNode.data.config || {}),
                              message: e.target.value,
                            },
                          },
                        })
                      }}
                      className="min-h-24 border-slate-200 focus-visible:ring-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Você pode usar variáveis com a sintaxe {"{variavel}"}
                    </p>
                  </div>
                </div>
              )}

              {/* OpenAI Node */}
              {localNode.data.name === "openAi" && (
                <>
                  {localNode.data.label === "Modelo" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="model" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Brain className="w-4 h-4 text-blue-500" />
                          Modelo
                        </Label>
                        <Select
                          value={localNode.data.config?.model || "gpt-3.5-turbo"}
                          onValueChange={(value) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  model: value,
                                },
                              },
                            })
                          }}
                        >
                          <SelectTrigger className="border-slate-200 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Escolha o modelo de linguagem a ser utilizado
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prompt" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          Prompt
                        </Label>
                        <Textarea
                          id="prompt"
                          placeholder="Digite o prompt"
                          value={localNode.data.config?.prompt || ""}
                          onChange={(e) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  prompt: e.target.value,
                                },
                              },
                            })
                          }}
                          className="min-h-24 border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Instruções para o modelo de IA</p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="temperature"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Thermometer className="w-4 h-4 text-blue-500" />
                          Temperatura
                        </Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="temperature"
                            type="range"
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
                                    temperature: Number.parseFloat(e.target.value),
                                  },
                                },
                              })
                            }}
                            className="flex-1"
                          />
                          <span className="w-12 text-center font-mono bg-slate-100 py-1 px-2 rounded text-sm dark:bg-slate-800 dark:text-slate-200">
                            {localNode.data.config?.temperature || 0.7}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Controla a aleatoriedade das respostas (0 = determinístico, 2 = muito aleatório)
                        </p>
                      </div>
                    </div>
                  )}

                  {localNode.data.label === "Memória" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="memoryType"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Database className="w-4 h-4 text-blue-500" />
                          Tipo de Memória
                        </Label>
                        <Select
                          value={localNode.data.config?.memoryType || "conversation"}
                          onValueChange={(value) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  memoryType: value,
                                },
                              },
                            })
                          }}
                        >
                          <SelectTrigger className="border-slate-200 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conversation">Conversa</SelectItem>
                            <SelectItem value="summary">Resumo</SelectItem>
                            <SelectItem value="vector">Vetorial</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Escolha como o modelo armazenará o histórico de conversas
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="maxTokens"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Hash className="w-4 h-4 text-blue-500" />
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
                                  maxTokens: Number.parseInt(e.target.value),
                                },
                              },
                            })
                          }}
                          className="border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Limite máximo de tokens a serem armazenados na memória
                        </p>
                      </div>
                    </div>
                  )}

                  {localNode.data.label === "Ferramenta" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="toolName"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Wrench className="w-4 h-4 text-blue-500" />
                          Nome da Ferramenta
                        </Label>
                        <Input
                          id="toolName"
                          placeholder="Digite o nome da ferramenta"
                          value={localNode.data.config?.toolName || ""}
                          onChange={(e) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  toolName: e.target.value,
                                },
                              },
                            })
                          }}
                          className="border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Nome único que identifica esta ferramenta
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="toolDescription"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          Descrição
                        </Label>
                        <Textarea
                          id="toolDescription"
                          placeholder="Descreva a funcionalidade da ferramenta"
                          value={localNode.data.config?.toolDescription || ""}
                          onChange={(e) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  toolDescription: e.target.value,
                                },
                              },
                            })
                          }}
                          className="min-h-24 border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Explique para o modelo como esta ferramenta deve ser usada
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="parameters"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Code className="w-4 h-4 text-blue-500" />
                          Parâmetros (JSON)
                        </Label>
                        <Textarea
                          id="parameters"
                          placeholder='{"param1": "valor1", "param2": "valor2"}'
                          value={
                            typeof localNode.data.config?.parameters === "string"
                              ? localNode.data.config.parameters
                              : JSON.stringify(localNode.data.config?.parameters || {}, null, 2)
                          }
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              setLocalNode({
                                ...localNode,
                                data: {
                                  ...localNode.data,
                                  config: {
                                    ...(localNode.data.config || {}),
                                    parameters: parsed as Record<string, unknown>,
                                  },
                                },
                              })
                            } catch {
                              setLocalNode({
                                ...localNode,
                                data: {
                                  ...localNode.data,
                                  config: {
                                    ...(localNode.data.config || {}),
                                    parameters: {},
                                  },
                                },
                              })
                            }
                          }}
                          className="min-h-24 font-mono text-sm border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Defina os parâmetros que a ferramenta aceita em formato JSON
                        </p>
                      </div>
                    </div>
                  )}

                  {localNode.data.label === "Criar Agente" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="agentName"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <User className="w-4 h-4 text-blue-500" />
                          Nome do Agente
                        </Label>
                        <Input
                          id="agentName"
                          placeholder="Digite o nome do agente"
                          value={localNode.data.config?.agentName || ""}
                          onChange={(e) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  agentName: e.target.value,
                                },
                              },
                            })
                          }}
                          className="border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Nome que identifica este agente</p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="agentDescription"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          Descrição
                        </Label>
                        <Textarea
                          id="agentDescription"
                          placeholder="Descreva o propósito do agente"
                          value={localNode.data.config?.agentDescription || ""}
                          onChange={(e) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  agentDescription: e.target.value,
                                },
                              },
                            })
                          }}
                          className="min-h-24 border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Explique o propósito e comportamento deste agente
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="capabilities"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <List className="w-4 h-4 text-blue-500" />
                          Capacidades
                        </Label>
                        <Textarea
                          id="capabilities"
                          placeholder="Liste as capacidades do agente (uma por linha)"
                          value={localNode.data.config?.capabilities?.join("\n") || ""}
                          onChange={(e) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  capabilities: e.target.value.split("\n").filter((v) => v.trim()),
                                },
                              },
                            })
                          }}
                          className="min-h-24 border-slate-200 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Liste uma capacidade por linha (ex: "Responder perguntas sobre produtos")
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Internal Node */}
              {localNode.data.name === "internal" && (
                <>
                  {localNode.data.label === "Atraso" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="duration"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Clock className="w-4 h-4 text-purple-500" />
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
                                  duration: Number.parseInt(e.target.value) || 0,
                                },
                              },
                            })
                          }}
                          className="border-slate-200 focus-visible:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tempo de espera antes de prosseguir para o próximo nó
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Timer className="w-4 h-4 text-purple-500" />
                          Unidade
                        </Label>
                        <Select
                          value={localNode.data.config?.unit || "seconds"}
                          onValueChange={(value: "seconds" | "minutes" | "hours") => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  unit: value,
                                },
                              },
                            })
                          }}
                        >
                          <SelectTrigger className="border-slate-200 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <SelectValue placeholder="Selecione a unidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seconds">Segundos</SelectItem>
                            <SelectItem value="minutes">Minutos</SelectItem>
                            <SelectItem value="hours">Horas</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Unidade de tempo para a duração especificada
                        </p>
                      </div>
                    </div>
                  )}
                  {localNode.data.label === "Início" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="condition"
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
                        >
                          <Play className="w-4 h-4 text-purple-500" />
                          Condição de Início
                        </Label>
                        <Textarea
                          id="condition"
                          placeholder="Digite a condição de início (opcional)"
                          value={localNode.data.config?.condition || ""}
                          onChange={(e) => {
                            setLocalNode({
                              ...localNode,
                              data: {
                                ...localNode.data,
                                config: {
                                  ...(localNode.data.config || {}),
                                  condition: e.target.value,
                                },
                              },
                            })
                          }}
                          className="min-h-24 border-slate-200 focus-visible:ring-purple-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Condição opcional que deve ser satisfeita para iniciar o fluxo
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {renderActionConfigFields(getActionDefinition(), localNode.data.config || {}, (newConfig) => {
                setLocalNode({
                  ...localNode,
                  data: {
                    ...localNode.data,
                    config: newConfig,
                  },
                })
              })}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Deletando...</span>
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4" />
                      <span>Deletar</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir permanentemente este nó</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
