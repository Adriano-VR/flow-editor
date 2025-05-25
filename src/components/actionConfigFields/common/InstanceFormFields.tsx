"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Save, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InstanceFormFieldsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: any
  onChange: (field: string, value: any) => void
  onSave?: () => void
  onCancel?: () => void
  title?: string
  isSaving?: boolean
  children: React.ReactNode
  validateField?: (field: string, value: any) => string
}

export function InstanceFormFields({
  open,
  onOpenChange,
  values,
  onChange,
  onSave,
  onCancel,
  title = "Configurações",
  isSaving = false,
  children,
  validateField,
}: InstanceFormFieldsProps) {
  const [localValues, setLocalValues] = useState(values)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setLocalValues(values)
  }, [values])

  const handleLocalChange = (field: string, value: any) => {
    if (validateField) {
      const error = validateField(field, value)
      setErrors((prev) => ({ ...prev, [field]: error }))
    }

    setLocalValues((prev: typeof values) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }
      }
      return {
        ...prev,
        [field]: value,
      }
    })
    onChange(field, value)
  }

  const handleSave = () => {
    if (Object.values(errors).some((error) => error !== "")) return
    onSave?.()
  }

  const handleCancel = () => {
    if (Object.values(localValues).some((value) => value)) {
      if (window.confirm("Tem certeza que deseja cancelar? Todas as alterações serão perdidas.")) {
        onCancel?.()
        onOpenChange(false)
      }
    } else {
      onCancel?.()
      onOpenChange(false)
    }
  }

  const hasErrors = Object.values(errors).some((error) => error !== "")

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-amber-100
        ">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {children}
          </div>

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