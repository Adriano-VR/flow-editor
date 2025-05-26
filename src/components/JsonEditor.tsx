"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Copy,
  ClipboardPaste,
  Download,
  AlertCircle,
  RefreshCw,
  Trash2,
  FileJson,
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Edge, Node } from "@/types/flow"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface JsonEditorProps {
  flowData: Node | null
  onSave: (json: string) => void
  onCreateFlow?: (nodes: Node[], edges: Edge[]) => void
  completeFlow?: { nodes: Node[]; edges: Edge[] }
}

export function JsonEditor({ flowData, onSave, onCreateFlow, completeFlow }: JsonEditorProps) {
  const [jsonInput, setJsonInput] = useState<string>(
    completeFlow ? JSON.stringify(completeFlow, null, 2) : flowData ? JSON.stringify(flowData, null, 2) : "",
  )
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isValidJson, setIsValidJson] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [lineCount, setLineCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Update stats when JSON changes
  useEffect(() => {
    setLineCount(jsonInput.split("\n").length)
    setCharacterCount(jsonInput.length)
  }, [jsonInput])

  const validateJson = useCallback((value: string) => {
    if (!value.trim()) {
      setError(null)
      setIsValidJson(true)
      return true
    }

    try {
      JSON.parse(value)
      setError(null)
      setIsValidJson(true)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "JSON inválido"
      setError(`Erro de sintaxe: ${errorMessage}`)
      setIsValidJson(false)
      return false
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonInput)
      toast({
        title: "✅ Copiado!",
        description: "JSON copiado para a área de transferência",
      })
    } catch (err) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive",
      })
    }
  }, [jsonInput, toast])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setJsonInput(text)
      const isValid = validateJson(text)
      if (isValid) {
        onSave(text)
        toast({
          title: "✅ Colado!",
          description: "JSON colado e validado com sucesso",
        })
      }
    } catch (err) {
      toast({
        title: "❌ Erro",
        description: "Não foi possível colar o conteúdo",
        variant: "destructive",
      })
    }
  }, [onSave, toast, validateJson])

  const handleCreateFlow = useCallback(() => {
    if (!isValidJson) {
      toast({
        title: "❌ JSON Inválido",
        description: "Corrija os erros antes de criar o flow",
        variant: "destructive",
      })
      return
    }

    try {
      const parsedJson = JSON.parse(jsonInput)
      if (parsedJson.nodes && parsedJson.edges && Array.isArray(parsedJson.nodes) && Array.isArray(parsedJson.edges)) {
        onCreateFlow?.(parsedJson.nodes, parsedJson.edges)
        setIsOpen(false)
        toast({
          title: "🎉 Flow Criado!",
          description: `Flow criado com ${parsedJson.nodes.length} nós e ${parsedJson.edges.length} conexões`,
        })
      } else {
        toast({
          title: "❌ Estrutura Inválida",
          description: "O JSON deve conter arrays 'nodes' e 'edges'",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "❌ Erro ao Criar Flow",
        description: "Verifique a estrutura do JSON",
        variant: "destructive",
      })
    }
  }, [jsonInput, isValidJson, onCreateFlow, toast])

  const handleExport = useCallback(() => {
    if (!isValidJson) {
      toast({
        title: "❌ Não é Possível Exportar",
        description: "Corrija os erros antes de exportar",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([jsonInput], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flow-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "📁 Exportado!",
      description: "Arquivo JSON baixado com sucesso",
    })
  }, [jsonInput, isValidJson, toast])

  const handleFormat = useCallback(() => {
    if (!isValidJson) {
      toast({
        title: "❌ Não é Possível Formatar",
        description: "Corrija os erros de sintaxe primeiro",
        variant: "destructive",
      })
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonInput(formatted)
      toast({
        title: "✨ Formatado!",
        description: "JSON formatado com indentação correta",
      })
    } catch (err) {
      toast({
        title: "❌ Erro na Formatação",
        description: "Não foi possível formatar o JSON",
        variant: "destructive",
      })
    }
  }, [jsonInput, isValidJson, toast])

  const handleClear = useCallback(() => {
    setJsonInput("")
    setError(null)
    setIsValidJson(true)
    toast({
      title: "🗑️ Limpo!",
      description: "Editor JSON foi limpo",
    })
  }, [toast])

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setJsonInput(value)
      validateJson(value)
    },
    [validateJson],
  )

  const getJsonPreview = useCallback(() => {
    if (!isValidJson || !jsonInput.trim()) return null

    try {
      const parsed = JSON.parse(jsonInput)
      const nodeCount = parsed.nodes?.length || 0
      const edgeCount = parsed.edges?.length || 0

      return {
        nodeCount,
        edgeCount,
        hasValidStructure: parsed.nodes && parsed.edges,
      }
    } catch {
      return null
    }
  }, [jsonInput, isValidJson])

  const preview = getJsonPreview()

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <FileJson className="h-4 w-4" />
          {!isValidJson && <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />}
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          "h-full right-0 top-0 bottom-0 rounded-r-lg rounded-l-none transition-all duration-300",
          isExpanded ? "w-[800px]" : "w-[500px]",
        )}
      >
        <div className="mx-auto w-full h-full flex flex-col">
          <DrawerHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Editor JSON
                  {isValidJson ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Válido
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Inválido
                    </Badge>
                  )}
                </DrawerTitle>
                <DrawerDescription>Edite o JSON para criar ou atualizar o flow</DrawerDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="shrink-0">
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {error && (
              <div className="m-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-destructive" />
                <div>
                  <div className="font-medium text-destructive mb-1">Erro de Validação</div>
                  <div className="text-sm text-destructive/80">{error}</div>
                </div>
              </div>
            )}

            {preview && showPreview && (
              <div className="m-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Preview do Flow</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Nós:</span>
                    <span className="ml-2 font-mono">{preview.nodeCount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Conexões:</span>
                    <span className="ml-2 font-mono">{preview.edgeCount}</span>
                  </div>
                </div>
                {!preview.hasValidStructure && (
                  <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                    ⚠️ Estrutura incompleta: adicione arrays 'nodes' e 'edges'
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="col-span-3 sm:col-span-1 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} disabled={!jsonInput} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePaste} className="flex-1">
                    <ClipboardPaste className="h-4 w-4 mr-2" />
                    Colar
                  </Button>
                </div>
                <div className="col-span-3 sm:col-span-1 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={!isValidJson || !jsonInput} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={!isValidJson || !jsonInput}
                    className="flex-1"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    Preview
                  </Button>
                </div>
                <div className="col-span-3 sm:col-span-1 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleFormat} disabled={!isValidJson} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Formatar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClear} disabled={!jsonInput} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Editor */}
              <div className="flex-1 min-h-0 relative flex flex-col">
                <ScrollArea className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={jsonInput}
                    onChange={handleTextareaChange}
                    placeholder="Cole ou digite seu JSON aqui..."
                    className={cn(
                      "w-full h-full min-h-[500px] resize-none rounded-lg border bg-background px-4 py-3 text-sm font-mono leading-relaxed",
                      "ring-offset-background placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      error && "border-destructive focus-visible:ring-destructive",
                      isValidJson && jsonInput && "border-green-300 focus-visible:ring-green-500",
                    )}
                  />
                </ScrollArea>

                {/* Stats */}
                <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                  <span>{lineCount} linhas</span>
                  <span>•</span>
                  <span>{characterCount} caracteres</span>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t bg-muted/30">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {isValidJson && jsonInput ? "JSON válido e pronto para uso" : "Aguardando JSON válido..."}
              </div>
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DrawerClose>
                <Button onClick={handleCreateFlow} disabled={!isValidJson || !jsonInput} className="min-w-[120px]">
                  {preview?.hasValidStructure ? "Criar Flow" : "Validar JSON"}
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
