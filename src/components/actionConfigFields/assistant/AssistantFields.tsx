"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Bot, Brain, Database, Settings, Thermometer, Clock, Wrench, Info, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

export interface AssistantCredentials {
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
  tools: any[]
}

const modelOptions = [
  { value: "gpt-4", label: "GPT-4", description: "Most capable model" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "Faster and more efficient" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Fast and cost-effective" },
  { value: "claude-3-opus", label: "Claude 3 Opus", description: "Anthropic's most capable model" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet", description: "Balanced performance" },
]

const retentionOptions = [
  { value: "1h", label: "1 hora" },
  { value: "1d", label: "1 dia" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
]

interface AssistantFieldsProps {
  values: {
    name?: string
    credencias: AssistantCredentials
  }
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

interface Tool {
  name: string
  description: string
}

export function AssistantFields({ values, onChange, errors }: AssistantFieldsProps) {
  const [newTool, setNewTool] = useState<Tool>({ name: "", description: "" })

  const addTool = () => {
    if (newTool.name.trim()) {
      const tool = {
        name: newTool.name.trim(),
        description: newTool.description.trim(),
        parameters: {},
      }
      const currentTools = Array.isArray(values.credencias.tools) ? values.credencias.tools : []
      onChange("tools", [...currentTools, tool])
      setNewTool({ name: "", description: "" })
    }
  }

  const removeTool = (index: number) => {
    const currentTools = Array.isArray(values.credencias.tools) ? values.credencias.tools : []
    const updatedTools = currentTools.filter((_, i) => i !== index)
    onChange("tools", updatedTools)
  }

  const basicFields = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
        <CardDescription>Configure as informações fundamentais do assistente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {values.name !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              Nome da Instância
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nome único para identificar esta instância do assistente</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="app" className="flex items-center gap-2">
            Nome do App
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Identificador da aplicação que utilizará este assistente</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="app"
            placeholder="minha-aplicacao"
            value={values.credencias.app || ""}
            onChange={(e) => onChange("app", e.target.value)}
            className={cn(errors.app && "border-red-500")}
          />
          {errors.app && <p className="text-sm text-red-500">{errors.app}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idassistente" className="flex items-center gap-2">
            ID do Assistente
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Identificador único do assistente na plataforma</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="idassistente"
            placeholder="asst_xxxxxxxxxx"
            value={values.credencias.idassistente || ""}
            onChange={(e) => onChange("idassistente", e.target.value)}
            className={cn(errors.idassistente && "border-red-500")}
          />
          {errors.idassistente && <p className="text-sm text-red-500">{errors.idassistente}</p>}
        </div>
      </CardContent>
    </Card>
  )

  const modelFields = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Configuração do Modelo
        </CardTitle>
        <CardDescription>Defina qual modelo de IA usar e seus parâmetros</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="model.name">Modelo de IA</Label>
          <Select
            value={values.credencias.model?.name || "gpt-3.5-turbo"}
            onValueChange={(value) => onChange("model.name", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-gray-500">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Temperatura: {values.credencias.model?.temperature ?? 0.7}
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Controla a criatividade das respostas (0 = conservador, 2 = criativo)</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Slider
            value={[values.credencias.model?.temperature ?? 0.7]}
            onValueChange={([value]) => onChange("model.temperature", value)}
            max={2}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Conservador</span>
            <span>Equilibrado</span>
            <span>Criativo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const memoryFields = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          Configuração de Memória
        </CardTitle>
        <CardDescription>Configure como o assistente gerencia informações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="memory.maxTokens" className="flex items-center gap-2">
            Máximo de Tokens
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Limite de tokens que o assistente pode processar por conversa</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="memory.maxTokens"
            type="number"
            min="100"
            max="100000"
            value={values.credencias.memory?.maxTokens ?? 2000}
            onChange={(e) => onChange("memory.maxTokens", Number(e.target.value))}
            className={cn(errors["memory.maxTokens"] && "border-red-500")}
          />
          {errors["memory.maxTokens"] && <p className="text-sm text-red-500">{errors["memory.maxTokens"]}</p>}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Período de Retenção
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Por quanto tempo as conversas ficam armazenadas</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Select
            value={values.credencias.memory?.retentionPeriod || "7d"}
            onValueChange={(value) => onChange("memory.retentionPeriod", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {retentionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )

  const toolsFields = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5 text-orange-600" />
          Ferramentas Disponíveis
        </CardTitle>
        <CardDescription>Configure as ferramentas que o assistente pode usar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nome da ferramenta"
            value={newTool.name}
            onChange={(e) => setNewTool((prev: Tool) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Descrição (opcional)"
            value={newTool.description}
            onChange={(e) => setNewTool((prev: Tool) => ({ ...prev, description: e.target.value }))}
          />
          <Button onClick={addTool} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {(Array.isArray(values.credencias.tools) ? values.credencias.tools : []).map((tool, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{tool.name}</div>
                {tool.description && <div className="text-sm text-gray-500">{tool.description}</div>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTool(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {(!Array.isArray(values.credencias.tools) || values.credencias.tools.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma ferramenta configurada</p>
            <p className="text-sm">Adicione ferramentas para expandir as capacidades do assistente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return {
    basicFields,
    modelFields,
    memoryFields,
    toolsFields,
  }
}

export function validateAssistantField(field: string, value: any): string {
  switch (field) {
    case "name":
      return !value || value.trim().length < 2 ? "Nome deve ter pelo menos 2 caracteres" : ""
    case "app":
      return !value || value.trim().length < 1 ? "Nome do app é obrigatório" : ""
    case "idassistente":
      return !value || value.trim().length < 1 ? "ID do assistente é obrigatório" : ""
    case "model.name":
      return !value ? "Modelo é obrigatório" : ""
    case "memory.maxTokens":
      return value < 100 || value > 100000 ? "Tokens deve estar entre 100 e 100.000" : ""
    default:
      return ""
  }
} 