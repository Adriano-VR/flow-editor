"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { IconRenderer } from "@/lib/IconRenderer"
import { renderActionConfigFields } from "@/components/actionConfigFields"
import { X, Save, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface IntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: string
  name: string
  description: string
  videoUrl?: string
  config: Record<string, any>
  actionDefinition: any
  onSave: (config: Record<string, any>) => void
  isInternal?: boolean
}

export const IntegrationDialog = ({
  open,
  onOpenChange,
  icon,
  name,
  description,
  config,
  actionDefinition,
  onSave,
  isInternal,
}: IntegrationDialogProps) => {
  const [currentConfig, setCurrentConfig] = useState(config)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Inicializa com os valores do actionDefinition
    const defaultInput = actionDefinition?.input || { variables: [] };
    const defaultOutput = actionDefinition?.output || { text: '' };
    const defaultConfig = actionDefinition?.config || {};

    // Pega os valores atuais do config
    const { input: currentInput, output: currentOutput, config: currentConfig } = config || {};
    
    // Se estamos atualizando um nó existente, mantém os valores atuais
    // Se estamos criando um novo nó, usa os valores padrão
    const isUpdate = currentConfig && Object.keys(currentConfig).length > 0;
    
    setCurrentConfig({
      input: isUpdate ? (currentInput || defaultInput) : defaultInput,
      output: isUpdate ? (currentOutput || defaultOutput) : defaultOutput,
      config: isUpdate ? {
        ...defaultConfig,  // Mantém a estrutura padrão
        ...currentConfig   // Sobrescreve com valores atuais
      } : defaultConfig
    });
  }, [config, actionDefinition])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Pega os valores atuais
      const { input, output, config: nodeConfig } = currentConfig;
      
      // Salva mantendo a estrutura completa
      onSave({
        input: input || { variables: [] },
        output: output || { text: '' },
        config: {
          ...actionDefinition?.config, // Mantém a estrutura padrão
          ...nodeConfig // Sobrescreve com valores atuais
        }
      });
      
      setTimeout(() => {
        setIsSaving(false)
        onOpenChange(false)
      }, 500)
    } catch (error) {
      console.error("Error saving configuration:", error)
      setIsSaving(false)
    }
  }

  const getNodeColor = () => {
    if (isInternal) return "bg-purple-100 text-purple-700"

    // Determine color based on name or icon if available
    if (name.toLowerCase().includes("whatsapp")) return "bg-green-100 text-green-700"
    if (name.toLowerCase().includes("openai") || name.toLowerCase().includes("gpt")) return "bg-blue-100 text-blue-700"
    if (name.toLowerCase().includes("database")) return "bg-amber-100 text-amber-700"
    if (name.toLowerCase().includes("api")) return "bg-indigo-100 text-indigo-700"

    // Default color
    return "bg-slate-100 text-slate-700"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${getNodeColor()} flex items-center justify-center`}>
                <IconRenderer iconName={icon ?? ""} className="text-xl" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">{name}</DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
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
            {actionDefinition?.config && Object.keys(actionDefinition.config).length > 0 && (
              <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Configure os parâmetros necessários para este nó. Todos os campos são obrigatórios.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="[&_input]:border-slate-200 [&_input]:focus-visible:ring-blue-500 [&_input]:dark:border-slate-700 [&_input]:dark:bg-slate-800 [&_input]:dark:text-slate-200 [&_select]:border-slate-200 [&_select]:focus:ring-blue-500 [&_select]:dark:border-slate-700 [&_select]:dark:bg-slate-800 [&_select]:dark:text-slate-200 [&_textarea]:border-slate-200 [&_textarea]:focus-visible:ring-blue-500 [&_textarea]:dark:border-slate-700 [&_textarea]:dark:bg-slate-800 [&_textarea]:dark:text-slate-200 [&_label]:text-slate-700 [&_label]:dark:text-slate-300">
                {renderActionConfigFields(actionDefinition, currentConfig, setCurrentConfig, actionDefinition)}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Salvar</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Salvar configuração</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
