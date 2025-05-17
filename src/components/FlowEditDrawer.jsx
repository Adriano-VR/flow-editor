"use client"

import { useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  AlertTriangle,
  PenLine,
  FileText,
  Info,
  CheckCircle2,
  Clock,
  Archive,
  Save,
  Trash2,
  X,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const FlowEditDrawer = ({ open, onOpenChange, flowData, onSave, onDelete }) => {
  const [name, setName] = useState(flowData?.name || "")
  const [description, setDescription] = useState(flowData?.description || "")
  const [status, setStatus] = useState(flowData?.status || "active")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave({ name, description, status })
    } catch (error) {
      console.error("Error saving flow:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete()
      setShowDeleteConfirm(false)
      window.location.reload()
    } catch (error) {
      console.error("Error deleting flow:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "archived":
        return <Archive className="h-4 w-4 text-slate-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "draft":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "archived":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (!open) return null

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="h-full flex-col bg-gradient-to-br from-slate-50 to-white min-w-4/12"
          data-vaul-drawer-direction="right"
        >
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-500" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>

          <DrawerHeader className="px-8 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <PenLine className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DrawerTitle className="text-2xl font-bold text-slate-800">Editar Flow</DrawerTitle>
                <p className="text-sm text-slate-500 mt-1">Atualize as informações do seu flow</p>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-8 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="flow-name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Nome
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="flow-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite o nome do flow"
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-slate-500">Nome único que identifica este flow</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flow-desc" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Descrição
                </Label>
                <Textarea
                  id="flow-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o flow"
                  rows={4}
                  className="resize-none border-slate-200 focus-visible:ring-blue-500"
                />
                <p className="text-xs text-slate-500">Uma breve descrição sobre o propósito deste flow</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flow-status" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  {getStatusIcon()}
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft" className="flex items-center">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span>Rascunho</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Ativo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-slate-500" />
                        <span>Arquivado</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${getStatusColor()} font-normal`}>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon()}
                      <span>
                        {status === "draft" && "Rascunho"}
                        {status === "active" && "Ativo"}
                        {status === "archived" && "Arquivado"}
                      </span>
                    </div>
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {status === "draft" && "O flow está em desenvolvimento"}
                    {status === "active" && "O flow está em execução"}
                    {status === "archived" && "O flow está arquivado"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="px-8 py-4 border-t border-slate-200 bg-white">
            <div className="flex justify-between items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Deletando...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Deletar Flow</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Excluir permanentemente este flow</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Tem certeza que deseja excluir este flow? Esta ação não pode ser desfeita e todos os dados associados
              serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-slate-200">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deletando...
                </>
              ) : (
                "Sim, deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default FlowEditDrawer
