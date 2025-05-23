"use client"

import { useState, useCallback, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, Eye, EyeOff, Info, Smartphone, Globe, Key, Save, X } from "lucide-react"
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

  const content = (
    <Card className="shadow-md md:h-9/12 w-full h-full flex flex-col">
      <CardContent className="pt-6 space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome da Instância
            </Label>
            {errors.name && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </span>
            )}
          </div>
          <Input
            id="name"
            placeholder="Ex: WhatsApp Suporte"
            value={localValues.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={cn(errors.name && "border-destructive")}
          />
          <p className="text-xs text-muted-foreground">Um nome único para identificar esta instância</p>
        </div>

        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="appName" className="text-sm font-medium">
                  Nome do App
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60 text-xs">Nome do seu aplicativo registrado na plataforma WhatsApp Business</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {errors.appName && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.appName}
                </span>
              )}
            </div>
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="source" className="text-sm font-medium">
                Número de Origem
              </Label>
              {errors.source && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.source}
                </span>
              )}
            </div>
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
            <p className="text-xs text-muted-foreground">
              Número de telefone completo com código do país (formato internacional)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="webhook" className="text-sm font-medium">
                  Webhook URL
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60 text-xs">
                        URL para onde serão enviadas as notificações de mensagens recebidas
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {errors.webhook && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.webhook}
                </span>
              )}
            </div>
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                API Key
              </Label>
              {errors.apiKey && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.apiKey}
                </span>
              )}
            </div>
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
            <p className="text-xs text-muted-foreground">Mantenha esta chave em segredo</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2 pb-4 px-6 bg-muted/20 mt-auto">
        <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1">
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || Object.keys(errors).length > 0}
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
      </CardFooter>
    </Card>
  )

  return content
}
