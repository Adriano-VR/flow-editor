"use client"

import { useState, useImperativeHandle, forwardRef } from "react"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { IconRenderer } from "@/lib/IconRenderer"
import { getNodeCategories, type NodeTypeDefinition } from "@/lib/nodeTypes"
import { Input } from "@/components/ui/input"
import { DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Search, X, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NodeSelectionDrawerProps {
  onNodeSelect: (nodeType: NodeTypeDefinition) => void
}

export interface NodeSelectionDrawerRef {
  open: () => void
}

export const NodeSelectionDrawer = forwardRef<NodeSelectionDrawerRef, NodeSelectionDrawerProps>(
  ({ onNodeSelect }, ref) => {
    const categories = getNodeCategories()
    const appSubcategories = categories.app.subcategories
    const [open, setOpen] = useState(false)
    const [selectedAppKey, setSelectedAppKey] = useState<string | null>(null)
    const [, setActionConfig] = useState<Record<string, any>>({})
    const [selectedAction, setSelectedAction] = useState<any>(null)
    const [search, setSearch] = useState("")

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true)
        setSelectedAppKey(null)
        setSelectedAction(null)
        setActionConfig({})
      },
    }))

    // Descrições e vídeos por app (mantendo as originais)
    const appDescriptions: Record<string, { description: string }> = {
      whatsapp: {
        description:
          "Integre seu chatbot com o WhatsApp para engajar usuários, enviar mensagens automáticas e criar experiências conversacionais personalizadas.",
      },
      assistant: {
        description: "Crie agentes virtuais inteligentes e personalize suas capacidades.",
      },
      openai: {
        description: "Utilize modelos avançados da OpenAI para processamento de linguagem e geração de conteúdo.",
      },
      instagram: {
        description: "Automatize interações e postagens no Instagram.",
      },
      conversion: {
        description: "Ferramentas de conversão de texto, imagem, áudio e vídeo com IA.",
      },
      veo2: {
        description: "Gere vídeos automaticamente com o Veo2.",
      },
      klingai: {
        description: "Gere vozes realistas com Kling AI.",
      },
      elevenlabs: {
        description: "Text-to-Speech avançado com Eleven Labs.",
      },
    }

    // Lista de apps
    const appList = Object.entries(appSubcategories).map(([key, subcat]) => ({
      key,
      name: subcat.name,
      icon: subcat.actions[0]?.icon || "FaPuzzlePiece",
      color: subcat.color || "#888",
      description: appDescriptions[key]?.description || "",
      actions: subcat.actions,
    }))

    // Função utilitária para destacar o termo buscado
    function highlight(text: string, term: string) {
      if (!term) return text
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
      return (
        <span>
          {text.split(regex).map((part, i) =>
            regex.test(part) ? (
              <span key={i} className="bg-blue-100 text-blue-800 font-medium rounded px-1">
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </span>
      )
    }

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild></DrawerTrigger>
        <DrawerContent
          className="h-full flex min-w-4/12 flex-col bg-gradient-to-br from-slate-50 to-white max-w-3xl w-full sm:w-[640px] md:w-[768px] overflow-hidden"
          data-vaul-drawer-direction="right"
        >
          <DialogTitle className="sr-only">Seleção de Nó</DialogTitle>

          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-500" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>

          <div className="flex flex-col h-full">
            {/* Cabeçalho */}
            <div className="px-8 pt-6 pb-2 border-b border-slate-100">
              {!selectedAppKey && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Escolha um App</h2>
                    <p className="text-sm text-slate-500 mt-1">Selecione um app para adicionar ao seu fluxo</p>
                  </div>
                </div>
              )}

              {selectedAppKey && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedAppKey(null)}
                    className="h-10 w-10 rounded-full hover:bg-slate-100"
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                    <span className="sr-only">Voltar</span>
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedAppKey === "internal"
                        ? "Ações Internas"
                        : `Ações de ${appList.find((a) => a.key === selectedAppKey)?.name}`}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Selecione uma ação para adicionar ao seu fluxo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Barra de busca */}
            <div className="px-8 py-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar app, interno ou ação..."
                  className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-2 h-5 w-5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Limpar busca</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Lista inicial: apps, interno e ações/nodes filtradas juntos */}
            <ScrollArea className="flex-1 overflow-y-auto">
              {!selectedAppKey && !selectedAction && (
                <div className="px-8 py-4 space-y-4">
                  {(() => {
                    const searchLower = search.toLowerCase()
                    // Lista de apps/interno
                    const items = [
                      {
                        type: "internal",
                        key: "internal",
                        name: "Interno",
                        icon: "CgInternal",
                        color: categories.internal.color,
                        description: "Componentes Internos",
                        actions: categories.internal.actions.map((action) => ({
                          ...action,
                          parent: "internal",
                          parentName: "Interno",
                          parentIcon: "CgInternal",
                          parentColor: categories.internal.color,
                        })),
                      },
                      ...appList.map((app) => ({
                        type: "app",
                        key: app.key,
                        name: app.name,
                        icon: app.icon,
                        color: app.color,
                        description: app.description,
                        actions: app.actions.map((action) => ({
                          ...action,
                          parent: app.key,
                          parentName: app.name,
                          parentIcon: app.icon,
                          parentColor: app.color,
                        })),
                      })),
                    ]
                    // Apps/interno que batem
                    const filteredItems = items.filter(
                      (item) =>
                        item.name.toLowerCase().includes(searchLower) ||
                        item.description.toLowerCase().includes(searchLower),
                    )
                    // Todas as ações/nodes de todos
                    const allActions = items.flatMap((item) =>
                      item.actions.map((action) => ({
                        ...action,
                        parent: item.key,
                        parentName: item.name,
                        parentIcon: item.icon,
                        parentColor: item.color,
                      })),
                    )
                    // Ações/nodes que batem
                    const filteredActions = search.trim()
                      ? allActions.filter(
                          (action) =>
                            action.name.toLowerCase().includes(searchLower) ||
                            (action.label || "").toLowerCase().includes(searchLower),
                        )
                      : []

                    // Renderização
                    return (
                      <>
                        {filteredItems.length > 0 && (
                          <div className="space-y-3">
                            {search.trim() && (
                              <h3 className="text-sm font-medium text-slate-500 px-1">Apps e Categorias</h3>
                            )}
                            <div className="space-y-3">
                              {filteredItems.map((item) => (
                                <TooltipProvider key={item.key}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        className="w-full flex items-center p-4 hover:bg-slate-100 transition rounded-xl border border-slate-200 shadow-sm group"
                                        onClick={() => setSelectedAppKey(item.key)}
                                      >
                                        <div
                                          className="rounded-full h-12 w-12 flex items-center justify-center mr-4 transition-transform group-hover:scale-110"
                                          style={{ background: item.color }}
                                        >
                                          <IconRenderer iconName={item.icon || ""} className="text-white text-xl" />
                                        </div>
                                        <div className="flex-1 text-left">
                                          <div className="font-bold text-base text-slate-800">
                                            {highlight(item.name, search)}
                                          </div>
                                          <div className="text-sm text-slate-500 mt-1 line-clamp-2">
                                            {highlight(item.description, search)}
                                          </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-1" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      <p>Ver ações de {item.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Se houver apps/interno e ações, separa */}
                        {filteredItems.length > 0 && filteredActions.length > 0 && (
                          <div className="my-4 border-t border-slate-200" />
                        )}

                        {filteredActions.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-medium text-slate-500 px-1">Ações</h3>
                            <div className="space-y-3">
                              {filteredActions.map((action) => (
                                <button
                                  key={action.id + "-" + action.parent}
                                  className="w-full flex items-center p-4 hover:bg-slate-100 transition rounded-xl border border-slate-200 shadow-sm group"
                                  onClick={() => {
                                    setSelectedAction(action)
                                  }}
                                >
                                  <div
                                    className="rounded-full h-10 w-10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110"
                                    style={{
                                      background: action.color || appList.find((a) => a.key === action.parent)?.color,
                                    }}
                                  >
                                    <IconRenderer
                                      iconName={action.icon || action.parentIcon || ""}
                                      className="text-white text-xl"
                                    />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="font-bold text-base text-slate-800">
                                      {highlight(action.name, search)}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                      {highlight(action.label || "", search)}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="mt-2 text-xs font-normal bg-slate-50 text-slate-600"
                                    >
                                      {action.parentName}
                                    </Badge>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Se nada encontrado */}
                        {filteredItems.length === 0 && filteredActions.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                              <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">Nenhum resultado encontrado</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-md">
                              Tente buscar por outro termo ou navegue pelas categorias disponíveis
                            </p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Se for app, mostra as ações */}
              {selectedAppKey &&
                selectedAppKey !== "internal" &&
                !selectedAction &&
                (() => {
                  const app = appList.find((a) => a.key === selectedAppKey)
                  if (!app) return null
                  return (
                    <div className="px-8 py-4 space-y-4">
                      <div className="space-y-3">
                        {app.actions.map((action) => (
                          <button
                            key={action.id}
                            className="w-full flex items-center p-4 hover:bg-slate-100 transition rounded-xl border border-slate-200 shadow-sm group"
                            onClick={() => setSelectedAction(action)}
                          >
                            <div
                              className="rounded-full h-10 w-10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110"
                              style={{ background: action.color || app.color }}
                            >
                              <IconRenderer iconName={action.icon || app.icon} className="text-white text-xl" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-bold text-base text-slate-800">{highlight(action.name, search)}</div>
                              <div className="text-sm text-slate-500 mt-1">{highlight(action.label || "", search)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })()}

              {/* Se for interno, mostra os nodes internos */}
              {selectedAppKey === "internal" && !selectedAction && (
                <div className="px-8 py-4 space-y-4">
                  <div className="space-y-3">
                    {categories.internal.actions.map((internal) => (
                      <button
                        key={internal.id}
                        className="w-full flex items-center p-4 hover:bg-slate-100 transition rounded-xl border border-slate-200 shadow-sm group"
                        onClick={() => setSelectedAction(internal)}
                      >
                        <div
                          className="rounded-full h-10 w-10 flex items-center justify-center mr-4 transition-transform group-hover:scale-110"
                          style={{ background: internal.color || categories.internal.color }}
                        >
                          <IconRenderer iconName={internal.icon || ""} className="text-white text-xl" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-base text-slate-800">{highlight(internal.name, search)}</div>
                          <div className="text-sm text-slate-500 mt-1">{highlight(internal.label || "", search)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Se selecionou ação, dispara seleção */}
              {selectedAction &&
                (() => {
                  onNodeSelect(selectedAction)
                  setOpen(false)
                  setSelectedAction(null)
                  setSelectedAppKey(null)
                  setActionConfig({})
                  return null
                })()}
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    )
  },
)

NodeSelectionDrawer.displayName = "NodeSelectionDrawer"
