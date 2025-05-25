"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, Eye, EyeOff, Info, Smartphone, Globe, Key } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WhatsAppCredentials {
  provider: string
  appName: string
  source: string
  webhook: string
  apiKey: string
}

interface WhatsAppFieldsProps {
  values: {
    name: string
    credencias: WhatsAppCredentials
  }
  onChange: (field: string, value: string) => void
  errors: Record<string, string>
}

export function WhatsAppFields({ values, onChange, errors }: WhatsAppFieldsProps) {
  const [showApiKey, setShowApiKey] = useState(false)

  const basicFields = (
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
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
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
              value={values.credencias.appName || ""}
              onChange={(e) => onChange("appName", e.target.value)}
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
  )

  const credentialsFields = (
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
              value={values.credencias.source || ""}
              onChange={(e) => onChange("source", e.target.value)}
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
              value={values.credencias.apiKey || ""}
              onChange={(e) => onChange("apiKey", e.target.value)}
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
  )

  const webhookFields = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-600" />
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
              value={values.credencias.webhook || ""}
              onChange={(e) => onChange("webhook", e.target.value)}
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
  )

  return {
    basicFields,
    credentialsFields,
    webhookFields,
  }
}

export function validateWhatsAppField(field: string, value: string): string {
  if (!value) {
    return "Este campo é obrigatório"
  }
  return ""
} 