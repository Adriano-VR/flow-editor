"use client"

import { Bot, Brain, Database, Settings, Wrench } from "lucide-react"
import { InstanceFormFields } from "../common/InstanceFormFields"
import { AssistantFields, validateAssistantField } from "./AssistantFields"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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
  tools: any[]
}

interface AssistantFormFieldsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: {
    name?: string
    credencias: AssistantCredentials
  }
  onChange: (field: string, value: any) => void
  onSave?: () => void
  onCancel?: () => void
  title?: string
}

export function AssistantFormFields({
  open,
  onOpenChange,
  values,
  onChange,
  onSave,
  onCancel,
  title = "Configurações do Assistente",
}: AssistantFormFieldsProps) {
  const { basicFields, modelFields, memoryFields, toolsFields } = AssistantFields({
    values,
    onChange,
    errors: {},
  })

  return (
    <InstanceFormFields
      open={open}
      onOpenChange={onOpenChange}
      values={values}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
      title={title}
      validateField={validateAssistantField}
    >
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="model" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            Modelo
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            Memória
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1">
            <Wrench className="h-4 w-4" />
            Ferramentas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {basicFields}
        </TabsContent>
        <TabsContent value="model" className="space-y-4">
          {modelFields}
        </TabsContent>
        <TabsContent value="memory" className="space-y-4">
          {memoryFields}
        </TabsContent>
        <TabsContent value="tools" className="space-y-4">
          {toolsFields}
        </TabsContent>
      </Tabs>
    </InstanceFormFields>
  )
}
