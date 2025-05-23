"use client"

import React, { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Keyboard,
  Mouse,
  Command,
  Navigation,
  Edit3,
  Zap,
  Settings,
  HelpCircle,
  Copy,
  CheckCircle2,
  X,
  Star,
  BookOpen,
  Lightbulb,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface KeyboardShortcut {
  keys: string[]
  description: string
  category: string
  subcategory?: string
  platform?: "all" | "mac" | "windows"
  popular?: boolean
  tip?: string
}

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null)

  // Comprehensive shortcuts data
  const shortcuts: KeyboardShortcut[] = [
    // General shortcuts
    { keys: ["Ctrl", "S"], description: "Salvar flow", category: "general", popular: true },
    { keys: ["Ctrl", "K"], description: "Mostrar atalhos de teclado", category: "general", popular: true },
    { keys: ["/"], description: "Abrir menu de comandos", category: "general", popular: true },
    { keys: ["Alt", "L"], description: "Mostrar/esconder lista de threads", category: "general" },
    { keys: ["Alt", "M"], description: "Mostrar/esconder minimap", category: "general" },
    { keys: ["Ctrl", "Enter"], description: "Executar flow", category: "general", popular: true },
    { keys: ["Esc"], description: "Fechar diálogos e menus", category: "general" },
    { keys: ["F1"], description: "Mostrar ajuda", category: "general" },
    { keys: ["Ctrl", "N"], description: "Criar novo flow", category: "general" },
    { keys: ["Ctrl", "O"], description: "Abrir flow", category: "general" },
    { keys: ["Ctrl", "Shift", "S"], description: "Salvar como", category: "general" },

    // Navigation shortcuts
    { keys: ["Scroll"], description: "Zoom in/out", category: "navigation", subcategory: "Canvas" },
    { keys: ["Espaço", "Arrastar"], description: "Mover canvas", category: "navigation", subcategory: "Canvas" },
    { keys: ["Ctrl", "0"], description: "Ajustar visualização", category: "navigation", subcategory: "Canvas" },
    { keys: ["Ctrl", "+"], description: "Aumentar zoom", category: "navigation", subcategory: "Canvas" },
    { keys: ["Ctrl", "-"], description: "Diminuir zoom", category: "navigation", subcategory: "Canvas" },
    { keys: ["Click"], description: "Selecionar nó", category: "navigation", subcategory: "Seleção" },
    {
      keys: ["Shift", "Click"],
      description: "Selecionar múltiplos nós",
      category: "navigation",
      subcategory: "Seleção",
    },
    { keys: ["Ctrl", "A"], description: "Selecionar todos os nós", category: "navigation", subcategory: "Seleção" },
    { keys: ["Tab"], description: "Navegar entre elementos", category: "navigation" },
    { keys: ["Shift", "Tab"], description: "Navegar para trás", category: "navigation" },
    { keys: ["Arrow Keys"], description: "Mover nó selecionado", category: "navigation" },
    { keys: ["Ctrl", "F"], description: "Buscar no flow", category: "navigation" },

    // Editing shortcuts
    { keys: ["Delete"], description: "Remover nó selecionado", category: "editing", subcategory: "Nós" },
    { keys: ["Ctrl", "C"], description: "Copiar nó", category: "editing", subcategory: "Nós" },
    { keys: ["Ctrl", "V"], description: "Colar nó", category: "editing", subcategory: "Nós" },
    { keys: ["Ctrl", "D"], description: "Duplicar nó", category: "editing", subcategory: "Nós", popular: true },
    { keys: ["Ctrl", "Z"], description: "Desfazer", category: "editing", popular: true },
    { keys: ["Ctrl", "Y"], description: "Refazer", category: "editing", popular: true },
    { keys: ["Arrastar de handle"], description: "Criar conexão", category: "editing", subcategory: "Conexões" },
    { keys: ["Click na conexão"], description: "Remover conexão", category: "editing", subcategory: "Conexões" },
    { keys: ["Enter"], description: "Editar nó selecionado", category: "editing", subcategory: "Nós" },
    { keys: ["Ctrl", "G"], description: "Agrupar nós selecionados", category: "editing", subcategory: "Nós" },
    { keys: ["Ctrl", "Shift", "G"], description: "Desagrupar nós", category: "editing", subcategory: "Nós" },

    // Advanced shortcuts
    { keys: ["Ctrl", "Shift", "P"], description: "Paleta de comandos", category: "advanced" },
    { keys: ["Ctrl", "Shift", "E"], description: "Exportar flow", category: "advanced" },
    { keys: ["Ctrl", "Shift", "I"], description: "Importar flow", category: "advanced" },
    { keys: ["Ctrl", "R"], description: "Executar flow selecionado", category: "advanced" },
    { keys: ["Ctrl", "Shift", "R"], description: "Reiniciar execução", category: "advanced" },
    { keys: ["F5"], description: "Atualizar canvas", category: "advanced" },
    { keys: ["Ctrl", "B"], description: "Alternar sidebar", category: "advanced" },
    { keys: ["Ctrl", "J"], description: "Alternar console", category: "advanced" },
  ]

  // Filter shortcuts based on search and category
  const filteredShortcuts = useMemo(() => {
    let filtered = shortcuts

    if (searchQuery) {
      filtered = filtered.filter(
        (shortcut) =>
          shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shortcut.keys.some((key) => key.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((shortcut) => shortcut.category === selectedCategory)
    }

    return filtered
  }, [searchQuery, selectedCategory])

  // Group shortcuts by category and subcategory
  const groupedShortcuts = useMemo(() => {
    const grouped: Record<string, Record<string, KeyboardShortcut[]>> = {}

    filteredShortcuts.forEach((shortcut) => {
      const category = shortcut.category
      const subcategory = shortcut.subcategory || "Geral"

      if (!grouped[category]) {
        grouped[category] = {}
      }
      if (!grouped[category][subcategory]) {
        grouped[category][subcategory] = []
      }

      grouped[category][subcategory].push(shortcut)
    })

    return grouped
  }, [filteredShortcuts])

  // Get popular shortcuts
  const popularShortcuts = shortcuts.filter((shortcut) => shortcut.popular)

  // Copy shortcut to clipboard
  const copyShortcut = (shortcut: KeyboardShortcut) => {
    const shortcutText = `${shortcut.keys.join(" + ")}: ${shortcut.description}`
    navigator.clipboard.writeText(shortcutText)
    setCopiedShortcut(shortcut.description)
    setTimeout(() => setCopiedShortcut(null), 2000)
  }

  // Render keyboard shortcut
  const renderShortcut = (shortcut: KeyboardShortcut, showCategory = false) => (
    <div
      key={`${shortcut.category}-${shortcut.description}`}
      className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{shortcut.description}</span>
          {shortcut.popular && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Atalho popular</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {showCategory && (
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(shortcut.category)}
            </Badge>
          )}
        </div>
        {shortcut.tip && <p className="text-xs text-muted-foreground mt-1">{shortcut.tip}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {shortcut.keys.map((key, keyIndex) => (
            <React.Fragment key={keyIndex}>
              <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono font-medium">{key}</kbd>
              {keyIndex < shortcut.keys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
            </React.Fragment>
          ))}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyShortcut(shortcut)}
              >
                {copiedShortcut === shortcut.description ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Copiar atalho</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: "Geral",
      navigation: "Navegação",
      editing: "Edição",
      advanced: "Avançado",
    }
    return labels[category] || category
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      general: <Command className="h-4 w-4" />,
      navigation: <Navigation className="h-4 w-4" />,
      editing: <Edit3 className="h-4 w-4" />,
      advanced: <Zap className="h-4 w-4" />,
    }
    return icons[category] || <HelpCircle className="h-4 w-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <DialogTitle>Atalhos de Teclado</DialogTitle>
          </div>
          <DialogDescription>Domine estes atalhos para aumentar sua produtividade no editor de flows</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atalhos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Todos
              </Button>
              {["general", "navigation", "editing", "advanced"].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="gap-1.5"
                >
                  {getCategoryIcon(category)}
                  {getCategoryLabel(category)}
                </Button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="shortcuts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shortcuts" className="gap-2">
                <Keyboard className="h-4 w-4" />
                Atalhos
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-2">
                <Star className="h-4 w-4" />
                Populares
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Dicas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shortcuts" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                {filteredShortcuts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-medium">Nenhum atalho encontrado</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tente ajustar sua busca ou filtros para encontrar o que procura
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery("")}>
                      Limpar busca
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedShortcuts).map(([category, subcategories]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-4">
                          {getCategoryIcon(category)}
                          <h3 className="text-lg font-semibold">{getCategoryLabel(category)}</h3>
                          <Badge variant="outline" className="ml-auto">
                            {Object.values(subcategories).flat().length} atalhos
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {Object.entries(subcategories).map(([subcategory, shortcuts]) => (
                            <Card key={subcategory}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{subcategory}</CardTitle>
                                <CardDescription className="text-xs">
                                  {shortcuts.length} {shortcuts.length === 1 ? "atalho" : "atalhos"}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-1">{shortcuts.map((shortcut) => renderShortcut(shortcut))}</div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="popular" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Atalhos Mais Usados</h3>
                    <Badge variant="outline" className="ml-auto">
                      {popularShortcuts.length} atalhos
                    </Badge>
                  </div>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-1">
                        {popularShortcuts.map((shortcut) => renderShortcut(shortcut, true))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tips" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Dicas de Produtividade</h3>
                  </div>

                  <div className="grid gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Mouse className="h-4 w-4" />
                          Navegação Rápida
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <ul className="space-y-2">
                          <li>• Use a roda do mouse para fazer zoom no canvas</li>
                          <li>• Segure Espaço e arraste para mover o canvas rapidamente</li>
                          <li>• Clique duplo em um nó para editá-lo diretamente</li>
                          <li>• Use Ctrl + 0 para ajustar a visualização automaticamente</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          Edição Eficiente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <ul className="space-y-2">
                          <li>• Use Ctrl + D para duplicar nós rapidamente</li>
                          <li>• Selecione múltiplos nós com Shift + Click</li>
                          <li>• Use Ctrl + Z/Y para desfazer/refazer ações</li>
                          <li>• Pressione Delete para remover nós selecionados</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Fluxo de Trabalho
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <ul className="space-y-2">
                          <li>• Use / para abrir o menu de comandos rapidamente</li>
                          <li>• Pressione Ctrl + S frequentemente para salvar</li>
                          <li>• Use Ctrl + Enter para executar o flow atual</li>
                          <li>• Alt + L abre a lista de threads para navegação</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Personalização
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <ul className="space-y-2">
                          <li>• Configure atalhos personalizados nas configurações</li>
                          <li>• Use temas escuros/claros conforme sua preferência</li>
                          <li>• Ajuste o tamanho da fonte para melhor legibilidade</li>
                          <li>• Organize seus flows em pastas para melhor organização</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Pressione F1 para acessar a documentação completa</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
