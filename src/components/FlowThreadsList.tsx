"use client"

import { useState, useEffect } from "react"
import type { Node, NodeData } from "@/types/node"
import type { Edge } from "@/types/flow"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Play,
  AlertCircle,
  Database,
  Webhook,
  Code,
  MessageCircle,
  Bot,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronRight,
  Search,
  X,
  Filter,
  MoreHorizontal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FlowThreadsListProps {
  nodes: Node[]
  edges: Edge[]
  activeNodeId?: string | null
  onNodeSelect?: (nodeId: string) => void
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onNodeEdit?: (nodeId: string) => void
  onNodeDelete?: (nodeId: string) => void
}

// Extend NodeData to include description
interface ExtendedNodeData extends NodeData {
  description?: string;
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case "trigger":
      return <Play className="h-4 w-4" />
    case "action":
      return <MessageSquare className="h-4 w-4" />
    case "condition":
      return <AlertCircle className="h-4 w-4" />
    case "database":
      return <Database className="h-4 w-4" />
    case "webhook":
      return <Webhook className="h-4 w-4" />
    case "api":
      return <Code className="h-4 w-4" />
    case "comment":
      return <MessageCircle className="h-4 w-4" />
    case "assistant":
      return <Bot className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getNodeStatus = (nodeId: string, activeNodeId: string | null | undefined) => {
  if (!activeNodeId) return null
  if (nodeId === activeNodeId) return "active"
  // You can add more status logic here based on your needs
  return null
}

const getNodeStatusIcon = (status: string | null) => {
  switch (status) {
    case "active":
      return <Loader2 className="h-3 w-3 animate-spin" />
    case "completed":
      return <CheckCircle2 className="h-3 w-3" />
    case "waiting":
      return <Clock className="h-3 w-3" />
    default:
      return null
  }
}

const getNodeStatusLabel = (status: string | null) => {
  switch (status) {
    case "active":
      return "Executando"
    case "completed":
      return "Concluído"
    case "waiting":
      return "Aguardando"
    default:
      return null
  }
}

const getNodeTypeColor = (type: string) => {
  switch (type) {
    case "trigger":
      return { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200", bgHover: "hover:bg-blue-50" }
    case "action":
      return { bg: "bg-green-100", text: "text-green-600", border: "border-green-200", bgHover: "hover:bg-green-50" }
    case "condition":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        border: "border-yellow-200",
        bgHover: "hover:bg-yellow-50",
      }
    case "database":
      return {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-200",
        bgHover: "hover:bg-purple-50",
      }
    case "webhook":
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        border: "border-indigo-200",
        bgHover: "hover:bg-indigo-50",
      }
    case "api":
      return { bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-200", bgHover: "hover:bg-cyan-50" }
    case "assistant":
      return {
        bg: "bg-violet-100",
        text: "text-violet-600",
        border: "border-violet-200",
        bgHover: "hover:bg-violet-50",
      }
    case "error":
      return { bg: "bg-red-100", text: "text-red-600", border: "border-red-200", bgHover: "hover:bg-red-50" }
    default:
      return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", bgHover: "hover:bg-slate-50" }
  }
}

export function FlowThreadsList({
  nodes,
  edges,
  activeNodeId,
  onNodeSelect,
  className,
  open,
  onOpenChange,
  onNodeEdit,
  onNodeDelete,
}: FlowThreadsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Alt + L to toggle the drawer
      if (event.altKey && event.key.toLowerCase() === "l") {
        onOpenChange?.(!open)
      }

      // Escape to close the drawer
      if (event.key === "Escape" && open) {
        onOpenChange?.(false)
      }

      // Search shortcut (Ctrl/Cmd + F when drawer is open)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f" && open) {
        event.preventDefault()
        document.getElementById("flow-search")?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [open, onOpenChange])

  // Build node connections map
  const nodeConnections = edges.reduce(
    (acc, edge) => {
      if (!acc[edge.source]) {
        acc[edge.source] = []
      }
      acc[edge.source].push(edge.target)
      return acc
    },
    {} as Record<string, string[]>,
  )

  // Sort nodes based on their connections and create a proper flow sequence
  const buildNodeSequence = () => {
    // Se não houver nós, retorna array vazio
    if (!nodes.length) return []

    // Find trigger nodes (usually the starting points)
    const triggerNodes = nodes.filter((node) => node.type === "trigger")
    const startNodes = triggerNodes.length > 0 ? triggerNodes : [nodes[0]]

    const sequence: Node[] = []
    const visited = new Set<string>()

    const traverseNodes = (nodeId: string) => {
      if (visited.has(nodeId)) return

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      visited.add(nodeId)
      sequence.push(node)

      const nextNodeIds = nodeConnections[nodeId] || []
      nextNodeIds.forEach((nextId) => traverseNodes(nextId))
    }

    startNodes.forEach((node) => traverseNodes(node.id))

    // Add any remaining nodes that weren't connected
    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        sequence.push(node)
      }
    })

    return sequence
  }

  const sortedNodes = buildNodeSequence()

  // Filter nodes based on search and type filter
  const filteredNodes = sortedNodes.filter((node) => {
    const nodeType = node.type || ''
    const matchesSearch =
      searchQuery === "" ||
      node.data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.data.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nodeType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === null || nodeType === filterType

    return matchesSearch && matchesFilter
  })

  // Get unique node types for filter
  const nodeTypes = Array.from(new Set(nodes.map((node) => node.type || '')))

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-96 mt-0 right-0 left-auto border-l">
        <DrawerHeader className="border-b px-4 py-3 sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">Sequência do Flow</DrawerTitle>
            <Badge variant="outline" className="ml-auto">
              {nodes.length} ações
            </Badge>
          </div>

          {nodes.length > 0 ? (
            <>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="flow-search"
                    placeholder="Buscar ações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9"
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-1">
                      <Filter className="h-4 w-4" />
                      {filterType ? filterType : "Filtrar"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType(null)}>Todos os tipos</DropdownMenuItem>
                    {nodeTypes.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => setFilterType(type || null)}>
                        {(type || '').charAt(0).toUpperCase() + (type || '').slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Alt</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">L</kbd>
                <span>para abrir/fechar</span>
                <span className="mx-1">•</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">F</kbd>
                <span>para buscar</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Adicione nós ao seu flow para começar
            </p>
          )}
        </DrawerHeader>

        <ScrollArea className="flex-1 h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-1">
            {nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                <h3 className="font-medium">Nenhuma ação encontrada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione nós ao seu flow para começar a construir sua sequência.
                </p>
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                <h3 className="font-medium">Nenhuma ação encontrada</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente ajustar os filtros ou a busca para encontrar o que procura.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType(null)
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            ) : (
              filteredNodes.map((node, index) => {
                const status = getNodeStatus(node.id, activeNodeId)
                const isActive = status === "active"
                const isExpanded = expandedNodeId === node.id
                const colors = getNodeTypeColor(node.type || '')
                const nextNode = index < filteredNodes.length - 1 ? filteredNodes[index + 1] : null
                const hasConnection = nodeConnections[node.id]?.length > 0

                return (
                  <div key={node.id} className="relative">
                    {/* Connection line to next node */}
                    {index < filteredNodes.length - 1 && hasConnection && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200 z-0" />
                    )}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative z-10">
                            <div
                              onClick={() => {
                                onNodeSelect?.(node.id)
                                setExpandedNodeId(isExpanded ? null : node.id)
                              }}
                              className={cn(
                                "w-full flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
                                isActive && "shadow-md",
                                colors.border,
                                colors.bgHover,
                                isActive && colors.bg + "/30",
                              )}
                            >
                              <div className="flex flex-col items-center">
                                <div className={cn("rounded-full p-2 flex-shrink-0", colors.bg, colors.text)}>
                                  {getNodeIcon(node.type || '')}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{node.data.label || node.data.name}</span>

                                  {status && (
                                    <Badge
                                      variant={status === "active" ? "default" : "secondary"}
                                      className={cn(
                                        "ml-auto flex items-center gap-1",
                                        status === "active" && "bg-green-500 hover:bg-green-500/90",
                                      )}
                                    >
                                      {getNodeStatusIcon(status)}
                                      {getNodeStatusLabel(status)}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center mt-1">
                                  <Badge variant="outline" className="text-xs font-normal">
                                    {(node.type || '').charAt(0).toUpperCase() + (node.type || '').slice(1)}
                                  </Badge>

                                  {(node.data as ExtendedNodeData).description && (
                                    <p className="text-xs text-muted-foreground truncate ml-2">
                                      {(node.data as ExtendedNodeData).description}
                                    </p>
                                  )}
                                </div>

                                {isExpanded && (node.data as ExtendedNodeData).description && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {(node.data as ExtendedNodeData).description}
                                  </p>
                                )}

                                {isExpanded && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onNodeSelect?.(node.id)
                                        onOpenChange?.(false)
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      Selecionar
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onNodeEdit?.(node.id)
                                      }}
                                    >
                                      Editar
                                    </Button>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                          }}
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation()
                                          // Add duplicate action here
                                        }}>
                                          Duplicar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation()
                                          // Add disable action here
                                        }}>
                                          Desativar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (window.confirm('Tem certeza que deseja remover este nó?')) {
                                              onNodeDelete?.(node.id)
                                            }
                                          }}
                                        >
                                          Remover
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-6 w-6 rounded-full transition-transform", isExpanded && "rotate-90")}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedNodeId(isExpanded ? null : node.id)
                                }}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-[250px]">
                          <p className="font-medium">{node.data.label || node.data.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(node.data as ExtendedNodeData).description || `Node do tipo ${node.type || ''}`}
                          </p>
                          {nodeConnections[node.id]?.length > 0 && (
                            <div className="mt-1 pt-1 border-t">
                              <p className="text-xs font-medium">Conectado a:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {nodeConnections[node.id].map((targetId) => {
                                  const targetNode = nodes.find((n) => n.id === targetId)
                                  return targetNode ? (
                                    <Badge key={targetId} variant="outline" className="text-xs">
                                      {targetNode.data.label || targetNode.data.name}
                                    </Badge>
                                  ) : null
                                })}
                              </div>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t px-4 py-3">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setFilterType(null)
                setExpandedNodeId(null)
              }}
            >
              Limpar filtros
            </Button>

            <DrawerClose asChild>
              <Button variant="ghost" size="sm">
                Fechar
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
