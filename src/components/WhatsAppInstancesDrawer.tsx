"use client"

import { useState, useEffect } from "react"
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

interface WhatsAppInstance {
  name: string
  credencias: {
    apiKey: string
    source: string
    appName: string
    webhook: string
    provider: string
  }
  status?: "active" | "inactive" | "connecting" | "error"
  lastConnected?: string
}

interface WhatsAppInstancesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flowId: string
  flowData: { data: Flow } | null
  onFlowDataChange: (newData: { data: Flow }) => void
}

export function WhatsAppInstancesDrawer({
  open,
  onOpenChange,
  flowId,
  flowData,
  onFlowDataChange,
}: WhatsAppInstancesDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [editingInstance, setEditingInstance] = useState<WhatsAppInstance | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [expandedInstances, setExpandedInstances] = useState<Record<number, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

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

  // Função para atualizar as instâncias
  const updateInstances = async (updatedInstances: WhatsAppInstance[]) => {
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
      const updatedFlowData = {
        data: {
          id: parseInt(flowId),
          attributes: {
            name: flowData?.data?.attributes?.name || "",
            status: flowData?.data?.attributes?.status || "draft",
            description: flowData?.data?.attributes?.description || "",
            data: {
              nodes: flowData?.data?.attributes?.data?.nodes || [],
              edges: flowData?.data?.attributes?.data?.edges || [],
              settings: updatedSettings,
            },
          },
        },
      }

      // Primeiro atualizar o estado local
      onFlowDataChange({
        data: {
          id: parseInt(flowId),
          attributes: {
            name: flowData?.data?.attributes?.name || "",
            status: flowData?.data?.attributes?.status || "draft",
            description: flowData?.data?.attributes?.description || "",
            data: {
              nodes: flowData?.data?.attributes?.data?.nodes || [],
              edges: flowData?.data?.attributes?.data?.edges || [],
              settings: updatedSettings,
            },
          },
        },
      })

      // Depois persistir no backend
      console.log("Saving to API:", updatedFlowData) // Log para debug
      const response = await updateFlow(flowId, updatedFlowData)
      console.log("API Response:", response) // Log para debug

      if (response) {
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
  const handleAddInstance = async () => {
    const currentInstances = getCurrentInstances()

    const newInstance: WhatsAppInstance = {
      name: `WhatsApp ${currentInstances.length + 1}`,
      credencias: {
        apiKey: "",
        source: "",
        appName: "",
        webhook: "",
        provider: "whatsapp",
      },
      status: "inactive",
      lastConnected: "",
    }

    await updateInstances([...currentInstances, newInstance])
  }

  // Função para remover instância
  const handleRemoveInstance = async (index: number) => {
    const currentInstances = getCurrentInstances()
    const updatedInstances = currentInstances.filter((_: WhatsAppInstance, i: number) => i !== index)
    await updateInstances(updatedInstances)
    setIsDeleteDialogOpen(false)
  }

  // Função para editar instância
  const handleEditInstance = async (updatedInstance: WhatsAppInstance) => {
    if (editingIndex === null) {
      console.error("Editing index is null")
      return
    }

    try {
      setSaveStatus("saving")
      const currentInstances = getCurrentInstances()
      
      // Criar uma cópia profunda das instâncias atualizadas
      const updatedInstances = currentInstances.map((instance: WhatsAppInstance, i: number) =>
        i === editingIndex ? { ...updatedInstance } : { ...instance }
      )

      // Preparar os dados para atualização
      const currentSettings = flowData?.data?.attributes?.data?.settings
      const parsedSettings = currentSettings
        ? typeof currentSettings === "string"
          ? JSON.parse(currentSettings)
          : currentSettings
        : {}

      // Criar o objeto de configurações atualizado
      const updatedSettings = {
        ...parsedSettings,
        instances: updatedInstances,
      }

      // Criar o objeto de flow atualizado
      const updatedFlowData = {
        data: {
          id: parseInt(flowId),
          attributes: {
            name: flowData?.data?.attributes?.name || "",
            status: flowData?.data?.attributes?.status || "draft",
            description: flowData?.data?.attributes?.description || "",
            data: {
              nodes: flowData?.data?.attributes?.data?.nodes || [],
              edges: flowData?.data?.attributes?.data?.edges || [],
              settings: updatedSettings,
            },
          },
        },
      }

      // Log para debug
      console.log("Current instances:", currentInstances)
      console.log("Updated instance:", updatedInstance)
      console.log("Updated instances:", updatedInstances)
      console.log("Updated settings:", updatedSettings)
      console.log("Saving to API:", updatedFlowData)

      // Primeiro atualizar o estado local
      onFlowDataChange({
        data: {
          id: parseInt(flowId),
          attributes: {
            name: flowData?.data?.attributes?.name || "",
            status: flowData?.data?.attributes?.status || "draft",
            description: flowData?.data?.attributes?.description || "",
            data: {
              nodes: flowData?.data?.attributes?.data?.nodes || [],
              edges: flowData?.data?.attributes?.data?.edges || [],
              settings: updatedSettings,
            },
          },
        },
      })

      // Depois persistir no backend
      const response = await updateFlow(flowId, updatedFlowData)
      console.log("API Response:", response)

      if (response?.data) {
        setSaveStatus("success")
        // Atualizar o estado local com a resposta da API
        onFlowDataChange({
          data: response.data,
        })
        
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

  // Função para obter as instâncias atuais
  const getCurrentInstances = (): WhatsAppInstance[] => {
    try {
      const settings = flowData?.data?.attributes?.data?.settings
      const parsedSettings = settings ? (typeof settings === "string" ? JSON.parse(settings) : settings) : null
      return (parsedSettings?.instances || []) as WhatsAppInstance[]
    } catch {
      return [] as WhatsAppInstance[]
    }
  }

  // Função para abrir o diálogo de edição
  const openEditDialog = (instance: WhatsAppInstance, index: number) => {
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
  const getInstanceStatus = (instance: WhatsAppInstance) => {
    const status = instance.status || "inactive"

    switch (status) {
      case "active":
        return {
          label: "Ativo",
          color: "bg-green-500",
          icon: <CheckCircle className="h-3 w-3 text-white" />,
        }
      case "connecting":
        return {
          label: "Conectando",
          color: "bg-yellow-500",
          icon: <Loader2 className="h-3 w-3 text-white animate-spin" />,
        }
      case "error":
        return {
          label: "Erro",
          color: "bg-red-500",
          icon: <AlertCircle className="h-3 w-3 text-white" />,
        }
      default:
        return {
          label: "Inativo",
          color: "bg-gray-400",
          icon: <Info className="h-3 w-3 text-white" />,
        }
    }
  }

  // Efeito para buscar instâncias quando o drawer é aberto
  useEffect(() => {
    if (open) {
      fetchInstances()
    }
  }, [open])

  const instances = getCurrentInstances()

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="max-w-md w-full">
          <DrawerHeader className="border-b px-4 py-3 flex flex-row items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Instâncias 
              </DrawerTitle>
              <DrawerDescription className="text-xs mt-1">
                Gerencie as instâncias WhatsApp conectadas ao seu flow
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

          <Tabs defaultValue="instances" className="w-full">
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

            <TabsContent value="instances" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
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
                          Adicione sua primeira instância WhatsApp para começar a enviar mensagens
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="rounded-md bg-muted p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Você precisa de pelo menos uma instância WhatsApp para usar este flow
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleAddInstance} className="w-full">
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
                        <Badge variant="outline" className="text-xs font-normal">
                          {instances.filter((i) => i.status === "active").length} ativas
                        </Badge>
                      </div>

                      {instances.map((instance: WhatsAppInstance, index: number) => {
                        const status = getInstanceStatus(instance)
                        const isExpanded = expandedInstances[index] || false

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
                                  <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{instance.name}</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-1">
                                      <div className={cn("w-2 h-2 rounded-full", status.color)}></div>
                                      <span className="text-xs text-muted-foreground">{status.label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">
                                      {instance.lastConnected || "Nunca conectado"}
                                    </span>
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
                                          {instance.credencias?.provider || "Não configurado"}
                                        </Badge>
                                      </div>

                                      <div className="text-muted-foreground">App Name:</div>
                                      <div className="col-span-2 font-medium">
                                        {instance.credencias?.appName || "Não configurado"}
                                      </div>

                                      <div className="text-muted-foreground">Source:</div>
                                      <div className="col-span-2 font-medium flex items-center gap-1">
                                        <span className="truncate">
                                          {instance.credencias?.source || "Não configurado"}
                                        </span>
                                        {instance.credencias?.source && (
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
                                          {instance.credencias?.webhook || "Não configurado"}
                                        </span>
                                        {instance.credencias?.webhook && (
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
                                        {instance.credencias?.apiKey ? "••••••••••••••••" : "Não configurado"}
                                        {instance.credencias?.apiKey && (
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

            <TabsContent value="settings" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
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
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Reconexão automática</Label>
                          <p className="text-xs text-muted-foreground">
                            Reconectar automaticamente quando a conexão for perdida
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Modo de depuração</Label>
                          <p className="text-xs text-muted-foreground">
                            Ativar logs detalhados para solução de problemas
                          </p>
                        </div>
                        <Switch />
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

          <DrawerFooter className="border-t px-4 py-3">
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
                <Button size="sm" onClick={handleAddInstance}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Adicionar Instância
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Instance Dialog */}
      {editingInstance && (
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            if (!open && editingInstance) {
              // Se houver alterações não salvas, confirmar antes de fechar
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
              setIsEditDialogOpen(open)
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl min-w-4xl p-0 border-none shadow-none">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>Editar Instância WhatsApp</DialogTitle>
              <DialogDescription>
                Configure as credenciais e opções da instância. As alterações serão salvas automaticamente.
              </DialogDescription>
            </DialogHeader>
            <WhatsAppInstanceCreator
              instance={editingInstance}
              onChange={(field: string, value: string) => {
                // Atualizar o estado local imediatamente
                setEditingInstance(prev => {
                  if (!prev) return null
                  if (field === 'name') {
                    return { ...prev, name: value }
                  } else {
                    return {
                      ...prev,
                      credencias: { ...prev.credencias, [field]: value }
                    }
                  }
                })
              }}
              isEditing={true}
              onSave={async () => {
                if (editingInstance && editingIndex !== null) {
                  try {
                    setSaveStatus("saving")
                    const currentInstances = getCurrentInstances()
                    
                    // Criar uma cópia profunda das instâncias atualizadas
                    const updatedInstances = currentInstances.map((instance: WhatsAppInstance, i: number) =>
                      i === editingIndex ? { ...editingInstance } : { ...instance }
                    )

                    // Preparar os dados para atualização
                    const currentSettings = flowData?.data?.attributes?.data?.settings
                    const parsedSettings = currentSettings
                      ? typeof currentSettings === "string"
                        ? JSON.parse(currentSettings)
                        : currentSettings
                      : {}

                    // Criar o objeto de configurações atualizado
                    const updatedSettings = {
                      ...parsedSettings,
                      instances: updatedInstances,
                    }

                    // Criar o objeto de flow atualizado
                    const updatedFlowData = {
                      data: {
                        id: parseInt(flowId),
                        attributes: {
                          name: flowData?.data?.attributes?.name || "",
                          status: flowData?.data?.attributes?.status || "draft",
                          description: flowData?.data?.attributes?.description || "",
                          data: {
                            nodes: flowData?.data?.attributes?.data?.nodes || [],
                            edges: flowData?.data?.attributes?.data?.edges || [],
                            settings: updatedSettings,
                          },
                        },
                      },
                    }

                    // Log para debug
                    console.log("Current instances:", currentInstances)
                    console.log("Updated instance:", editingInstance)
                    console.log("Updated instances:", updatedInstances)
                    console.log("Updated settings:", updatedSettings)
                    console.log("Saving to API:", updatedFlowData)

                    // Atualizar o estado local primeiro
                    onFlowDataChange({
                      data: {
                        id: parseInt(flowId),
                        attributes: {
                          name: flowData?.data?.attributes?.name || "",
                          status: flowData?.data?.attributes?.status || "draft",
                          description: flowData?.data?.attributes?.description || "",
                          data: {
                            nodes: flowData?.data?.attributes?.data?.nodes || [],
                            edges: flowData?.data?.attributes?.data?.edges || [],
                            settings: updatedSettings,
                          },
                        },
                      },
                    })

                    // Depois persistir no backend
                    const response = await updateFlow(flowId, updatedFlowData)
                    console.log("API Response:", response)

                    if (response?.data) {
                      setSaveStatus("success")
                      // Atualizar o estado local com a resposta da API
                      onFlowDataChange({
                        data: response.data,
                      })
                      
                      // Fechar o diálogo e limpar o estado
                      setIsEditDialogOpen(false)
                      setEditingInstance(null)
                      setEditingIndex(null)
                    } else {
                      throw new Error("Failed to update flow")
                    }
                  } catch (error) {
                    console.error("Error updating instance:", error)
                    setSaveStatus("error")
                  } finally {
                    setTimeout(() => {
                      setSaveStatus("idle")
                    }, 2000)
                  }
                }
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
            />
          </DialogContent>
        </Dialog>
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
    </>
  )
}
