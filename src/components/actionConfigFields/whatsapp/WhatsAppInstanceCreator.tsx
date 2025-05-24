"use client"

import { useState, useCallback, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, Eye, EyeOff, Info, Smartphone, Globe, Key, Save, X, Settings, MessageSquare, Link } from "lucide-react"
import { cn } from "@/lib/utils"

interface WhatsAppInstanceCreatorProps {
  instance: {
    name: string
    credencias: {
      provider: string
      appName: string
      source: string
      webhook: string
      apiKey: string
    }
  }
  onChange: (field: string, value: string) => void
  isEditing?: boolean
  onSave: (instance: { name: string; credencias: { provider: string; appName: string; source: string; webhook: string; apiKey: string } }) => void
  onCancel: () => void
  isSaving?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function WhatsAppInstanceCreator({
  instance,
  onChange,
  isEditing = false,
  onSave,
  onCancel,
  isSaving = false,
  open,
  onOpenChange,
}: WhatsAppInstanceCreatorProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [localValues, setLocalValues] = useState(instance)

  useEffect(() => {
    setLocalValues(instance)
  }, [instance])

  const handleChange = useCallback((field: string, value: string) => {
    setLocalValues(prev => {
      const updated = field === 'name'
        ? { ...prev, name: value }
        : {
            ...prev,
            credencias: { ...prev.credencias, [field]: value }
          }
      return updated
    })
    onChange(field, value)
  }, [onChange])

  const handleBlur = useCallback((field: string) => {
    const value = field === "name" ? localValues.name : localValues.credencias[field as keyof typeof localValues.credencias]
    validateField(field, value)
  }, [localValues])

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    if (!value) {
      newErrors[field] = "Este campo é obrigatório"
    } else {
      delete newErrors[field]
    }
    setErrors(newErrors)
  }

  const handleSave = () => {
    // Validate all fields before saving
    validateField("name", localValues.name)
    validateField("appName", localValues.credencias.appName)
    validateField("source", localValues.credencias.source)
    validateField("webhook", localValues.credencias.webhook)
    validateField("apiKey", localValues.credencias.apiKey)

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return
    }

    onSave(localValues)
  }

  const handleCancel = () => {
    if (isEditing || Object.values(localValues).some((value) => value)) {
      if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
        onCancel()
      }
    } else {
      onCancel()
    }
  }

  const hasErrors = Object.values(errors).some((error) => error !== "")

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Configurações do WhatsApp
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="credentials" className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                Credenciais
              </TabsTrigger>
              <TabsTrigger value="webhook" className="flex items-center gap-1">
                <Link className="h-4 w-4" />
                Webhook
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                  <CardDescription>Configure as informações fundamentais da instância</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      Nome da Instância
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Nome único para identificar esta instância do WhatsApp</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: WhatsApp Suporte"
                      value={localValues.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appName" className="flex items-center gap-2">
                      Nome do App
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Nome do seu aplicativo registrado na plataforma WhatsApp Business</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <Input
                        id="appName"
                        placeholder="Ex: Meu App de Suporte"
                        value={localValues.credencias.appName || ""}
                        onChange={(e) => handleChange("appName", e.target.value)}
                        onBlur={() => handleBlur("appName")}
                        className={cn("pl-9", errors.appName && "border-destructive")}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </div>
                    </div>
                    {errors.appName && <p className="text-sm text-destructive">{errors.appName}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-600" />
                    Credenciais
                  </CardTitle>
                  <CardDescription>Configure as credenciais de acesso ao WhatsApp</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="source" className="flex items-center gap-2">
                      Número de Origem
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Número de telefone completo com código do país (formato internacional)</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <Input
                        id="source"
                        placeholder="Ex: +5511999999999"
                        value={localValues.credencias.source || ""}
                        onChange={(e) => handleChange("source", e.target.value)}
                        onBlur={() => handleBlur("source")}
                        className={cn("pl-9", errors.source && "border-destructive")}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Smartphone className="h-4 w-4" />
                      </div>
                    </div>
                    {errors.source && <p className="text-sm text-destructive">{errors.source}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="flex items-center gap-2">
                      API Key
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chave de API para autenticação com a plataforma WhatsApp</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        placeholder="Sua chave de API secreta"
                        value={localValues.credencias.apiKey || ""}
                        onChange={(e) => handleChange("apiKey", e.target.value)}
                        onBlur={() => handleBlur("apiKey")}
                        className={cn("pl-9 pr-10", errors.apiKey && "border-destructive")}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Key className="h-4 w-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.apiKey && <p className="text-sm text-destructive">{errors.apiKey}</p>}
                    <p className="text-xs text-muted-foreground">Mantenha esta chave em segredo</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhook" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link className="h-5 w-5 text-purple-600" />
                    Configuração do Webhook
                  </CardTitle>
                  <CardDescription>Configure o endpoint para receber notificações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook" className="flex items-center gap-2">
                      Webhook URL
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>URL para onde serão enviadas as notificações de mensagens recebidas</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <Input
                        id="webhook"
                        placeholder="Ex: https://meusite.com/api/webhook"
                        value={localValues.credencias.webhook || ""}
                        onChange={(e) => handleChange("webhook", e.target.value)}
                        onBlur={() => handleBlur("webhook")}
                        className={cn("pl-9", errors.webhook && "border-destructive")}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </div>
                    </div>
                    {errors.webhook && <p className="text-sm text-destructive">{errors.webhook}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="gap-1">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || hasErrors}
              className="gap-1"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
