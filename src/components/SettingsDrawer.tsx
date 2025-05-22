import { useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Settings, Instance, Credentials } from "@/types/flow"
import {
  providers,
  instanceTypes,
  defaultSettings,
  validateSettings,
  getProvidersByCategory,
  type ValidationResult
} from "@/lib/settingsTypes"

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings | null
  onSave: (settings: Settings) => Promise<void>
}

export function SettingsDrawer({ open, onOpenChange, settings, onSave }: SettingsDrawerProps) {
  const { toast } = useToast()
  const [instances, setInstances] = useState<Instance[]>(settings?.instances || [])
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<keyof typeof instanceTypes>("messaging")

  const handleAddInstance = (provider: keyof typeof providers) => {
    const defaultInstance = defaultSettings[provider].instances?.[0]
    if (defaultInstance) {
      setInstances([...instances, defaultInstance])
    }
  }

  const handleRemoveInstance = (index: number) => {
    setInstances(instances.filter((_, i) => i !== index))
  }

  const handleInstanceChange = (index: number, field: keyof Instance, value: string) => {
    const newInstances = [...instances]
    if (field === "name") {
      newInstances[index] = { ...newInstances[index], name: value }
    }
    setInstances(newInstances)
  }

  const handleCredentialsChange = (index: number, field: keyof Credentials, value: string) => {
    const newInstances = [...instances]
    newInstances[index] = {
      ...newInstances[index],
      credencias: {
        ...newInstances[index].credencias,
        [field]: value,
      },
    }
    setInstances(newInstances)
  }

  const handleProviderChange = (index: number, provider: keyof typeof providers) => {
    const defaultInstance = defaultSettings[provider].instances?.[0]
    if (defaultInstance) {
      const newInstances = [...instances]
      newInstances[index] = {
        ...defaultInstance,
        name: instances[index].name || defaultInstance.name
      }
      setInstances(newInstances)
    }
  }

  const handleSave = async () => {
    const validation = validateSettings({ instances })
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de salvar",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      await onSave({ instances })
      toast({
        title: "Configurações salvas!",
        description: "As configurações foram atualizadas com sucesso",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  const categoryProviders = getProvidersByCategory(activeCategory)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Configurações do Flow</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-6">
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="messaging" onValueChange={(value) => setActiveCategory(value as keyof typeof instanceTypes)}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.entries(instanceTypes).map(([key, category]) => (
                <TabsTrigger key={key} value={key}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(instanceTypes).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Instâncias de {category.name}</h3>
                      <div className="flex gap-2">
                        {category.providers.map((provider) => (
                          <Button
                            key={provider}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddInstance(provider)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar {providers[provider].name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {instances
                      .filter((instance) => category.providers.includes(instance.credencias.provider))
                      .map((instance, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                style={{
                                  backgroundColor: providers[instance.credencias.provider as keyof typeof providers].color
                                }}
                              >
                                {providers[instance.credencias.provider as keyof typeof providers].name}
                              </Badge>
                              <h4 className="text-sm font-medium">Instância {index + 1}</h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveInstance(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`instance-name-${index}`}>Nome da Instância</Label>
                              <Input
                                id={`instance-name-${index}`}
                                value={instance.name}
                                onChange={(e) => handleInstanceChange(index, "name", e.target.value)}
                                placeholder="Digite o nome da instância"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`instance-provider-${index}`}>Provedor</Label>
                              <Select
                                value={instance.credencias.provider}
                                onValueChange={(value) => handleProviderChange(index, value as keyof typeof providers)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um provedor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categoryProviders.map((provider) => (
                                    <SelectItem key={provider.id} value={provider.id}>
                                      {provider.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {providers[instance.credencias.provider as keyof typeof providers].credentials.required.map((field) => (
                              <div key={field} className="space-y-2">
                                <Label htmlFor={`instance-${field}-${index}`}>
                                  {field.charAt(0).toUpperCase() + field.slice(1)}
                                  <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                  id={`instance-${field}-${index}`}
                                  type={field === "apiKey" ? "password" : "text"}
                                  value={instance.credencias[field as keyof Credentials] || ""}
                                  onChange={(e) => handleCredentialsChange(index, field as keyof Credentials, e.target.value)}
                                  placeholder={`Digite o ${field}`}
                                />
                              </div>
                            ))}

                            {providers[instance.credencias.provider as keyof typeof providers].credentials.optional.map((field) => (
                              <div key={field} className="space-y-2">
                                <Label htmlFor={`instance-${field}-${index}`}>
                                  {field.charAt(0).toUpperCase() + field.slice(1)}
                                </Label>
                                <Input
                                  id={`instance-${field}-${index}`}
                                  type={field === "apiKey" ? "password" : "text"}
                                  value={instance.credencias[field as keyof Credentials] || ""}
                                  onChange={(e) => handleCredentialsChange(index, field as keyof Credentials, e.target.value)}
                                  placeholder={`Digite o ${field} (opcional)`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                    {instances.filter((instance) => category.providers.includes(instance.credencias.provider)).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma instância configurada para {category.name}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DrawerFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
} 