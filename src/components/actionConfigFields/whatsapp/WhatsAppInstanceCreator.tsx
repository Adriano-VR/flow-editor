"use client"

import { Settings, Key, Link } from "lucide-react"
import { InstanceFormFields } from "../common/InstanceFormFields"
import { WhatsAppFields, validateWhatsAppField } from "./WhatsAppFields"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface WhatsAppCredentials {
  provider: string
  appName: string
  source: string
  webhook: string
  apiKey: string
}

interface WhatsAppInstanceCreatorProps {
  instance: {
    name: string
    credencias: WhatsAppCredentials
  }
  onChange: (field: string, value: string) => void
  isEditing?: boolean
  onSave: (instance: { name: string; credencias: WhatsAppCredentials }) => void
  onCancel: () => void
  isSaving?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
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
  const { basicFields, credentialsFields, webhookFields } = WhatsAppFields({
    values: instance,
    onChange,
    errors: {},
  })

  return (
    <InstanceFormFields
      open={open}
      onOpenChange={onOpenChange}
      values={instance}
      onChange={onChange}
      onSave={() => onSave(instance)}
      onCancel={onCancel}
      title="Configurações do WhatsApp"
      isSaving={isSaving}
      validateField={validateWhatsAppField}
    >
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
          {basicFields}
        </TabsContent>
        <TabsContent value="credentials" className="space-y-4">
          {credentialsFields}
        </TabsContent>
        <TabsContent value="webhook" className="space-y-4">
          {webhookFields}
        </TabsContent>
      </Tabs>
    </InstanceFormFields>
  )
}
