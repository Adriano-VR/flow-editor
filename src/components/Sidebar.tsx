"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import {
  Plus,
  Loader2,
  CheckCircle2,
  Search,
  Clock,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
  Star,
  StarOff,
  MoreHorizontal,
  Trash,
  Copy,
  Edit,
  ArrowUpDown,
} from "lucide-react"
import { useSearch } from "@/contexts/SearchContext"
import type { SidebarProps, Flow } from "@/types/sidebar"
import { useFlow } from "@/contexts/FlowContext"
import { NewFlowDialog } from "./NewFlowDialog"
import { cn } from "@/lib/utils"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"

export default function Sidebar({ onSelectFlow }: SidebarProps) {
  const { searchInput, setSearchInput } = useSearch()
  const { flows, selectedFlowId, setSelectedFlowId, isCreating, isLoading } = useFlow()
  const [showNewFlowDialog, setShowNewFlowDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest")
  const [favorites, setFavorites] = useState<string[]>([])
  const [localSearch, setLocalSearch] = useState(searchInput)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    published: true,
    draft: true,
    archived: false,
  })

  // Update local search when context search changes
  useEffect(() => {
    setLocalSearch(searchInput)
  }, [searchInput])

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchInput(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchInput])

  const handleFlowSelect = (flowId: string) => {
    setSelectedFlowId(flowId)
    onSelectFlow(flowId)
  }

  const toggleFavorite = (e: React.MouseEvent, flowId: string) => {
    e.stopPropagation()
    setFavorites((prev) => {
      if (prev.includes(flowId)) {
        return prev.filter((id) => id !== flowId)
      } else {
        return [...prev, flowId]
      }
    })
  }

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Sort and filter flows
  const getFilteredFlows = (): {
    favorites: Flow[];
    published: Flow[];
    draft: Flow[];
    archived: Flow[];
  } => {
    if (!flows) return {
      favorites: [],
      published: [],
      draft: [],
      archived: []
    }

    let filtered: Flow[] = flows.filter(
      (flow: Flow) => flow.attributes?.name?.toLowerCase().includes(localSearch.toLowerCase()) ?? false,
    )

    // Sort flows
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort((a: Flow, b: Flow) => Number(b.id) - Number(a.id))
        break
      case "oldest":
        filtered = filtered.sort((a: Flow, b: Flow) => Number(a.id) - Number(b.id))
        break
      case "name":
        filtered = filtered.sort((a: Flow, b: Flow) => {
          const nameA = a.attributes?.name?.toLowerCase() || ""
          const nameB = b.attributes?.name?.toLowerCase() || ""
          return nameA.localeCompare(nameB)
        })
        break
    }

    // Group by status
    const grouped = {
      favorites: filtered.filter((flow: Flow) => favorites.includes(flow.id)),
      published: filtered.filter((flow: Flow) => flow.attributes.status === "published"),
      draft: filtered.filter((flow: Flow) => flow.attributes.status === "draft"),
      archived: filtered.filter((flow: Flow) => flow.attributes.status !== "published" && flow.attributes.status !== "draft"),
    }

    return grouped
  }

  const groupedFlows: {
    favorites: Flow[];
    published: Flow[];
    draft: Flow[];
    archived: Flow[];
  } = getFilteredFlows()

  // Get the last updated time
  const getLastUpdated = (flow: Flow) => {
    const date = flow.attributes.updatedAt || flow.attributes.createdAt
    if (!date) return "Unknown"

    const updatedDate = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - updatedDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes}m ago`
      }
      return `${diffHours}h ago`
    }
    return `${diffDays}d ago`
  }

  // Render flow item based on view mode
  const renderFlowItem = (flow: Flow) => {
    const isFavorite = favorites.includes(flow.id)
    const isSelected = selectedFlowId === flow.id
    const lastUpdated = getLastUpdated(flow)

    if (viewMode === "grid") {
      return (
        <div
          key={flow.id}
          className={cn(
            "group relative p-4 rounded-lg border transition-all duration-200",
            "hover:border-primary/30 hover:shadow-sm",
            isSelected ? "border-primary bg-primary/5" : "border-border",
          )}
          onClick={() => handleFlowSelect(flow.id)}
        >
          <div className="absolute top-2 right-2 flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => toggleFavorite(e, flow.id)}
                  >
                    {isFavorite ? (
                      <Star className="h-3.5 w-3.5 text-yellow-400" />
                    ) : (
                      <StarOff className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">
                  {flow.attributes.name.charAt(0).toUpperCase() + flow.attributes.name.slice(1).toLowerCase()}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      flow.attributes.status === "published"
                        ? "default"
                        : flow.attributes.status === "draft"
                          ? "outline"
                          : "secondary"
                    }
                    className="text-[10px] px-1 h-4"
                  >
                    {flow.attributes.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        key={flow.id}
        className={cn(
          "group relative overflow-hidden transition-all duration-200 rounded-md cursor-pointer p-2",
          "hover:bg-accent/50",
          isSelected && "bg-accent/80 hover:bg-accent",
        )}
        onClick={() => handleFlowSelect(flow.id)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-1 flex-col items-start min-w-0 flex-1">
            <div className="flex items-center gap-2 w-full">
              {isSelected && (
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-200" />
              )}
              <span
                className={cn(
                  "font-medium text-sm transition-colors duration-200 truncate",
                  isSelected && "text-primary",
                )}
              >
                {flow.attributes.name.charAt(0).toUpperCase() + flow.attributes.name.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  flow.attributes.status === "published"
                    ? "default"
                    : flow.attributes.status === "draft"
                      ? "outline"
                      : "secondary"
                }
                className="text-[10px] px-1 h-4"
              >
                {flow.attributes.status}
              </Badge>
              <span
                className={cn(
                  "text-xs transition-colors duration-200 flex items-center",
                  isSelected ? "text-primary/70" : "text-muted-foreground",
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                {lastUpdated}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => toggleFavorite(e, flow.id)}>
                    {isFavorite ? (
                      <Star className="h-3.5 w-3.5 text-yellow-400" />
                    ) : (
                      <StarOff className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full animate-in slide-in-from-left-2 duration-200" />
        )}
      </div>
    )
  }

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
        <Search className="h-6 w-6 text-primary/60" />
      </div>
      <h3 className="font-medium text-sm">No flows found</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
        {localSearch ? "Try adjusting your search or create a new flow" : "Get started by creating your first flow"}
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowNewFlowDialog(true)}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        New Flow
      </Button>
    </div>
  )

  return (
    <>
      <aside className="w-72 h-screen flex flex-col border-r bg-background">
        <div className="flex-none p-3 border-b">
          <Button variant="default" className="w-full" onClick={() => setShowNewFlowDialog(true)} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                New Flow
              </>
            )}
          </Button>

          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flows..."
              className="pl-9 h-9"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => setLocalSearch("")}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="h-8 w-full grid-cols-2">
                  <TabsTrigger value="all" className="text-xs">
                    All Flows
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="text-xs">
                    Favorites
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8", viewMode === "list" && "text-primary")}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">List view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8", viewMode === "grid" && "text-primary")}
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Grid view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setSortBy("newest")} className="text-xs">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                    Newest first
                    {sortBy === "newest" && <CheckCircle2 className="h-3.5 w-3.5 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")} className="text-xs">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                    Oldest first
                    {sortBy === "oldest" && <CheckCircle2 className="h-3.5 w-3.5 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name")} className="text-xs">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                    Name (A-Z)
                    {sortBy === "name" && <CheckCircle2 className="h-3.5 w-3.5 ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className={cn("p-2", viewMode === "grid" && "grid grid-cols-2 gap-2")}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Loading flows...</span>
              </div>
            ) : !flows ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                  <Loader2 className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-medium text-sm">Error loading flows</h3>
                <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            ) : Object.values(groupedFlows).flat().length === 0 ? (
              renderEmptyState()
            ) : viewMode === "grid" ? (
              // Grid view - all flows together
              Object.values(groupedFlows)
                .flat()
                .map((flow) => renderFlowItem(flow))
            ) : (
              // List view with collapsible sections
              <>
                {/* Favorites section */}
                {groupedFlows.favorites.length > 0 && (
                  <div className="mb-2">
                    <Collapsible defaultOpen={true}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-400" />
                          Favorites
                          <Badge className="ml-2 h-4 text-[10px]">{groupedFlows.favorites.length}</Badge>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 transition-transform ui-open:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {groupedFlows.favorites.map((flow) => renderFlowItem(flow))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Published section */}
                {groupedFlows.published.length > 0 && (
                  <div className="mb-2">
                    <Collapsible
                      defaultOpen={expandedGroups.published}
                      onOpenChange={(open) => toggleGroup("published")}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                          Published
                          <Badge className="ml-2 h-4 text-[10px]">{groupedFlows.published.length}</Badge>
                        </div>
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", expandedGroups.published && "rotate-180")}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {groupedFlows.published.map((flow) => renderFlowItem(flow))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Draft section */}
                {groupedFlows.draft.length > 0 && (
                  <div className="mb-2">
                    <Collapsible defaultOpen={expandedGroups.draft} onOpenChange={(open) => toggleGroup("draft")}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                        <div className="flex items-center">
                          <Edit className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                          Drafts
                          <Badge className="ml-2 h-4 text-[10px]">{groupedFlows.draft.length}</Badge>
                        </div>
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", expandedGroups.draft && "rotate-180")}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {groupedFlows.draft.map((flow) => renderFlowItem(flow))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                {/* Archived section */}
                {groupedFlows.archived.length > 0 && (
                  <div className="mb-2">
                    <Collapsible defaultOpen={expandedGroups.archived} onOpenChange={(open) => toggleGroup("archived")}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                        <div className="flex items-center">
                          <Archive className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          Archived
                          <Badge className="ml-2 h-4 text-[10px]">{groupedFlows.archived.length}</Badge>
                        </div>
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", expandedGroups.archived && "rotate-180")}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {groupedFlows.archived.map((flow) => renderFlowItem(flow))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex-none p-3 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {flows?.length || 0} flow{flows?.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </aside>

      <NewFlowDialog
        open={showNewFlowDialog}
        onOpenChange={setShowNewFlowDialog}
        onOptionSelect={() => {
          setShowNewFlowDialog(false)
        }}
      />
    </>
  )
}

// Missing Archive icon
function Archive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}
