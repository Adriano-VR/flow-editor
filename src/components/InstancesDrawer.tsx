"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Copy,
  MoreHorizontal,
  ExternalLink,
  Info,
  Bot,
} from "lucide-react"
import { getFlow, updateFlow } from "@/lib/api"
import type { Flow } from "@/types/flow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { WhatsAppInstanceCreator } from './actionConfigFields/whatsapp/WhatsAppInstanceCreator'
import { AssistantFormFields } from './actionConfigFields/assistant/AssistantFormFields'
import type { Node } from "@/types/node"
import type { Edge } from "@/types/flow"
import type { Settings } from "@/lib/settingsTypes"

interface WhatsAppCredentials {
  apiKey: string
  source: string
  appName: string
  webhook: string
  provider: string
}

interface AssistantCredentials {
  app: string
  idassistente: string
  model: {
    name: string
    temperature: number
  }
  memory: {
    maxTokens: number
    retentionPeriod: string
  }
  tools: string[]
  provider: string
}

type InstanceCredentials = WhatsAppCredentials | AssistantCredentials

interface BaseInstance {
  name: string
  credencias: InstanceCredentials
  status?: "active" | "inactive" | "connecting" | "error"
  lastConnected?: string
}

interface WhatsAppInstance extends BaseInstance {
  credencias: WhatsAppCredentials
}

interface AssistantInstance extends BaseInstance {
  credencias: AssistantCredentials
}

type Instance = WhatsAppInstance | AssistantInstance

interface WhatsAppInstancesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flowId: string
  flowData: { data: Flow } | null
  onFlowDataChange: (newData: { data: Flow }) => void
}

// Type guard functions
function isWhatsAppInstance(instance: Instance): instance is WhatsAppInstance {
  return instance.credencias.provider === "whatsapp"
}

function isAssistantInstance(instance: Instance): instance is AssistantInstance {
  return instance.credencias.provider === "assistant"
}

export function WhatsAppInstancesDrawer({
  open,
  onOpenChange,
  flowId,
  flowData,
  onFlowDataChange,
}: WhatsAppInstancesDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [autoReconnect, setAutoReconnect] = useState(true)
  const [debugMode, setDebugMode] = useState(false)
  const [editingInstance, setEditingInstance] = useState<Instance | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedInstances, setExpandedInstances] = useState<Record<number, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newInstance, setNewInstance] = useState<Instance | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newInstanceDraft, setNewInstanceDraft] = useState<Instance | null>(null)

  // Função para buscar apenas as instâncias
  const fetchInstances = async () => {
    try {
      setIsLoading(true)
      const response = await getFlow(flowId)
      const newFlowData = response

      // Atualiza apenas as instâncias no estado atual
      if (flowData?.data?.attributes?.data) {
        onFlowDataChange({
          ...flowData,
          data: {
            ...flowData.data,
            attributes: {
              ...flowData.data.attributes,
              data: {
                ...flowData.data.attributes.data,
                settings: {
                  ...flowData.data.attributes.data.settings,
                  instances: newFlowData.data.attributes.data?.settings?.instances || [],
                },
              },
            },
          },
        })
      }
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      console.error("Error fetching instances:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para obter as instâncias atuais
  const getCurrentInstances = (): Instance[] => {
    try {
      const settings = flowData?.data?.attributes?.data?.settings
      if (!settings) return []
      
      const parsedSettings = typeof settings === "string" ? JSON.parse(settings) : settings
      return (parsedSettings?.instances || [])
    } catch (error) {
      console.error("Error parsing instances:", error)
      return []
    }
  }

  // Função para atualizar as instâncias
  const updateInstances = async (updatedInstances: Instance[]) => {
    try {
      setSaveStatus("saving")
      const currentSettings = flowData?.data?.attributes?.data?.settings
      const parsedSettings = currentSettings
        ? typeof currentSettings === "string"
          ? JSON.parse(currentSettings)
          : currentSettings
        : {}

      const updatedSettings = {
        ...parsedSettings,
        instances: updatedInstances,
      }

      // Criar o objeto de flow atualizado
      const nodes = flowData?.data?.attributes?.data?.nodes ?? []
      const edges = flowData?.data?.attributes?.data?.edges ?? []
      
      const updatedFlowData = {
        nodes,
        edges,
        name: flowData?.data?.attributes?.name,
        status: flowData?.data?.attributes?.status,
        description: flowData?.data?.attributes?.description,
        settings: updatedSettings
      } satisfies {
        nodes: Node[];
        edges: Edge[];
        name?: string;
        status?: string;
        description?: string;
        settings?: Settings;
      }

      // Primeiro atualizar o estado local
      onFlowDataChange({
        data: {
          ...flowData?.data,
          attributes: {
            ...flowData?.data?.attributes,
            data: {
              ...flowData?.data?.attributes?.data,
              settings: updatedSettings,
            },
          },
        },
      })

      // Depois persistir no backend
      const response = await updateFlow(flowId, updatedFlowData)

      if (response?.data) {
        setSaveStatus("success")
        // Atualizar o estado local com a resposta da API
        onFlowDataChange({
          data: response.data,
        })
      } else {
        throw new Error("Failed to update flow")
      }

      // Simular um pequeno atraso para mostrar o estado de salvamento
      setTimeout(() => {
        setSaveStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Error updating instances:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  // Função para adicionar instância
  const handleAddInstance = (type: "whatsapp" | "assistant") => {
    const currentInstances = getCurrentInstances()
    
    if (type === "whatsapp") {
      const instance: WhatsAppInstance = {
        name: `WhatsApp ${currentInstances.length + 1}`,
        credencias: {
          apiKey: "",
          source: "",
          appName: "",
          webhook: "",
          provider: "whatsapp"
        },
        status: "inactive",
        lastConnected: ""
      }
      setNewInstanceDraft(instance)
    } else {
      const instance: AssistantInstance = {
        name: `Assistant ${currentInstances.length + 1}`,
        credencias: {
          app: "",
          idassistente: "",
          model: {
            name: "gpt-3.5-turbo",
            temperature: 0.7
          },
          memory: {
            maxTokens: 2000,
            retentionPeriod: "7d"
          },
          tools: [],
          provider: "assistant"
        },
        status: "inactive",
        lastConnected: ""
      }
      setNewInstanceDraft(instance)
    }
    setIsCreating(true)
  }

  // Função para salvar nova instância
  const handleSaveNewInstance = async (instance: Instance) => {
    try {
      setSaveStatus("saving")
      const currentInstances = getCurrentInstances()
      
      // Garantir que a instância tem a estrutura correta baseada no provider
      let newInstance: Instance
      if (isWhatsAppInstance(instance)) {
        newInstance = {
          name: instance.name,
          credencias: {
            apiKey: instance.credencias.apiKey || "",
            source: instance.credencias.source || "",
            appName: instance.credencias.appName || "",
            webhook: instance.credencias.webhook || "",
            provider: "whatsapp"
          },
          status: "inactive",
          lastConnected: ""
        } as WhatsAppInstance
      } else {
        newInstance = {
          name: instance.name,
          credencias: {
            app: instance.credencias.app || "",
            idassistente: instance.credencias.idassistente || "",
            model: {
              name: instance.credencias.model?.name || "gpt-3.5-turbo",
              temperature: instance.credencias.model?.temperature || 0.7
            },
            memory: {
              maxTokens: instance.credencias.memory?.maxTokens || 2000,
              retentionPeriod: instance.credencias.memory?.retentionPeriod || "7d"
            },
            tools: instance.credencias.tools || [],
            provider: "assistant"
          },
          status: "inactive",
          lastConnected: ""
        } as AssistantInstance
      }

      const updatedInstances = [...currentInstances, newInstance]
      
      // Atualizar o backend
      const currentSettings = flowData?.data?.attributes?.data?.settings
      const parsedSettings = currentSettings
        ? typeof currentSettings === "string"
          ? JSON.parse(currentSettings)
          : currentSettings
        : {}

      const updatedSettings = {
        ...parsedSettings,
        instances: updatedInstances,
      }

      // Criar o objeto de flow atualizado mantendo a estrutura existente
      const nodes = flowData?.data?.attributes?.data?.nodes ?? []
      const edges = flowData?.data?.attributes?.data?.edges ?? []
      
      const updatedFlowData = {
        nodes,
        edges,
        name: flowData?.data?.attributes?.name,
        status: flowData?.data?.attributes?.status,
        description: flowData?.data?.attributes?.description,
        settings: updatedSettings
      } satisfies {
        nodes: Node[];
        edges: Edge[];
        name?: string;
        status?: string;
        description?: string;
        settings?: Settings;
      }

      // Primeiro persistir no backend
      const response = await updateFlow(flowId, { data: { id: parseInt(flowId), attributes: { data: updatedFlowData } } } )

      if (response?.data) {
        // Atualizar o estado local APENAS com a resposta da API
        onFlowDataChange({
          data: response.data
        })
        
        setSaveStatus("success")
        setIsCreating(false)
        setNewInstanceDraft(null)
      } else {
        throw new Error("Failed to update flow")
      }

      // Simular um pequeno atraso para mostrar o estado de salvamento
      setTimeout(() => {
        setSaveStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Error saving new instance:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  // Função para editar instância
  const handleEditInstance = async (updatedInstance: Instance) => {
    if (editingIndex === null) {
      console.error("Editing index is null")
      return
    }

    try {
      setSaveStatus("saving")
      const currentInstances = getCurrentInstances()
      
      // Garantir que a instância tem a estrutura correta baseada no provider
      let newInstance: Instance
      if (isWhatsAppInstance(updatedInstance)) {
        newInstance = {
          name: updatedInstance.name,
          credencias: {
            apiKey: updatedInstance.credencias.apiKey || "",
            source: updatedInstance.credencias.source || "",
            appName: updatedInstance.credencias.appName || "",
            webhook: updatedInstance.credencias.webhook || "",
            provider: "whatsapp"
          },
          status: updatedInstance.status || "inactive",
          lastConnected: updatedInstance.lastConnected || ""
        } as WhatsAppInstance
      } else {
        newInstance = {
          name: updatedInstance.name,
          credencias: {
            app: updatedInstance.credencias.app || "",
            idassistente: updatedInstance.credencias.idassistente || "",
            model: {
              name: updatedInstance.credencias.model?.name || "gpt-3.5-turbo",
              temperature: updatedInstance.credencias.model?.temperature || 0.7
            },
            memory: {
              maxTokens: updatedInstance.credencias.memory?.maxTokens || 2000,
              retentionPeriod: updatedInstance.credencias.memory?.retentionPeriod || "7d"
            },
            tools: updatedInstance.credencias.tools || [],
            provider: "assistant"
          },
          status: updatedInstance.status || "inactive",
          lastConnected: updatedInstance.lastConnected || ""
        } as AssistantInstance
      }

      // Criar uma cópia profunda das instâncias atualizadas
      const updatedInstances = currentInstances.map((instance: Instance, i: number) =>
        i === editingIndex ? newInstance : instance
      )

      // Atualizar o backend
      const currentSettings = flowData?.data?.attributes?.data?.settings
      const parsedSettings = currentSettings
        ? typeof currentSettings === "string"
          ? JSON.parse(currentSettings)
          : currentSettings
        : {}

      const updatedSettings = {
        ...parsedSettings,
        instances: updatedInstances,
      }

      // Criar o objeto de flow atualizado mantendo a estrutura existente
      const nodes = flowData?.data?.attributes?.data?.nodes ?? []
      const edges = flowData?.data?.attributes?.data?.edges ?? []
      
      const updatedFlowData = {
        nodes,
        edges,
        name: flowData?.data?.attributes?.name,
        status: flowData?.data?.attributes?.status,
        description: flowData?.data?.attributes?.description,
        settings: updatedSettings
      } satisfies {
        nodes: Node[];
        edges: Edge[];
        name?: string;
        status?: string;
        description?: string;
        settings?: Settings;
      }

      // Primeiro persistir no backend
      const response = await updateFlow(flowId, { data: { id: parseInt(flowId), attributes: { data: updatedFlowData } } } )

      if (response?.data) {
        // Atualizar o estado local APENAS com a resposta da API
        onFlowDataChange({
          data: response.data
        })
        
        setSaveStatus("success")
        // Fechar o diálogo e limpar o estado
        setIsEditDialogOpen(false)
        setEditingInstance(null)
        setEditingIndex(null)
      } else {
        throw new Error("Failed to update flow")
      }

      // Simular um pequeno atraso para mostrar o estado de salvamento
      setTimeout(() => {
        setSaveStatus("idle")
      }, 2000)
    } catch (error) {
      console.error("Error updating instance:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  // Função para remover instância
  const handleRemoveInstance = async (index: number) => {
    try {
      setSaveStatus("saving")
      const currentInstances = getCurrentInstances()
      const updatedInstances = currentInstances.filter((_: Instance, i: number) => i !== index)
      await updateInstances(updatedInstances)
      
      setIsDeleteDialogOpen(false)
      setDeleteIndex(null)
    } catch (error) {
      console.error("Error removing instance:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  // Função para abrir o diálogo de edição
  const openEditDialog = (instance: Instance, index: number) => {
    // Garantir que temos uma cópia profunda da instância
    const instanceCopy = JSON.parse(JSON.stringify(instance))
    setEditingInstance(instanceCopy)
    setEditingIndex(index)
    setIsEditDialogOpen(true)
  }

  // Função para confirmar exclusão
  const confirmDelete = (index: number) => {
    setDeleteIndex(index)
    setIsDeleteDialogOpen(true)
  }

  // Função para alternar a expansão de uma instância
  const toggleInstanceExpansion = (index: number) => {
    setExpandedInstances((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Função para obter o status da instância
  const getInstanceStatus = (instance: Instance) => {
    const status = instance.status || "inactive"
    const provider = instance.credencias.provider

    // Cores diferentes para cada provider
    const providerColors = {
      whatsapp: "bg-green-500",
      assistant: "bg-blue-500",
      default: "bg-gray-400"
    }

    const statusConfig = {
      active: {
        label: "Ativo",
        color: providerColors[provider as keyof typeof providerColors] || providerColors.default,
        icon: <CheckCircle className="h-3 w-3 text-white" />,
      },
      connecting: {
        label: "Conectando",
        color: "bg-yellow-500",
        icon: <Loader2 className="h-3 w-3 text-white animate-spin" />,
      },
      error: {
        label: "Erro",
        color: "bg-red-500",
        icon: <AlertCircle className="h-3 w-3 text-white" />,
      },
      default: {
        label: "Inativo",
        color: providerColors[provider as keyof typeof providerColors] || providerColors.default,
        icon: <Info className="h-3 w-3 text-white" />,
      }
    }

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.default
  }

  // Função para obter o ícone do provider
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-white" />
      case "assistant":
        return <Info className="h-4 w-4 text-white" />
      default:
        return <Info className="h-4 w-4 text-white" />
    }
  }

  const instances = getCurrentInstances()

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="max-w-md w-full">
          <div className="flex flex-col h-[calc(100vh-100px)]">
            <DrawerHeader className="border-b px-4 py-3 flex flex-row items-center justify-between">
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Instâncias 
                </DrawerTitle>
                <DrawerDescription className="text-xs mt-1">
                  Gerencie as instâncias conectadas ao seu flow
                </DrawerDescription>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchInstances}
                        className="h-8 w-8"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Recarregar instâncias</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </DrawerHeader>

            <Tabs defaultValue="instances" className="w-full flex-1 flex flex-col">
              <div className="px-4 pt-3 border-b">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="instances" className="text-xs">
                    Instâncias
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs">
                    Configurações
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="instances" className="mt-0 flex-1 flex flex-col focus-visible:outline-none focus-visible:ring-0">
                <ScrollArea className="flex-1">
                  <div className="space-y-3 p-4">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                        <p className="text-sm font-medium">Carregando instâncias...</p>
                        <p className="text-xs text-muted-foreground mt-1">Aguarde enquanto buscamos suas configurações</p>
                      </div>
                    ) : instances.length === 0 ? (
                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Nenhuma instância configurada</CardTitle>
                          <CardDescription>
                            Adicione sua primeira instância para começar
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="rounded-md bg-muted p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                Você precisa de pelo menos uma instância para usar este flow
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={() => handleAddInstance("whatsapp")} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Instância
                          </Button>
                        </CardFooter>
                      </Card>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium">
                            {instances.length} {instances.length === 1 ? "instância" : "instâncias"} configuradas
                          </h3>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs font-normal">
                              {instances.filter((i) => i.credencias.provider === "whatsapp").length} WhatsApp
                            </Badge>
                            <Badge variant="outline" className="text-xs font-normal">
                              {instances.filter((i) => i.credencias.provider === "assistant").length} Assistant
                            </Badge>
                          </div>
                        </div>

                        {instances.map((instance: Instance, index: number) => {
                          const status = getInstanceStatus(instance)
                          const isExpanded = expandedInstances[index] || false
                          const provider = instance.credencias.provider

                          return (
                            <Card
                              key={`instance-${index}-${refreshKey}`}
                              className="overflow-hidden transition-all duration-200"
                            >
                              <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn("w-8 h-8 rounded-full flex items-center justify-center", status.color)}
                                  >
                                    {getProviderIcon(provider)}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">{instance.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <div className="flex items-center gap-1">
                                        <div className={cn("w-2 h-2 rounded-full", status.color)}></div>
                                        <span className="text-xs text-muted-foreground">{status.label}</span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <Badge variant="outline" className="text-xs font-normal">
                                        {provider}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => toggleInstanceExpansion(index)}
                                  >
                                    <ChevronRight
                                      className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")}
                                    />
                                  </Button>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem onClick={() => openEditDialog(instance, index)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar instância
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicar instância
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-500 focus:text-red-500"
                                        onClick={() => confirmDelete(index)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remover instância
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>

                              {isExpanded && (
                                <>
                                  <Separator />
                                  <CardContent className="px-4 py-3 text-sm">
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="text-muted-foreground">Provider:</div>
                                        <div className="col-span-2 font-medium flex items-center gap-2">
                                          <Badge variant="outline" className="h-5 text-xs font-normal">
                                            {provider}
                                          </Badge>
                                        </div>

                                        {isWhatsAppInstance(instance) && (
                                          <>
                                            <div className="text-muted-foreground">App Name:</div>
                                            <div className="col-span-2 font-medium">
                                              {instance.credencias.appName || "Não configurado"}
                                            </div>

                                            <div className="text-muted-foreground">Source:</div>
                                            <div className="col-span-2 font-medium flex items-center gap-1">
                                              <span className="truncate">
                                                {instance.credencias.source || "Não configurado"}
                                              </span>
                                              {instance.credencias.source && (
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-5 w-5"
                                                  onClick={() => copyToClipboard(instance.credencias.source)}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              )}
                                            </div>

                                            <div className="text-muted-foreground">Webhook:</div>
                                            <div className="col-span-2 font-medium flex items-center gap-1">
                                              <span className="truncate max-w-[180px]">
                                                {instance.credencias.webhook || "Não configurado"}
                                              </span>
                                              {instance.credencias.webhook && (
                                                <>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() => copyToClipboard(instance.credencias.webhook)}
                                                  >
                                                    <Copy className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5"
                                                    onClick={() => window.open(instance.credencias.webhook, "_blank")}
                                                  >
                                                    <ExternalLink className="h-3 w-3" />
                                                  </Button>
                                                </>
                                              )}
                                            </div>

                                            <div className="text-muted-foreground">API Key:</div>
                                            <div className="col-span-2 font-medium flex items-center gap-1">
                                              {instance.credencias.apiKey ? "••••••••••••••••" : "Não configurado"}
                                              {instance.credencias.apiKey && (
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-5 w-5"
                                                  onClick={() => copyToClipboard(instance.credencias.apiKey)}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              )}
                                            </div>
                                          </>
                                        )}

                                        {isAssistantInstance(instance) && (
                                          <>
                                            <div className="text-muted-foreground">App:</div>
                                            <div className="col-span-2 font-medium">
                                              {instance.credencias.app || "Não configurado"}
                                            </div>

                                            <div className="text-muted-foreground">ID do Assistente:</div>
                                            <div className="col-span-2 font-medium">
                                              {instance.credencias.idassistente || "Não configurado"}
                                            </div>

                                            <div className="text-muted-foreground">Modelo:</div>
                                            <div className="col-span-2 font-medium">
                                              {instance.credencias.model?.name || "Não configurado"}
                                            </div>

                                            <div className="text-muted-foreground">Temperatura:</div>
                                            <div className="col-span-2 font-medium">
                                              {instance.credencias.model?.temperature || "Não configurado"}
                                            </div>

                                            <div className="text-muted-foreground">Máximo de Tokens:</div>
                                            <div className="col-span-2 font-medium">
                                              {instance.credencias.memory?.maxTokens || "Não configurado"}
                                            </div>

                                            <div className="text-muted-foreground">Período de Retenção:</div>
                                            <div className="col-span-2 font-medium">
                                              {instance.credencias.memory?.retentionPeriod || "Não configurado"}
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openEditDialog(instance, index)}
                                        >
                                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                                          Editar
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => confirmDelete(index)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                          Remover
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </>
                              )}
                            </Card>
                          )
                        })}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 flex-1 flex flex-col focus-visible:outline-none focus-visible:ring-0">
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Configurações Gerais</CardTitle>
                        <CardDescription>Configure as opções globais para todas as instâncias WhatsApp</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm">Ativar notificações</Label>
                            <p className="text-xs text-muted-foreground">
                              Receba notificações sobre o status das instâncias
                            </p>
                          </div>
                          <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm">Reconexão automática</Label>
                            <p className="text-xs text-muted-foreground">
                              Reconectar automaticamente quando a conexão for perdida
                            </p>
                          </div>
                          <Switch checked={autoReconnect} onCheckedChange={setAutoReconnect} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm">Modo de depuração</Label>
                            <p className="text-xs text-muted-foreground">
                              Ativar logs detalhados para solução de problemas
                            </p>
                          </div>
                          <Switch checked={debugMode} onCheckedChange={setDebugMode} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Limites e Restrições</CardTitle>
                        <CardDescription>Configure limites para evitar uso excessivo</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Limite de mensagens por minuto</Label>
                          <Input type="number" defaultValue="60" />
                          <p className="text-xs text-muted-foreground">
                            Recomendado: 60 mensagens/minuto para evitar bloqueios
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Tempo de espera entre mensagens (ms)</Label>
                          <Input type="number" defaultValue="1000" />
                          <p className="text-xs text-muted-foreground">
                            Tempo mínimo entre o envio de mensagens consecutivas
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <DrawerFooter className="border-t px-4 py-3 mt-auto">
              <div className="flex items-center justify-between w-full">
                <div>
                  {saveStatus === "saving" && (
                    <span className="text-xs flex items-center text-muted-foreground">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Salvando alterações...
                    </span>
                  )}
                  {saveStatus === "success" && (
                    <span className="text-xs flex items-center text-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Alterações salvas com sucesso
                    </span>
                  )}
                  {saveStatus === "error" && (
                    <span className="text-xs flex items-center text-red-500">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Erro ao salvar alterações
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                    Fechar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Adicionar Instância
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAddInstance("whatsapp")}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddInstance("assistant")}>
                        <Bot className="h-4 w-4 mr-2" />
                        Assistant
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Edit Instance Dialog */}
      {editingInstance && (
        <>
          {isWhatsAppInstance(editingInstance) && (
            <WhatsAppInstanceCreator
              open={isEditDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  // Se estiver salvando, não mostra confirmação
                  if (saveStatus === "saving") {
                    setIsEditDialogOpen(false)
                    setEditingInstance(null)
                    setEditingIndex(null)
                    return
                  }
                  
                  const currentInstance = getCurrentInstances()[editingIndex || 0]
                  const hasChanges = JSON.stringify(currentInstance) !== JSON.stringify(editingInstance)
                  
                  if (hasChanges) {
                    if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                      setIsEditDialogOpen(false)
                      setEditingInstance(null)
                      setEditingIndex(null)
                    }
                  } else {
                    setIsEditDialogOpen(false)
                    setEditingInstance(null)
                    setEditingIndex(null)
                  }
                } else {
                  setIsEditDialogOpen(true)
                }
              }}
              instance={editingInstance}
              onChange={(field: string, value: string) => {
                if (!editingInstance) return
                const updatedInstance = field === 'name' 
                  ? { ...editingInstance, name: value }
                  : {
                      ...editingInstance,
                      credencias: { ...editingInstance.credencias, [field]: value }
                    }
                setEditingInstance(updatedInstance)
              }}
              isEditing={true}
              onSave={handleEditInstance}
              onCancel={() => {
                const currentInstance = getCurrentInstances()[editingIndex || 0]
                const hasChanges = JSON.stringify(currentInstance) !== JSON.stringify(editingInstance)
                
                if (hasChanges) {
                  if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                    setIsEditDialogOpen(false)
                    setEditingInstance(null)
                    setEditingIndex(null)
                  }
                } else {
                  setIsEditDialogOpen(false)
                  setEditingInstance(null)
                  setEditingIndex(null)
                }
              }}
              isSaving={saveStatus === "saving"}
            />
          )}
          {isAssistantInstance(editingInstance) && (
            <AssistantFormFields
              open={isEditDialogOpen}
              onOpenChange={(open) => {
                if (!open) {
                  // Se estiver salvando, não mostra confirmação
                  if (saveStatus === "saving") {
                    setIsEditDialogOpen(false)
                    setEditingInstance(null)
                    setEditingIndex(null)
                    return
                  }
                  
                  const currentInstance = getCurrentInstances()[editingIndex || 0]
                  const hasChanges = JSON.stringify(currentInstance) !== JSON.stringify(editingInstance)
                  
                  if (hasChanges) {
                    if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                      setIsEditDialogOpen(false)
                      setEditingInstance(null)
                      setEditingIndex(null)
                    }
                  } else {
                    setIsEditDialogOpen(false)
                    setEditingInstance(null)
                    setEditingIndex(null)
                  }
                } else {
                  setIsEditDialogOpen(true)
                }
              }}
              values={editingInstance}
              onChange={(field: string, value: any) => {
                if (!editingInstance) return
                let updatedInstance = { ...editingInstance }
                
                if (field === 'name') {
                  updatedInstance.name = value
                } else if (field.startsWith('model.')) {
                  const modelField = field.split('.')[1]
                  updatedInstance = {
                    ...updatedInstance,
                    credencias: {
                      ...updatedInstance.credencias,
                      model: {
                        ...updatedInstance.credencias.model,
                        [modelField]: value
                      }
                    }
                  }
                } else if (field.startsWith('memory.')) {
                  const memoryField = field.split('.')[1]
                  updatedInstance = {
                    ...updatedInstance,
                    credencias: {
                      ...updatedInstance.credencias,
                      memory: {
                        ...updatedInstance.credencias.memory,
                        [memoryField]: value
                      }
                    }
                  }
                } else {
                  updatedInstance = {
                    ...updatedInstance,
                    credencias: {
                      ...updatedInstance.credencias,
                      [field]: value
                    }
                  }
                }
                setEditingInstance(updatedInstance)
              }}
              onSave={() => {
                setSaveStatus("saving")
                handleEditInstance(editingInstance)
              }}
              onCancel={() => {
                const currentInstance = getCurrentInstances()[editingIndex || 0]
                const hasChanges = JSON.stringify(currentInstance) !== JSON.stringify(editingInstance)
                
                if (hasChanges) {
                  if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                    setIsEditDialogOpen(false)
                    setEditingInstance(null)
                    setEditingIndex(null)
                  }
                } else {
                  setIsEditDialogOpen(false)
                  setEditingInstance(null)
                  setEditingIndex(null)
                }
              }}
              title={`Editar Instância: ${editingInstance.name}`}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Remover Instância</DialogTitle>
          </DialogHeader>

          <div className="py-3">
            <p className="mb-2">
              Tem certeza que deseja remover esta instância WhatsApp? Esta ação não pode ser desfeita.
            </p>
            <div className="bg-red-50 p-3 rounded-md border border-red-100 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600">Atenção:</p>
                  <p className="text-red-600">
                    Remover esta instância pode afetar os fluxos que dependem dela. Certifique-se de atualizar seus
                    fluxos após a remoção.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteIndex !== null && handleRemoveInstance(deleteIndex)}>
              Remover Instância
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Instance Dialog */}
      {isCreating && newInstanceDraft && (
        <>
          {isWhatsAppInstance(newInstanceDraft) && (
            <WhatsAppInstanceCreator
              open={isCreating}
              onOpenChange={(open) => {
                if (!open) {
                  // Se estiver salvando, não mostra confirmação
                  if (saveStatus === "saving") {
                    setIsCreating(false)
                    setNewInstanceDraft(null)
                    return
                  }
                  
                  if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                    setIsCreating(false)
                    setNewInstanceDraft(null)
                  }
                } else {
                  setIsCreating(true)
                }
              }}
              instance={newInstanceDraft}
              onChange={(field: string, value: string) => {
                if (!newInstanceDraft) return
                if (field === 'name') {
                  setNewInstanceDraft({ ...newInstanceDraft, name: value })
                } else {
                  setNewInstanceDraft({
                    ...newInstanceDraft,
                    credencias: { ...newInstanceDraft.credencias, [field]: value }
                  })
                }
              }}
              isEditing={false}
              onSave={() => {
                setSaveStatus("saving")
                handleSaveNewInstance(newInstanceDraft)
              }}
              onCancel={() => {
                if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                  setIsCreating(false)
                  setNewInstanceDraft(null)
                }
              }}
            />
          )}
          {isAssistantInstance(newInstanceDraft) && (
            <AssistantFormFields
              open={isCreating}
              onOpenChange={(open) => {
                if (!open) {
                  // Se estiver salvando, não mostra confirmação
                  if (saveStatus === "saving") {
                    setIsCreating(false)
                    setNewInstanceDraft(null)
                    return
                  }
                  
                  if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                    setIsCreating(false)
                    setNewInstanceDraft(null)
                  }
                } else {
                  setIsCreating(true)
                }
              }}
              values={newInstanceDraft}
              onChange={(field: string, value: any) => {
                if (!newInstanceDraft) return
                let updatedInstance = { ...newInstanceDraft }
                
                if (field === 'name') {
                  updatedInstance.name = value
                } else if (field.startsWith('model.')) {
                  const modelField = field.split('.')[1]
                  updatedInstance = {
                    ...updatedInstance,
                    credencias: {
                      ...updatedInstance.credencias,
                      model: {
                        ...updatedInstance.credencias.model,
                        [modelField]: value
                      }
                    }
                  }
                } else if (field.startsWith('memory.')) {
                  const memoryField = field.split('.')[1]
                  updatedInstance = {
                    ...updatedInstance,
                    credencias: {
                      ...updatedInstance.credencias,
                      memory: {
                        ...updatedInstance.credencias.memory,
                        [memoryField]: value
                      }
                    }
                  }
                } else {
                  updatedInstance = {
                    ...updatedInstance,
                    credencias: {
                      ...updatedInstance.credencias,
                      [field]: value
                    }
                  }
                }
                setNewInstanceDraft(updatedInstance)
              }}
              onSave={() => {
                setSaveStatus("saving")
                handleSaveNewInstance(newInstanceDraft)
              }}
              onCancel={() => {
                if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
                  setIsCreating(false)
                  setNewInstanceDraft(null)
                }
              }}
              title="Nova Instância Assistant"
            />
          )}
        </>
      )}
    </>
  )
}


