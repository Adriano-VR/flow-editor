"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  Trash,
  Save,
  Info,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Node } from "@/types/flow"
import { IconRenderer } from "@/lib/IconRenderer"
import { renderActionConfigFields } from "@/components/actionConfigFields"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingNode: Node | null
  onSave: (node: Node) => void
  onDelete: () => void
}

export function EditNodeDialog({ open, onOpenChange, editingNode, onSave, onDelete }: EditNodeDialogProps) {
  const { toast } = useToast()
  const [localNode, setLocalNode] = useState<Node | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (editingNode) {
      setLocalNode(editingNode)
    }
  }, [editingNode])

  if (!editingNode || !localNode) return null

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Remove credenciais do config se existirem
      const { credentials: configCredentials, ...configWithoutCredentials } = localNode.data.config || {};
      
      const updatedNode = {
        ...editingNode,
        data: {
          ...editingNode.data,
          ...localNode.data,
          config: configWithoutCredentials // Config sem credenciais
        }
      }
      
      await onSave(updatedNode)
      toast({
        title: "Nó atualizado!",
        description: (
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>As alterações foram salvas com sucesso</span>
          </div>
        ),
        className: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving node:", error)
      toast({
        title: "Erro ao salvar!",
        description: "Ocorreu um erro ao salvar as alterações. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete()
      toast({
        title: "Nó deletado!",
        description: (
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>O nó foi excluído com sucesso</span>
          </div>
        ),
        className: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting node:", error)
      toast({
        title: "Erro ao deletar",
        description: (
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Não foi possível excluir o nó</span>
          </div>
        ),
        variant: "destructive",
        className: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const isEndNode = localNode.data.label === "Fim"
  const isConditionNode = localNode.data.label === "Condição"



  const getNodeColor = () => {
    switch (localNode.data.name) {
      case "whatsapp":
        return "bg-green-100 text-green-700"
      case "openAi":
        return "bg-blue-100 text-blue-700"
      case "internal":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  // Encontra a definição do nó nos tipos de nó disponíveis
  const getActionDefinition = () => {
    // Constrói o actionDefinition no mesmo formato que o IntegrationDialog recebe
    return {
      id: localNode.id.split("-")[0], // Extrai o ID original da ação
      ...localNode.data,
      config: localNode.data.config || {},
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${getNodeColor()} flex items-center justify-center`}>
                <IconRenderer iconName={localNode.data.icon || 'FaWhatsapp'} className="text-xl" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {localNode.data.label}
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure as propriedades deste nó</p>
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
            {(isEndNode || isConditionNode) && (
              <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                <Info className="h-4 w-4" />
                <AlertDescription>Este nó só possui conexão de entrada</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {renderActionConfigFields({
                id: localNode.id.split("-")[0],
                name: localNode.data.name
              }, {
                input: localNode.data.input,
                output: localNode.data.output,
                config: localNode.data.config || {},
                credentials: localNode.data.credentials || {}
              }, (newConfig) => {
                // Simplifica a atualização para evitar aninhamento
                setLocalNode({
                  ...localNode,
                  data: {
                    ...localNode.data,
                    input: newConfig.input || localNode.data.input,
                    output: newConfig.output || localNode.data.output,
                    config: newConfig.config || localNode.data.config,
                    credentials: newConfig.credentials || localNode.data.credentials
                  }
                });
              }, getActionDefinition())}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Deletando...</span>
                    </>
                  ) : (
                    <>
                      <Trash className="h-4 w-4" />
                      <span>Deletar</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir permanentemente este nó</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
